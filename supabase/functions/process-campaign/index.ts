import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { Anthropic } from "https://esm.sh/@anthropic-ai/sdk@0.7.0";
import { google } from "https://esm.sh/googleapis@126.0.1";

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

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const anthropic = new Anthropic({ apiKey: anthropicApiKey });

async function findProfessorsWithPerplexity(interests: string[], universities: string[] = []): Promise<Professor[]> {
  const interestsStr = interests.join(", ");
  const universitiesStr = universities.length > 0 ? ` at ${universities.join(", ")}` : "";

  const prompt = `Find professors who research ${interestsStr}${universitiesStr}. For each professor, provide:
1. Full name
2. Email address
3. University
4. Department
5. Research areas

Format the response as a JSON array of objects with these fields:
{
  "name": "Professor's full name",
  "email": "professor@university.edu",
  "university": "University name",
  "department": "Department name",
  "researchAreas": ["Area 1", "Area 2", ...]
}

Only include professors whose email addresses are publicly available on their university website or department page.`;

  // Use Perplexity's REST API directly
  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${perplexityApiKey}`,
    },
    body: JSON.stringify({
      model: "sonar-medium-online",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that finds information about professors and their research interests.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  if (!content) {
    throw new Error("No response from Perplexity API");
  }

  return JSON.parse(content);
}

async function generatePersonalizedEmailWithClaude(template: string, professor: Professor): Promise<string> {
  const prompt = `You are an AI assistant helping a student write a personalized email to a professor.

Professor's Information:
- Name: ${professor.name}
- University: ${professor.university}
- Department: ${professor.department}
- Research Areas: ${professor.researchAreas.join(", ")}

Email Template:
${template}

Please generate a personalized version of this email template, replacing the placeholders with the professor's information. Make sure to:
1. Keep the overall structure and tone of the template
2. Make the email feel personal and specific to the professor's research
3. Maintain professionalism
4. Keep the email concise and focused

Return only the personalized email text, without any additional commentary or formatting.`;

  const response = await anthropic.messages.create({
    model: "claude-3-sonnet-20240229",
    max_tokens: 1000,
    temperature: 0.7,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return response.content[0].text;
}

async function sendEmail(accessToken: string, to: string, subject: string, body: string): Promise<void> {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  const message = [
    "Content-Type: text/plain; charset=UTF-8\n",
    "MIME-Version: 1.0\n",
    `To: ${to}\n`,
    "From: me\n",
    `Subject: ${subject}\n\n`,
    body,
  ].join("");

  const encodedMessage = btoa(message)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodedMessage,
    },
  });
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

    // Find professors
    const professors = await findProfessorsWithPerplexity(
      campaign.research_interests,
      campaign.target_universities
    );

    // Process each professor
    for (const professor of professors.slice(0, campaign.max_emails)) {
      try {
        // Generate personalized email
        const personalizedEmail = await generatePersonalizedEmailWithClaude(
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