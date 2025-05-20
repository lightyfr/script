import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const geminiApiKey = Deno.env.get("GEMINI_API_KEY") ?? "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);


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

// Real Gemini-powered personalized email generation
async function generatePersonalizedEmailWithGemini(template: string, professor: Professor): Promise<string> {
  const prompt = `You are an AI assistant helping a student write a personalized email to a professor.\n\nProfessor's Information:\n- Name: ${professor.name}\n- University: ${professor.university}\n- Department: ${professor.department}\n- Research Areas: ${professor.researchAreas.join(", ")}\n\nEmail Template:\n${template}\n\nPlease generate a personalized version of this email template, replacing the placeholders with the professor's information. Make sure to:\n1. Keep the overall structure and tone of the template\n2. Make the email feel personal and specific to the professor's research\n3. Maintain professionalism\n4. Keep the email concise and focused\n\nReturn only the personalized email text, without any additional commentary or formatting.`;
  return await callGemini(prompt);
}

async function getPublicResumeUrl(supabase: any, resumeUrl: string): Promise<string> {
  // If already public, return as is
  if (resumeUrl.startsWith('http')) return resumeUrl;
  // Otherwise, generate a signed URL (valid for 10 minutes)
  const { data, error } = await supabase.storage.from('student-resumes').createSignedUrl(resumeUrl, 600);
  if (error || !data?.signedUrl) throw new Error('Could not generate signed URL for resume');
  return data.signedUrl;
}

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

const BATCH_SIZE = 10; // Number of emails to process per invocation

serve(async (_req: Request) => {
      console.log("[process-pending-emails] Function invoked");
  try {
    // Get a batch of pending emails
    const { data: pendingEmails, error } = await supabase
      .from("pending_emails")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(BATCH_SIZE);
    if (error) throw new Error(`Failed to fetch pending emails: ${error.message}`);
    if (!pendingEmails || pendingEmails.length === 0) {
      return new Response(JSON.stringify({ success: true, processed: 0 }), {
        headers: { "Content-Type": "application/json" },
      });
    }
    for (const emailJob of pendingEmails) {
      try {
        // Get campaign and student info
        const { data: campaign } = await supabase
          .from("campaigns")
          .select("*")
          .eq("id", emailJob.campaign_id)
          .single();
        const { data: studentProfile } = await supabase
          .from("student_profiles")
          .select("resume_url")
          .eq("user_id", campaign.user_id)
          .single();
        const { data: oauthData } = await supabase
          .from("user_oauth_tokens")
          .select("access_token")
          .eq("user_id", campaign.user_id)
          .eq("provider", "gmail")
          .single();
        // Generate personalized email
        const personalizedEmail = await generatePersonalizedEmailWithResume(
          campaign.email_template,
          {
            name: emailJob.professor_name,
            email: emailJob.professor_email,
            university: emailJob.university,
            department: emailJob.department,
            researchAreas: emailJob.research_areas,
          },
          studentProfile?.resume_url || null,
          geminiApiKey,
          supabase
        );
        // Send email
        await sendEmail(
          oauthData.access_token,
          emailJob.professor_email,
          `Research Interest: ${emailJob.research_areas?.[0] || "Research"}`,
          personalizedEmail
        );
        // Mark as sent
        await supabase
          .from("pending_emails")
          .update({ status: "sent", sent_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          .eq("id", emailJob.id);
        // Log in email_logs
        await supabase.from("email_logs").insert({
          campaign_id: emailJob.campaign_id,
          student_id: campaign.user_id,
          sent_at: new Date().toISOString(),
          status: "sent",
          open_count: 0,
          tracking_id: null,
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        });
      } catch (err) {
        // Mark as failed
        await supabase
          .from("pending_emails")
          .update({ status: "failed", error_message: err instanceof Error ? err.message : "Unknown error", updated_at: new Date().toISOString() })
          .eq("id", emailJob.id);
      }
    }
    return new Response(JSON.stringify({ success: true, processed: pendingEmails.length }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
