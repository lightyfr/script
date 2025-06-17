import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const geminiApiKey = Deno.env.get("GEMINI_API_KEY") ?? "";

// Common words to exclude from keyword extraction
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'for', 'nor', 'with', 'in', 'on', 'at', 
  'to', 'from', 'by', 'of', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could',
  'can', 'may', 'might', 'must', 'shall', 'for', 'to', 'from', 'with', 'about',
  'into', 'through', 'during', 'before', 'after', 'above', 'below', 'under', 'over',
  'between', 'among', 'throughout', 'while', 'whereas', 'although', 'though', 'if',
  'unless', 'until', 'when', 'whenever', 'where', 'wherever', 'whether', 'which',
  'while', 'who', 'whom', 'whose', 'that', 'this', 'these', 'those'
]);

// Extract meaningful keywords from a string
function extractKeywords(text: string): string[] {
  if (!text) return [];
  
  // Convert to lowercase and split into words
  const words = text.toLowerCase()
    .replace(/[^\w\s-]/g, ' ')  // Remove punctuation
    .split(/\s+/);
  
  // Filter out stop words and short words
  return Array.from(new Set(words
    .filter(word => 
      word.length > 2 && 
      !STOP_WORDS.has(word) &&
      !/^\d+$/.test(word)
    )
  ));
}

// Extract keywords from an array of research interests
function getSearchKeywords(interests: string[]): string[] {
  if (!interests || !Array.isArray(interests)) return [];
  
  return Array.from(new Set(
    interests.flatMap(interest => {
      // First try to split by common delimiters if they exist
      const parts = interest.split(/[,\n\t;]|\band\b|\bor\b/);
      
      // If we have multiple parts, process each one
      if (parts.length > 1) {
        return parts.flatMap(part => extractKeywords(part));
      }
      
      // Otherwise process the whole string
      return extractKeywords(interest);
    })
  )).filter(Boolean);
}

// Feature flag to enable/disable scraped professors
const USE_SCRAPED_PROFESSORS = true;
// Percentage of emails to get from scraped professors (0-100)
const SCRAPED_PROFESSORS_RATIO = 0.5; // 50% from scraped, 50% from Gemini

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Find professors using semantic search with Supabase's built-in embeddings
async function findProfessorsWithSemanticSearch(
  interests: string[],
  universities: string[] = [],
  limit: number
): Promise<Array<{
  name: string;
  email: string;
  university: string;
  department: string;
  researchAreas: string[];
  similarity?: number;
}>> {
  try {
    // Generate embedding for the search query
    const searchText = interests.join(' ');
    const model = new Supabase.ai.Session('gte-small');
    const embedding = await model.run(searchText, {
      mean_pool: true,
      normalize: true,
    });

    if (!embedding) {
      console.error('Failed to generate embedding for search query');
      return [];
    }

    // Call the Supabase RPC function for vector search
    const { data: professors, error } = await supabase.rpc('query_scraped_professors', {
      embedding: embedding,
      match_count: limit,
      match_threshold: 0.5, // Adjust threshold as needed (0-1, higher is more strict)
    });

    if (error) {
      console.error('Error in semantic search:', error);
      return [];
    }

    console.log(`Found ${professors.length} professors using semantic search`);

    // Transform to match the expected format
    return professors.map((p: any) => ({
      name: p.name || 'Professor',
      email: p.email,
      university: p.university || 'Unknown University',
      department: p.department || 'Unknown Department',
      researchAreas: p.research_topics || [],
      similarity: p.similarity
    }));
  } catch (error) {
    console.error('Error in findProfessorsWithSemanticSearch:', error);
    return [];
  }
}

// Gemini API call helper (v1beta endpoint and body)
async function callGemini(prompt: string): Promise<string> {
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + geminiApiKey;
  const body = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ],
    tools: [
      {
        google_search: {}
      }
    ]
  };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.error(`Gemini API error: ${res.status} ${res.statusText} - ${errorText}`); 
    throw new Error(`Gemini API error: ${res.status} ${res.statusText} - ${errorText}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

// Helper to robustly extract a JSON array from a string (for Gemini output)
function extractJsonArray(text: string): string {
  const firstBracket = text.indexOf("[");
  const lastBracket = text.lastIndexOf("]");
  if (firstBracket === -1 || lastBracket === -1 || lastBracket < firstBracket) {
    throw new Error("No JSON array found in Gemini response");
  }
  return text.slice(firstBracket, lastBracket + 1);
}

// Helper: Get OpenAlex institution IDs for university names
async function getInstitutionIdsForNames(universities: string[]): Promise<string[]> {
  const ids: string[] = [];
  for (const name of universities) {
    const url = `https://api.openalex.org/institutions?filter=display_name.search:${encodeURIComponent(name)}`;
    console.log('[OpenAlex] Looking up institution:', name, url);
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`[OpenAlex] Institution lookup failed for ${name}: ${res.status} ${res.statusText}`);
      continue;
    }
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      // Use the first result's id
      ids.push(data.results[0].id);
      console.log(`[OpenAlex] Found institution ID for ${name}:`, data.results[0].id);
    } else {
      console.warn(`[OpenAlex] No institution found for ${name}`);
    }
  }
  return ids;
}

// OpenAlex API integration to find researchers (with institution ID filtering)
async function findProfessorsWithOpenAlex(interests: string[], universities: string[] = [], max_emails: number): Promise<any[]> {
  const baseUrl = 'https://api.openalex.org/works';
  let filter = ``;
  let institutionIds: string[] = [];
  if (universities.length > 0) {
    institutionIds = await getInstitutionIdsForNames(universities);
    if (institutionIds.length > 0) {
      filter += `authorships.institutions.id:${institutionIds.map(id => encodeURIComponent(id)).join('|')}`;
    } else {
      console.warn('[OpenAlex] No valid institution IDs found for provided universities.');
    }
  }
  const url = `${baseUrl}?filter=${filter}&search=${encodeURIComponent(interests.join(' '))}&per-page=${max_emails}`;
  console.log('[OpenAlex] Querying:', url);
  const res = await fetch(url);
  if (!res.ok) {
    const errorText = await res.text();
    console.error(`[OpenAlex] API error: ${res.status} ${res.statusText} - ${errorText}`);
    throw new Error(`[OpenAlex] API error: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  console.log('[OpenAlex] Response data:', data); // Log the entire response
  const authorsMap = new Map();
  for (const work of data.results || []) {
    console.log('[OpenAlex] Processing work:', work); // Log each work being processed
    for (const author of work.authorships || []) {
      console.log('[OpenAlex] Found author:', author); // Log each author found
      const email = author.author?.email || author.email || null;
      if (email) {
        authorsMap.set(email, {
          name: author.author?.display_name || author.author?.orcid || 'Unknown',
          email,
          university: (author.institutions && author.institutions[0]?.display_name) || 'Unknown',
          department: author.institutions && author.institutions[0]?.type || 'Unknown',
          researchAreas: work.concepts?.map((c: any) => c.display_name) || [],
        });
      }
    }
    if (authorsMap.size >= max_emails) break;
  }
  console.log('[OpenAlex] Found authors:', Array.from(authorsMap.values()));
  return Array.from(authorsMap.values());
}

// Robust Gemini-powered professor search with error handling
async function findProfessorsWithGemini(interests: string[], universities: string[] = [], max_emails: number): Promise<any[]> {
  const interestsStr = interests.join(", ");
  const universitiesStr = universities.length > 0 ? ` at ${universities.join(", ")}` : "";
  const prompt = `Find ${max_emails} professors who research ${interestsStr}${universitiesStr}.
  For each professor, provide:
  - Full name
  - Email address (must be publicly available on their university website or department page)
  - University
  - Department
  - Research areas (3-5 key areas)
  
  Write it in a JSON array with these fields:\n{\n  \"name\": \"Professor's full name\",\n  \"email\": \"professor@university.edu\",\n  \"university\": \"University name\",\n  \"department\": \"Department name\",\n  \"researchAreas\": [\"Area 1\", \"Area 2\", ...]\n}\n\n
  IMPORTANT: Output ONLY the JSON array. Do NOT include any explanation, commentary, or text before or after the JSON. Do not say anything else Do not leave any fields null. If you don't know the email address of a professor, dont include that professor in the list. Dont hallucinate and make up professors
  Only include professors with valid email addresses. If a professor's email is not publicly available, do not include them in the results.`;
     const response = await callGemini(prompt);
  let jsonStr: string;
  try {
    jsonStr = extractJsonArray(response);
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("[findProfessorsWithGemini] Failed to extract or parse JSON array from Gemini response:", e, response);
    return [];
  }
}

// Find professors from the scraped_professors table with semantic search fallback to keyword search
async function findProfessorsFromScraper(
  interests: string[],
  universities: string[] = [],
  limit: number
): Promise<Array<{
  name: string;
  email: string;
  university: string;
  department: string;
  researchAreas: string[];
}>> {
  // First try semantic search
  try {
    console.log('[findProfessorsFromScraper] Attempting semantic search...');
    const semanticResults = await findProfessorsWithSemanticSearch(interests, universities, limit);
    
    if (semanticResults.length > 0) {
      console.log(`[findProfessorsFromScraper] Found ${semanticResults.length} professors using semantic search`);
      return semanticResults;
    }
  } catch (semanticError) {
    console.warn('[findProfessorsFromScraper] Semantic search failed, falling back to keyword search:', semanticError);
  }

  // Fall back to keyword search if semantic search returns no results or fails
  console.log('[findProfessorsFromScraper] Falling back to keyword search');
  try {
    // Build the base query
    let query = supabase
      .from('scraped_professors')
      .select('*')
      .limit(limit);

    // Prepare search conditions
    const searchConditions: string[] = [];
    
    // Add search conditions for research interests if provided
    if (interests && interests.length > 0) {
      // Extract meaningful keywords from the interests
      const keywords = getSearchKeywords(interests);
      console.log('[findProfessorsFromScraper] Extracted keywords:', keywords);
      
      if (keywords.length === 0) {
        console.log('[findProfessorsFromScraper] No valid keywords extracted from interests');
        return [];
      }
      
      // For each keyword, create conditions that search in:
      // 1. research_topics array (case-insensitive partial match)
      // 2. summary text (case-insensitive partial match)
      // 3. department name (case-insensitive partial match)
      keywords.forEach(keyword => {
        // Skip very short keywords
        if (keyword.length < 3) return;
        
        // Escape special characters in the keyword for the query
        const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Search in research_topics array (case-insensitive partial match)
        searchConditions.push(`research_topics.cs.{*${escapedKeyword}*}`);
        
        // Search in summary text (case-insensitive partial match)
        searchConditions.push(`summary.ilike.%${escapedKeyword}%`);
        
        // Search in department name (case-insensitive partial match)
        searchConditions.push(`department.ilike.%${escapedKeyword}%`);
      });
      
      console.log('[findProfessorsFromScraper] Generated search conditions:', searchConditions);
      
      // Use 'or' to match any of the keywords in any field
      if (searchConditions.length > 0) {
        query = query.or(searchConditions.join(','));
      } else {
        console.log('[findProfessorsFromScraper] No valid search conditions after keyword processing');
        return [];
      }
    }

    // Add university filter if provided (case-insensitive partial match)
    if (universities && universities.length > 0) {
      const uniConditions = universities.map(uni => 
        `university.ilike.%${uni}%`
      );
      query = query.or(uniConditions.join(','));
    }

    console.log('[findProfessorsFromScraper] Executing keyword query with filters');
    
    // Execute the query
    const { data: professors, error } = await query;
    
    console.log(`[findProfessorsFromScraper] Keyword query returned ${professors?.length || 0} results`);

    if (error) {
      console.error('[findProfessorsFromScraper] Error querying scraped professors:', error);
      return [];
    }

    if (!professors || professors.length === 0) {
      console.log('[findProfessorsFromScraper] No professors found matching the criteria');
      return [];
    }

    // Define the professor type from the database
    interface ScrapedProfessor {
      name: string | null;
      email: string;
      university: string | null;
      department: string | null;
      research_topics: string[] | null;
      summary?: string | null;
    }

    // Transform the data to match the expected format
    return (professors as ScrapedProfessor[]).map(prof => ({
      name: prof.name || 'Professor',
      email: prof.email,
      university: prof.university || 'Unknown University',
      department: prof.department || 'Unknown Department',
      researchAreas: prof.research_topics || []
    }));
  } catch (error) {
    console.error('[findProfessorsFromScraper] Unexpected error in keyword search:', error);
    return [];
  }
}

// Modified main function to use OpenAlex first, then Gemini as fallback
serve(async (req: Request) => {
  const startTime = Date.now();
  try {
    const { data: campaign, error: campaignError } = await supabase
    .from("campaigns")
    .select("*")
    .eq("status", "pending_processing")
    .single()
    .limit(1);
    if (campaignError) {
      console.log(`[enqueue-campaign-emails] No campaigns found with status 'pending_processing'`);
      return new Response(JSON.stringify({ error: "No campaigns found with status 'pending_processing'" }), {
      });
    }
    const { error: campaignUpdateError } = await supabase.from("campaigns").update({ status: "queued" }).eq("id", campaign.id);

    if (campaignUpdateError) {
      console.error(`[enqueue-campaign-emails] Failed to update campaign status to 'queued':`, campaignUpdateError);
      throw new Error(`Failed to update campaign status: ${campaignUpdateError.message}`);
    }
    console.log(`[enqueue-campaign-emails] Found campaignId: ${campaign.id}`);
    // Get campaign details
    if (campaignError) {
      console.error(`[enqueue-campaign-emails] Failed to fetch campaign for id ${campaign.id}:`, campaignError);
      throw new Error(`Failed to fetch campaign: ${campaignError.message}`);
    }
    console.log(`[enqueue-campaign-emails] Campaign loaded:`, campaign);
    // Find professors from multiple sources
    let professors: Array<{
      name: string;
      email: string;
      university: string;
      department: string;
      researchAreas: string[];
    }> = [];
    
    // Calculate how many professors to get from each source
    const maxFromScraper = Math.floor(campaign.max_emails * SCRAPED_PROFESSORS_RATIO);
    const maxFromGemini = campaign.max_emails - maxFromScraper;
    
    // Get professors from scraper if enabled
    if (USE_SCRAPED_PROFESSORS && maxFromScraper > 0) {
      try {
        const scrapedProfessors = await findProfessorsFromScraper(
          campaign.research_interests,
          campaign.target_universities,
          maxFromScraper
        );
        professors = [...professors, ...scrapedProfessors];
        console.log(`[enqueue-campaign-emails] Found ${scrapedProfessors.length} professors from scraper`);
      } catch (error) {
        console.error('[enqueue-campaign-emails] Error getting professors from scraper:', error);
        // Continue with Gemini if scraper fails
      }
    }
    
    // Get remaining professors from Gemini
    if (maxFromGemini > 0) {
      try {
        const geminiProfessors = await findProfessorsWithGemini(
          campaign.research_interests,
          campaign.target_universities,
          maxFromGemini
        );
        professors = [...professors, ...geminiProfessors];
        console.log(`[enqueue-campaign-emails] Found ${geminiProfessors.length} professors from Gemini`);
      } catch (error) {
        console.error('[enqueue-campaign-emails] Error getting professors from Gemini:', error);
        if (professors.length === 0) {
          throw new Error('Failed to find professors from any source');
        }
      }
    }
    
    if (professors.length === 0) {
      throw new Error('No professors found from any source');
    }
    
    console.log(`[enqueue-campaign-emails] Found total of ${professors.length} professors to process`);

    // Prevent duplicate outreach: get all professor emails already contacted by this user in their campaigns
    const { data: userCampaigns, error: userCampaignsError } = await supabase
      .from("campaigns")
      .select("id")
      .eq("user_id", campaign.user_id);
    if (userCampaignsError) {
      console.error(`[enqueue-campaign-emails] Failed to fetch user's campaigns:`, userCampaignsError);
      throw new Error(`Failed to fetch user's campaigns: ${userCampaignsError.message}`);
    }
    const userCampaignIds = userCampaigns?.map((c: any) => c.id) || [];
    let alreadyContactedEmails: Set<string> = new Set();
    if (userCampaignIds.length > 0) {
      const { data: alreadyContacted, error: alreadyContactedError } = await supabase
        .from("pending_emails")
        .select("professor_email")
        .in("campaign_id", userCampaignIds);
      if (alreadyContactedError) {
        console.error(`[enqueue-campaign-emails] Failed to fetch already-contacted professors:`, alreadyContactedError);
        throw new Error(`Failed to fetch already-contacted professors: ${alreadyContactedError.message}`);
      }
      alreadyContactedEmails = new Set(alreadyContacted.map((row: any) => row.professor_email));
    }
    // Filter out professors with missing/empty emails and already contacted by this user in their campaigns
    const filteredProfessors = professors.filter((prof: any) => prof.email && !alreadyContactedEmails.has(prof.email));
    if (filteredProfessors.length === 0) {
      console.log(`[enqueue-campaign-emails] No new professors to contact after filtering duplicates and missing emails.`);
      return new Response(JSON.stringify({ success: true, count: 0, message: "No new professors to contact." }), {
        headers: { "Content-Type": "application/json" },
      });
    }
    // Insert a pending_emails row for each professor
    const inserts = filteredProfessors.slice(0, campaign.max_emails).map((prof: any) => ({
      campaign_id: campaign.id,
      professor_name: prof.name,
      professor_email: prof.email,
      university: prof.university,
      department: prof.department,
      research_areas: prof.researchAreas,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    console.log(`[enqueue-campaign-emails] Prepared inserts (after duplicate filter):`, inserts);
    const { error: insertError } = await supabase.from("pending_emails").insert(inserts);
    if (insertError) {
      console.error(`[enqueue-campaign-emails] Failed to insert pending_emails:`, insertError);
      throw new Error(`Failed to enqueue emails: ${insertError.message}`);
    }
    const duration = Date.now() - startTime;
    console.log(`[enqueue-campaign-emails] Execution time: ${duration} ms, processed campaignId: ${campaign.id}, inserted: ${inserts.length}`);
    return new Response(JSON.stringify({ success: true, count: inserts.length}), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[enqueue-campaign-emails] Error:`, error);
    console.log(`[enqueue-campaign-emails] Execution time (error): ${duration} ms`);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
