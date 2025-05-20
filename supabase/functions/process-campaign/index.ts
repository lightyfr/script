import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

// Define types
interface Professor {
  name: string;
  email: string;
  university: string;
  department: string;
  researchAreas: string[];
}

interface Campaign {
  id: string;
  user_id: string;
  research_interests: string[];
  target_universities: string[];
  email_template: string;
  max_emails: number;
  status: string;
}

// Get environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const perplexityApiKey = Deno.env.get("PERPLEXITY_API_KEY") ?? "";
const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
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

// Mocked function for testing without Gemini API (professor search)
async function mockFindProfessorsWithGemini(interests: string[], universities: string[] = []): Promise<Professor[]> {
  return [
    {
      name: "Dr. Alice Smith",
      email: "alice.smith@university.edu",
      university: universities[0] || "Test University",
      department: "Computer Science",
      researchAreas: interests,
    },
    {
      name: "Dr. Bob Johnson",
      email: "bob.johnson@university.edu",
      university: universities[1] || "Sample University",
      department: "Engineering",
      researchAreas: interests,
    },
  ];
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
async function findProfessorsWithGemini(interests: string[], universities: string[] = []): Promise<Professor[]> {
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

// Mocked function for testing without Gemini API (email generation)
async function mockGeneratePersonalizedEmailWithGemini(template: string, professor: Professor): Promise<string> {
  return `Dear ${professor.name},\n\nThis is a test email generated for ${professor.university} (${professor.department}) about: ${professor.researchAreas.join(", ")}.\n\nTemplate: ${template}\n\nBest regards,\nTest User`;
}

// Real Gemini-powered personalized email generation
async function generatePersonalizedEmailWithGemini(template: string, professor: Professor): Promise<string> {
  const prompt = `You are an AI assistant helping a student write a personalized email to a professor.\n\nProfessor's Information:\n- Name: ${professor.name}\n- University: ${professor.university}\n- Department: ${professor.department}\n- Research Areas: ${professor.researchAreas.join(", ")}\n\nEmail Template:\n${template}\n\nPlease generate a personalized version of this email template, replacing the placeholders with the professor's information. Make sure to:\n1. Keep the overall structure and tone of the template\n2. Make the email feel personal and specific to the professor's research\n3. Maintain professionalism\n4. Keep the email concise and focused\n\nReturn only the personalized email text, without any additional commentary or formatting.`;
  return await callGemini(prompt);
}

// Toggle this flag to use mocks for testing
const USE_MOCKS = false;

// Use mocks if enabled
const findProfessorsWithGeminiFinal = USE_MOCKS ? mockFindProfessorsWithGemini : findProfessorsWithGemini;
const generatePersonalizedEmailWithGeminiFinal = USE_MOCKS ? mockGeneratePersonalizedEmailWithGemini : generatePersonalizedEmailWithGemini;

// Mocked function for testing without sending real emails
async function mockSendEmail(accessToken: string, to: string, subject: string, body: string): Promise<void> {
  console.log(`Mock sendEmail called for: ${to}, subject: ${subject}`);
  // No actual sending
}

// Deno-compatible sendEmail using Gmail REST API
async function sendEmail(accessToken: string, to: string, subject: string, body: string): Promise<void> {
  const message = [
    "Content-Type: text/plain; charset=UTF-8\n",
    "MIME-Version: 1.0\n",
    `To: ${to}\n`,
    "From: me\n",
    `Subject: ${subject}\n\n`,
    body,
  ].join("");

  // Base64url encode
  const encodedMessage = btoa(message)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  console.log(`[sendEmail] Sending email to: ${to}, subject: ${subject}`);

  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw: encodedMessage }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`[sendEmail] Gmail API error for ${to}: ${res.status} ${res.statusText} - ${errorText}`);
    throw new Error(`Gmail API error: ${res.status} ${res.statusText} - ${errorText}`);
  } else {
    console.log(`[sendEmail] Email sent successfully to: ${to}`);
  }
}

serve(async (req: Request) => {
  let campaignId: string = "";
  try {
    const { campaignId: id } = await req.json();
    campaignId = id;

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();

    if (campaignError) {
      throw new Error(`Failed to fetch campaign: ${campaignError.message}`);
    }

    // Update campaign status to in_progress
    await supabase
      .from("campaigns")
      .update({ status: "in_progress" })
      .eq("id", campaignId);

    // Get user's Gmail access token
    const { data: oauthData, error: oauthError } = await supabase
      .from("user_oauth_tokens")
      .select("access_token")
      .eq("user_id", campaign.user_id)
      .eq("provider", "gmail")
      .single();

    if (oauthError || !oauthData?.access_token) {
      throw new Error("Gmail access token not found");
    }

    // Find professors (Gemini)
    const professors = await findProfessorsWithGeminiFinal(
      campaign.research_interests,
      campaign.target_universities
    );

    // Process each professor
    for (const professor of professors.slice(0, campaign.max_emails)) {
      try {
        // Generate personalized email (Gemini)
        const personalizedEmail = await generatePersonalizedEmailWithGeminiFinal(
          campaign.email_template,
          professor
        );

        // Send email
        await sendEmail(
          oauthData.access_token,
          professor.email,
          `Research Interest: ${professor.researchAreas[0]}`,
          personalizedEmail
        );

        // Record successful email
        await supabase.from("campaign_emails").insert({
          campaign_id: campaignId,
          professor_name: professor.name,
          professor_email: professor.email,
          university: professor.university,
          department: professor.department,
          research_areas: professor.researchAreas,
          email_content: personalizedEmail,
          status: "sent",
          sent_at: new Date().toISOString(),
        });
      } catch (error) {
        // Record failed email
        await supabase.from("campaign_emails").insert({
          campaign_id: campaignId,
          professor_name: professor.name,
          professor_email: professor.email,
          university: professor.university,
          department: professor.department,
          research_areas: professor.researchAreas,
          email_content: "",
          status: "failed",
          error_message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Update campaign status to completed
    await supabase
      .from("campaigns")
      .update({ status: "completed" })
      .eq("id", campaignId);

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing campaign:", error);

    // Update campaign status to failed
    if (campaignId) {
      await supabase
        .from("campaigns")
        .update({
          status: "failed",
          error_message: error instanceof Error ? error.message : "Unknown error",
        })
        .eq("id", campaignId);
    }

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});