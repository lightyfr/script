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
    ]
  };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errorText = await res.text();
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

// Real Gemini-powered professor search
async function findProfessorsWithGemini(interests: string[], universities: string[] = []): Promise<any[]> {
  const interestsStr = interests.join(", ");
  const universitiesStr = universities.length > 0 ? ` at ${universities.join(", ")}` : "";
  const prompt = `Find professors who research ${interestsStr}${universitiesStr}. For each professor, provide:\n1. Full name\n2. Email address\n3. University\n4. Department\n5. Research areas\n\nFormat the response as a JSON array of objects with these fields:\n{\n  \"name\": \"Professor's full name\",\n  \"email\": \"professor@university.edu\",\n  \"university\": \"University name\",\n  \"department\": \"Department name\",\n  \"researchAreas\": [\"Area 1\", \"Area 2\", ...]\n}\n\nOnly include professors whose email addresses are publicly available on their university website or department page.\n\nIMPORTANT: Output ONLY the JSON array. Do NOT include any explanation, commentary, or text before or after the JSON. Do not say anything else.`;
  const response = await callGemini(prompt);
  let jsonStr: string;
  try {
    jsonStr = extractJsonArray(response);
  } catch (e) {
    console.error("[findProfessorsWithGemini] Failed to extract JSON array from Gemini response:", response);
    throw e;
  }
  return JSON.parse(jsonStr);
}

// Import or define your findProfessorsWithGemini function here
// (You can copy it from your process-campaign function)

serve(async (req: Request) => {
  try {
    const { campaignId } = await req.json();
    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();
    if (campaignError) {
      throw new Error(`Failed to fetch campaign: ${campaignError.message}`);
    }
    // Find professors (Gemini)
    // You may want to use the same logic as before
    const professors = await findProfessorsWithGemini(
      campaign.research_interests,
      campaign.target_universities
    );
    // Insert a pending_emails row for each professor
    const inserts = professors.slice(0, campaign.max_emails).map((prof: any) => ({
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
    const { error: insertError } = await supabase.from("pending_emails").insert(inserts);
    if (insertError) {
      throw new Error(`Failed to enqueue emails: ${insertError.message}`);
    }
    // Update campaign status to 'queued'
    await supabase.from("campaigns").update({ status: "queued" }).eq("id", campaignId);
    return new Response(JSON.stringify({ success: true, count: inserts.length }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
