import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const geminiApiKey = Deno.env.get("GEMINI_API_KEY") ?? "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

// Modified main function to use OpenAlex first, then Gemini as fallback
serve(async (req: Request) => {
  const startTime = Date.now();
  try {
    let campaignId;
    try {
      const reqJson = await req.json();
      campaignId = reqJson.campaignId;
      console.log(`[enqueue-campaign-emails] Received campaignId: ${campaignId}`);
    } catch (parseErr) {
      console.error("[enqueue-campaign-emails] Failed to parse request JSON", parseErr);
      throw new Error("Invalid request body: must be JSON with campaignId");
    }
    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();
    if (campaignError) {
      console.error(`[enqueue-campaign-emails] Failed to fetch campaign for id ${campaignId}:`, campaignError);
      throw new Error(`Failed to fetch campaign: ${campaignError.message}`);
    }
    console.log(`[enqueue-campaign-emails] Campaign loaded:`, campaign);
    // Find professors (OpenAlex first, fallback to Gemini)
    let professors = [];
    try {
      console.log('[enqueue-campaign-emails] Trying to find professors with OpenAlex...');
      professors = await findProfessorsWithOpenAlex(
        campaign.research_interests,
        campaign.target_universities,
        campaign.max_emails
      );
      console.log('[enqueue-campaign-emails] Professors found with OpenAlex:', professors);
      
      // If no professors found with OpenAlex, try Gemini
      if (!professors || professors.length === 0) {
        console.log('[enqueue-campaign-emails] No professors found with OpenAlex, trying Gemini...');
        professors = await findProfessorsWithGemini(
          campaign.research_interests,
          campaign.target_universities,
          campaign.max_emails
        );
        console.log('[enqueue-campaign-emails] Professors found with Gemini:', professors);
      }
    } catch (e) {
      console.error('[enqueue-campaign-emails] OpenAlex search failed, falling back to Gemini:', e);
      professors = await findProfessorsWithGemini(
        campaign.research_interests,
        campaign.target_universities,
        campaign.max_emails
      );
      console.log('[enqueue-campaign-emails] Professors found with Gemini:', professors);
    }
    
    if (!professors || professors.length === 0) {
      throw new Error('No professors found with either OpenAlex or Gemini');
    }
    console.log(`[enqueue-campaign-emails] Found ${professors.length} professors to process`);

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
      campaign_id: campaignId,
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
    // Update campaign status to 'queued'
    const { error: updateError } = await supabase.from("campaigns").update({ status: "queued" }).eq("id", campaignId);
    if (updateError) {
      console.error(`[enqueue-campaign-emails] Failed to update campaign status to 'queued':`, updateError);
      throw new Error(`Failed to update campaign status: ${updateError.message}`);
    }
    const duration = Date.now() - startTime;
    console.log(`[enqueue-campaign-emails] Execution time: ${duration} ms, processed campaignId: ${campaignId}, inserted: ${inserts.length}`);
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
