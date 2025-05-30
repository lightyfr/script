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

// Helper to fetch a file as ArrayBuffer from a URL
async function fetchFileAsArrayBuffer(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch file: ${res.status} ${res.statusText}`);
  return await res.arrayBuffer();
}

// Helper to base64 encode an ArrayBuffer
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper to upload large PDF to Gemini File API and get file_uri
async function uploadPdfToGeminiFileApi(pdfBuffer: ArrayBuffer, displayName: string, geminiApiKey: string): Promise<string> {
  const BASE_URL = "https://generativelanguage.googleapis.com";
  const numBytes = pdfBuffer.byteLength;
  // Start resumable upload
  const startRes = await fetch(`${BASE_URL}/upload/v1beta/files?key=${geminiApiKey}`, {
    method: "POST",
    headers: {
      "X-Goog-Upload-Protocol": "resumable",
      "X-Goog-Upload-Command": "start",
      "X-Goog-Upload-Header-Content-Length": numBytes.toString(),
      "X-Goog-Upload-Header-Content-Type": "application/pdf",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ file: { display_name: displayName } }),
  });
  if (!startRes.ok) throw new Error("Failed to start Gemini file upload");
  const uploadUrl = startRes.headers.get("x-goog-upload-url");
  if (!uploadUrl) throw new Error("No upload URL from Gemini");
  // Upload the PDF bytes
  const uploadRes = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Content-Length": numBytes.toString(),
      "X-Goog-Upload-Offset": "0",
      "X-Goog-Upload-Command": "upload, finalize",
    },
    body: pdfBuffer,
  });
  if (!uploadRes.ok) throw new Error("Failed to upload PDF to Gemini");
  const fileInfo = await uploadRes.json();
  if (!fileInfo.file?.uri) throw new Error("No file_uri returned from Gemini");
  return fileInfo.file.uri;
}

// Helper to get a signed public URL for the resume if needed
async function getPublicResumeUrl(supabase: any, resumeUrl: string): Promise<string> {
  // If already public, return as is
  if (resumeUrl.startsWith('http')) return resumeUrl;
  // Otherwise, generate a signed URL (valid for 10 minutes)
  const { data, error } = await supabase.storage.from('student-resumes').createSignedUrl(resumeUrl, 600);
  if (error || !data?.signedUrl) throw new Error('Could not generate signed URL for resume');
  return data.signedUrl;
}

// Enhanced Gemini email generation with PDF resume context (fix prompt and ensure PDF is attached)
async function generatePersonalizedEmailWithResume(
  template: string,
  professor: Professor,
  resumeUrl: string | null,
  geminiApiKey: string,
  supabase: any
): Promise<string> {
  if (!resumeUrl) {
    // fallback to text-only prompt
    return await generatePersonalizedEmailWithGemini(template, professor);
  }
  // Ensure resumeUrl is public or signed
  const publicResumeUrl = await getPublicResumeUrl(supabase, resumeUrl);
  // Download the PDF
  const pdfBuffer = await fetchFileAsArrayBuffer(publicResumeUrl);
  const pdfSize = pdfBuffer.byteLength;
  const promptText = `You are an AI assistant helping a student write a personalized email to a professor.\n\nProfessor's Information:\n- Name: ${professor.name}\n- University: ${professor.university}\n- Department: ${professor.department}\n- Research Areas: ${professor.researchAreas.join(", ")}\n\nThe student's resume is attached as a PDF file. Use the attached resume to personalize the email.\n\nEmail Template:\n${template}\n\nPlease generate a personalized version of this email template, replacing the placeholders with the professor's information and using the student's resume as context. Make sure to:\n1. Actually extract and use relevant details from the attached PDF resume.\n2. Make the email feel personal and specific to the professor's research.\n3. Maintain professionalism.\n4. Keep the email concise and focused.\n\nReturn only the personalized email text, without any additional commentary or formatting.`;
  if (pdfSize < 20 * 1024 * 1024) { // <20MB
    const base64Pdf = arrayBufferToBase64(pdfBuffer);
    // Call Gemini with inline_data
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;
    const body = {
      contents: [
        {
          parts: [
            { inline_data: { mime_type: "application/pdf", data: base64Pdf } },
            { text: promptText }
          ]
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
      throw new Error(`Gemini API error (PDF inline): ${res.status} ${res.statusText} - ${errorText}`);
    }
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } else {
    // Use File API for large PDFs
    const fileUri = await uploadPdfToGeminiFileApi(pdfBuffer, "student_resume.pdf", geminiApiKey);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;
    const body = {
      contents: [
        {
          parts: [
            { text: promptText },
            { file_data: { mime_type: "application/pdf", file_uri: fileUri } }
          ]
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
      throw new Error(`Gemini API error (PDF file): ${res.status} ${res.statusText} - ${errorText}`);
    }
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  }
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

    // Fetch student profile to get resume_url
    const { data: studentProfile, error: studentProfileError } = await supabase
      .from("student_profiles")
      .select("resume_url")
      .eq("user_id", campaign.user_id)
      .single();
    if (studentProfileError) {
      throw new Error(`Failed to fetch student profile: ${studentProfileError.message}`);
    }
    const resumeUrl = studentProfile?.resume_url || null;

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
        // Generate personalized email (Gemini) with PDF resume context
        let personalizedEmail;
        if (resumeUrl) {
          personalizedEmail = await generatePersonalizedEmailWithResume(
            campaign.email_template,
            professor,
            resumeUrl,
            geminiApiKey,
            supabase
          );
        } else {
          personalizedEmail = await generatePersonalizedEmailWithGeminiFinal(
            campaign.email_template,
            professor
          );
        }

        // Send email
        await sendEmail(
          oauthData.access_token,
          professor.email,
          `Research Interest: ${professor.researchAreas[0]}`,
          personalizedEmail
        );

        // Record successful email in campaign_emails
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

        // Log email in email_logs table
        await supabase.from("email_logs").insert({
          campaign_id: campaignId,
          student_id: campaign.user_id,
          sent_at: new Date().toISOString(),
          status: "sent",
          open_count: 0,
          tracking_id: null,
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        });
      } catch (error) {
        // Record failed email in campaign_emails
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
        // Log failed email in email_logs table
        await supabase.from("email_logs").insert({
          campaign_id: campaignId,
          student_id: campaign.user_id,
          sent_at: new Date().toISOString(),
          status: "bounced",
          open_count: 0,
          tracking_id: null,
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
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