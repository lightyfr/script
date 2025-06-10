import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const geminiApiKey = Deno.env.get("GEMINI_API_KEY2") ?? "";
const geminiApiKey2 = Deno.env.get("GEMINI_API_KEY3") ?? "";
const geminiApiKey3 = Deno.env.get("GEMINI_API_KEY4") ?? "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
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

// Helper to base64 encode a UTF-8 string (for text data)
function utf8ToBase64(str: string): string {
  // Encode a JS string as base64, handling Unicode properly
  return btoa(unescape(encodeURIComponent(str)));
}

// Helper to base64 encode an ArrayBuffer (for binary data)
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
  professor: Professor,
  resumeUrl: string | null,
  geminiApiKey: string,
  supabase: any,
  studentInfo: { name: string; email: string }
): Promise<string> {
  // Compose a prompt for Gemini to write a fully personalized, natural email
  let promptText = `
  You are an AI assistant helping a student write a highly personalized, professional outreach email to a professor.
  
  Student Information:
  - Name: ${studentInfo.name}
  - Email: ${studentInfo.email}
  
  Professor's Information:
  - Name: ${professor.name}
  - University: ${professor.university}
  - Department: ${professor.department}
  - Research Areas: ${professor.researchAreas.join(", ")}
  
  The student's resume is provided below. Use the resume to extract and include specific, relevant skills, projects, and experiences.
  
  Write the email as if the student is writing it themselves, in a natural, engaging, and professional tone.
  
  Strict requirements:
  - Email needs to be short and concise, clearly label the ask and what the student can offer, offer data analysis help and show your not dead weight.
  - Do NOT leave any template language, placeholders, or instructions in the email.
  - Fill in every field with real, specific details from the resume and the professor's research.
  - Use clean whitespace and bullet points where appropriate.
  - Researchers are busy, so make your email short and to the point.
  - Mention a specific publication, project, or research area of the professor if possible.
  - Summarize 1-2 relevant skills and 1-2 relevant projects or experiences from the student's resume.
  - The email must be ready to send as-is, with all details filled in (no placeholders).
  - Do NOT include any commentary, instructions, or formatting outside the email body.
  - End with the student's real name and contact information in the signature.
  `;
  if (!resumeUrl) {
    // fallback to text-only prompt
    console.log('DEBUG: no resumeUrl, using text-only prompt');
    const email = await callGemini(promptText);
    return postProcessStudentPlaceholders(email, studentInfo);
  }
  // Ensure resumeUrl is public or signed
  const publicResumeUrl = await getPublicResumeUrl(supabase, resumeUrl);
  console.log('DEBUG: resumeUrl:', resumeUrl);
  console.log('DEBUG: publicResumeUrl:', publicResumeUrl);
  // Detect content type
  const headRes = await fetch(publicResumeUrl, { method: "HEAD" });
  const contentType = headRes.headers.get("content-type") || "";
  console.log('DEBUG: contentType:', contentType);
  if (contentType.toLowerCase().startsWith("text/plain")) {
    // Fetch as text and include in prompt
    const textRes = await fetch(publicResumeUrl);
    console.log('DEBUG: textRes status:', textRes.status);
    if (!textRes.ok) throw new Error(`Failed to fetch text resume: ${textRes.status} ${textRes.statusText}`);
    const resumeText = await textRes.text();
    console.log('DEBUG: resumeText preview:', resumeText.slice(0, 200));
    if (contentType.toLowerCase().includes("charset=utf-8")) {
      // If resume is UTF-8, base64 encode and send as inline_data
      const base64Text = utf8ToBase64(resumeText);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;
      const body = {
        systemInstruction: "You are an AI assistant helping a student write a highly personalized, professional outreach email to a professor. You are given a student's resume and a professor's information. You need to write a personalized email to the professor based on the student's resume and the professor's information. NO PLACEHOLDERS ALLOWED.",
        contents: [
          {
            parts: [
              { inline_data: { mime_type: "text/plain", data: base64Text } },
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
        throw new Error(`Gemini API error (text inline): ${res.status} ${res.statusText} - ${errorText}`);
      }
      const data = await res.json();
      const email = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      return postProcessStudentPlaceholders(email, studentInfo);
    } else {
      // Otherwise, send as plain text in the prompt
      const textPrompt = `${promptText}\n\n---\n\nStudent Resume (plain text):\n${resumeText}\n\n---\n`;
      const email = await callGemini(textPrompt);
      return postProcessStudentPlaceholders(email, studentInfo);
    }
  }
  // Download the PDF (default/fallback)
  const pdfBuffer = await fetchFileAsArrayBuffer(publicResumeUrl);
  const pdfSize = pdfBuffer.byteLength;
  if (pdfSize < 20 * 1024 * 1024) { // <20MB
    const base64Pdf = arrayBufferToBase64(pdfBuffer);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;
    const body = {
      systemInstruction: "You are an AI assistant helping a student write a highly personalized, professional outreach email to a professor. You are given a student's resume and a professor's information. You need to write a personalized email to the professor based on the student's resume and the professor's information. NO PLACEHOLDERS ALLOWED.",
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
    const email = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return postProcessStudentPlaceholders(email, studentInfo);
  } else {
    // Use File API for large PDFs
    const fileUri = await uploadPdfToGeminiFileApi(pdfBuffer, "student_resume.pdf", geminiApiKey);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;
    const body = {
      systemInstruction: "You are an AI assistant helping a student write a highly personalized, professional outreach email to a professor. You are given a student's resume and a professor's information. You need to write a personalized email to the professor based on the student's resume and the professor's information. NO PLACEHOLDERS ALLOWED.",
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
    const email = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return postProcessStudentPlaceholders(email, studentInfo);
  }
}

function postProcessStudentPlaceholders(email: string, studentInfo: { name: string; email: string; phone?: string | null }): string {
  let result = email;
  result = result.replace(/\[Student Name\]/gi, studentInfo.name);
  result = result.replace(/\[Student Email\]/gi, studentInfo.email);
  if (studentInfo.phone) {
    result = result.replace(/\[Student Phone Number( \(Optional\))?\]/gi, studentInfo.phone);
  }
  return result;
}

// Helper to get a valid Gmail access token, refreshing if needed
async function getValidGmailAccessToken(supabase: any, userId: string): Promise<string> {
  // Fetch token info
  const { data, error } = await supabase
    .from('user_oauth_tokens')
    .select('access_token, refresh_token, expires_at')
    .eq('user_id', userId)
    .eq('provider', 'gmail')
    .single();
  if (error || !data) throw new Error('No Gmail token found');
  let { access_token, refresh_token, expires_at } = data;
  let isExpired = false;
  if (expires_at) {
    const expiry = new Date(expires_at).getTime();
    isExpired = Date.now() > expiry - 2 * 60 * 1000;
  }
  if (isExpired && refresh_token) {
    // Refresh using Google OAuth endpoint
    const params = new URLSearchParams({
      client_id: Deno.env.get('GOOGLE_CLIENT_ID') ?? '',
      client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') ?? '',
      refresh_token,
      grant_type: 'refresh_token',
    });
    const resp = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error('Failed to refresh Gmail access token: ' + errText);
    }
    const json = await resp.json();
    if (!json.access_token) throw new Error('No access_token returned from refresh');
    access_token = json.access_token;
    expires_at = json.expires_in ? new Date(Date.now() + json.expires_in * 1000).toISOString() : null;
    // Update Supabase
    await supabase
      .from('user_oauth_tokens')
      .update({
        access_token,
        expires_at,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('provider', 'gmail');
  }
  return access_token;
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
    // Track unique campaign_ids processed in this batch
    const processedCampaignIds = new Set<string>();
    for (const [i, emailJob] of pendingEmails.entries()) {
      processedCampaignIds.add(emailJob.campaign_id);
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
        const { data: userInfo } = await supabase
          .from("users")
          .select("firstName, lastName, email")
          .eq("id", campaign.user_id)
          .single();
        const { data: oauthData } = await supabase
          .from("user_oauth_tokens")
          .select("access_token")
          .eq("user_id", campaign.user_id)
          .eq("provider", "gmail")
          .single();
        // Compose student info for signature
        const studentName = userInfo?.firstName && userInfo?.lastName ? `${userInfo.firstName} ${userInfo.lastName}` : userInfo?.firstName || userInfo?.lastName || "";
        const studentEmail = userInfo?.email || "";
        const studentPhone = studentProfile?.phone || null;
        // Get a valid Gmail access token (refresh if needed)
        const accessToken = await getValidGmailAccessToken(supabase, campaign.user_id);
        // Alternate API keys
        const apiKeys = [geminiApiKey, geminiApiKey2, geminiApiKey3];
        const apiKeyToUse = apiKeys[i % 3];
        // Generate personalized email
        const personalizedEmail = await generatePersonalizedEmailWithResume(
          {
            name: emailJob.professor_name,
            email: emailJob.professor_email,
            university: emailJob.university,
            department: emailJob.department,
            researchAreas: emailJob.research_areas,
          },
          studentProfile?.resume_url || null,
          apiKeyToUse,
          supabase,
          { name: studentName, email: studentEmail }
        );
        // Send email
        await sendEmail(
          accessToken,
          emailJob.professor_email,
          `Research Opportunity Inquiry - ${emailJob.research_areas?.[0] || "Research"}`,
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
    // After processing, check for each campaign if all emails are done, and call finalize-campaign if so
    for (const campaignId of processedCampaignIds) {
      // Check if any pending emails remain for this campaign
      const { count, error: countError } = await supabase
        .from("pending_emails")
        .select("id", { count: "exact", head: true })
        .eq("campaign_id", campaignId)
        .in("status", ["pending"]);
      if (!countError && count === 0) {
        // Call finalize-campaign edge function
        try {
          await fetch("https://jsldybdbxojaugvnlklz.supabase.co/functions/v1/finalize-campaign", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${supabaseAnonKey}`
            },
            body: JSON.stringify({ campaignId }),
          });
        } catch (finalizeError) {
          console.error(`[finalize-campaign] Error finalizing campaign ${campaignId}:`, finalizeError);
        }
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
