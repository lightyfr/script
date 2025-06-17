import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const geminiApiKey = Deno.env.get("GEMINI_API_KEY2") ?? "";
const geminiApiKey2 = Deno.env.get("GEMINI_API_KEY3") ?? "";
const geminiApiKey3 = Deno.env.get("GEMINI_API_KEY4") ?? "";
const geminiApiKey4 = Deno.env.get("GEMINI_API_KEY5") ?? "";
const geminiApiKey5 = Deno.env.get("GEMINI_API_KEY6") ?? "";
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

  Whatever you generate are final emails sent to proffessors, so you must be careful not to have any placeholders or instructions in the email.
  
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
  - Do NOT include any phrases insinuating you are a generated response like "Okay here is your response" or "Here is your email"
  - End with the student's real name and contact information in the signature.
  - Markdown is not supported
  - Do NOT include a subject line in your response
  - Must not contain characters outside of the Latin1 range.
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
interface SendEmailResponse {
  threadId: string;
  messageId: string;
}

async function sendEmail(accessToken: string, to: string, subject: string, rawEmail: string): Promise<SendEmailResponse> {
  // The rawEmail parameter should already include all headers and body
  // Just ensure it has the To header if not already included
  if (!rawEmail.includes('To: ')) {
    rawEmail = `To: ${to}\n${rawEmail}`;
  }
  
  // Encode the email for Gmail API
  const encodedMessage = btoa(rawEmail)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  console.log(`[sendEmail] Sending email to: ${to}, subject: ${subject}`);

  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send?fields=id,threadId", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ 
      raw: encodedMessage,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`[sendEmail] Gmail API error for ${to}: ${res.status} ${res.statusText} - ${errorText}`);
    throw new Error(`Gmail API error: ${res.status} ${res.statusText} - ${errorText}`);
  } else {
    const responseData = await res.json();
    console.log(`[sendEmail] Email sent successfully to: ${to}, thread ID: ${responseData.threadId}`);
    return {
      threadId: responseData.threadId,
      messageId: responseData.id
    };
  }
}

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

// Rate limiting utility
const rateLimitedMap = async <T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> => {
  const results: R[] = [];
  const executing: Promise<void>[] = [];
  let index = 0;

  while (index < items.length) {
    const item = items[index++];
    const p = Promise.resolve().then(() => fn(item)).then(result => {
      results.push(result);
    });
    executing.push(p);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
    }
  }


  await Promise.all(executing);
  return results;
};

// Rate limiting configuration
const REQUESTS_PER_MINUTE_PER_KEY = 15; // Gemini API rate limit per key
const TOKENS_PER_MINUTE = REQUESTS_PER_MINUTE_PER_KEY * 5; // 5 keys
const TOKENS_PER_SECOND = TOKENS_PER_MINUTE / 60;
const BUCKET_SIZE = TOKENS_PER_MINUTE * 2; // Allow for bursts

// Token bucket state per key
interface TokenBucket {
  tokens: number;
  lastRefillTime: number;
}

// Initialize token buckets for each key
const tokenBuckets: Record<string, TokenBucket> = {};
const apiKeys = [geminiApiKey, geminiApiKey2, geminiApiKey3, geminiApiKey4, geminiApiKey5];

// Initialize token buckets for all API keys
apiKeys.forEach(key => {
  tokenBuckets[key] = {
    tokens: BUCKET_SIZE / 5, // Split total tokens evenly across keys
    lastRefillTime: Date.now()
  };
});

// Request tracking
let activeRequests = 0;
const requestTimestamps: Record<string, number[]> = {}; // key -> timestamps

// Rate limiter using token bucket algorithm
async function rateLimitedRequest<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  
  // Initialize or get token bucket for this key
  if (!tokenBuckets[key]) {
    tokenBuckets[key] = {
      tokens: BUCKET_SIZE / 5,
      lastRefillTime: now
    };
  }
  const bucket = tokenBuckets[key];
  
  // Refill tokens based on time passed for this key's bucket
  const timePassed = (now - bucket.lastRefillTime) / 1000; // in seconds
  bucket.tokens = Math.min(BUCKET_SIZE / 5, bucket.tokens + (timePassed * (TOKENS_PER_SECOND / 5)));
  bucket.lastRefillTime = now;

  // Initialize request tracking for this key
  if (!requestTimestamps[key]) {
    requestTimestamps[key] = [];
  }
  
  // Clean up old timestamps (older than 1 minute)
  const oneMinuteAgo = now - 60000;
  requestTimestamps[key] = requestTimestamps[key].filter(ts => ts > oneMinuteAgo);
  
  // Calculate wait time if we're at the limit
  const currentRpm = requestTimestamps[key].length;
  if (currentRpm >= REQUESTS_PER_MINUTE_PER_KEY) {
    const oldestRequest = requestTimestamps[key][0];
    const timeToWait = 60000 - (now - oldestRequest);
    if (timeToWait > 0) {
      console.log(`[RATE_LIMIT] Waiting ${timeToWait}ms for key ${key} (${currentRpm} RPM)`);
      await new Promise(resolve => setTimeout(resolve, timeToWait));
    }
  }

  // Wait if we don't have enough tokens for this key
  while (bucket.tokens < 1) {
    const timeToWait = Math.ceil((1 - bucket.tokens) / (TOKENS_PER_SECOND / 5) * 1000);
    console.log(`[RATE_LIMIT] [${key.substring(0, 8)}...] Waiting ${timeToWait}ms for token refill (${bucket.tokens.toFixed(2)} tokens available)`);
    await new Promise(resolve => setTimeout(resolve, timeToWait));
    
    // Update tokens after waiting
    const now = Date.now();
    const timePassed = (now - bucket.lastRefillTime) / 1000;
    bucket.tokens = Math.min(BUCKET_SIZE / 5, bucket.tokens + (timePassed * (TOKENS_PER_SECOND / 5)));
    bucket.lastRefillTime = now;
  }

  // Deduct a token and make the request
  bucket.tokens--;
  requestTimestamps[key].push(Date.now());
  activeRequests++;
  
  try {
    const startTime = Date.now();
    console.log(`[REQUEST_START] Key: ${key.substring(0, 8)}..., Active: ${activeRequests}, Tokens: ${bucket.tokens.toFixed(2)}`);
    
    const result = await fn();
    
    const duration = Date.now() - startTime;
    console.log(`[REQUEST_END] Key: ${key.substring(0, 8)}..., Duration: ${duration}ms, Active: ${activeRequests}, Tokens: ${bucket.tokens.toFixed(2)}`);
    
    return result;
  } finally {
    activeRequests--;
  }
}

// Batch processing configuration
const MAX_CONCURRENT_PER_KEY = 2; // Conservative concurrency per key
const BATCH_SIZE = 15; // Total across all keys

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
    const emailsByKey: Record<string, typeof pendingEmails> = {};
    apiKeys.forEach(key => { emailsByKey[key] = []; });
    
    // Distribute emails round-robin across keys
    pendingEmails.forEach((email: any, i: number) => {
      const key = apiKeys[i % apiKeys.length];
      emailsByKey[key].push(email);
    });
    
    // Process emails with rate limiting per API key
    await Promise.all(apiKeys.map(async (key) => {
      const jobs = emailsByKey[key] || [];
      return rateLimitedMap(jobs, MAX_CONCURRENT_PER_KEY, async (emailJob: { campaign_id: any; professor_name: any; professor_email: string; university: any; department: any; research_areas: any[]; id: any; }) => {
        processedCampaignIds.add(emailJob.campaign_id);
        try {
          // Extract and prepare info
          const campaign = await supabase
            .from("campaigns")
            .select("*")
            .eq("id", emailJob.campaign_id)
            .single()
            .then((res: { data: any; }) => res.data);
    
          const studentProfile = await supabase
            .from("student_profiles")
            .select("resume_url")
            .eq("user_id", campaign.user_id)
            .single()
            .then((res: { data: any; }) => res.data);
    
          const userInfo = await supabase
            .from("users")
            .select("firstName, lastName, email")
            .eq("id", campaign.user_id)
            .single()
            .then((res: { data: any; }) => res.data);
    
          const studentName = userInfo?.firstName && userInfo?.lastName
            ? `${userInfo.firstName} ${userInfo.lastName}`
            : userInfo?.firstName || userInfo?.lastName || "";
          const studentEmail = userInfo?.email || "";
          const accessToken = await getValidGmailAccessToken(supabase, campaign.user_id);
    
          const personalizedEmail = await rateLimitedRequest(key, () => 
            generatePersonalizedEmailWithResume(
              {
                name: emailJob.professor_name,
                email: emailJob.professor_email,
                university: emailJob.university,
                department: emailJob.department,
                researchAreas: emailJob.research_areas,
              },
              studentProfile?.resume_url || null,
              key,
              supabase,
              { name: studentName, email: studentEmail }
            )
          );
    
          const emailSubject = `Research Opportunity Inquiry - ${emailJob.research_areas?.[0] || "Research"}`;
          const emailWithTracking = `To: ${emailJob.professor_email}\n` +
                                    `From: ${studentEmail}\n` +
                                    `Subject: ${emailSubject}\n` +
                                    'MIME-Version: 1.0\n' +
                                    'Content-Type: multipart/alternative; boundary="BOUNDARY"\n\n' +
                                    '--BOUNDARY\n' +
                                    'Content-Type: text/plain; charset=utf-8\n\n' +
                                    `${personalizedEmail}\n\n` +
                                    '--BOUNDARY\n' +
                                    'Content-Type: text/html; charset=utf-8\n\n' +
                                    `<div style="white-space: pre-wrap;">${personalizedEmail.replace(/\n/g, '<br>')}</div>`;
    
          // Generate a unique tracking ID for the pixel
          const trackingId = `trk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const trackingPixelUrl = `${new URL(supabaseUrl).origin}/functions/v1/track-email-pixel?id=${trackingId}`;
          const emailWithPixel = emailWithTracking.replace('</div>', `</div><img src="${trackingPixelUrl}" alt="" width="1" height="1" style="display:none;" />`);
    
          // Send the email and get the Gmail thread ID
          const sendResponse = await sendEmail(accessToken, emailJob.professor_email, emailSubject, emailWithPixel);
          const gmailThreadId = sendResponse.threadId;
          
          if (!gmailThreadId) {
            throw new Error('Failed to get Gmail thread ID from send response');
          }
          
          // Update the database with both tracking IDs
          await supabase.from("pending_emails").update({ 
            status: "sent", 
            sent_at: new Date().toISOString(), 
            updated_at: new Date().toISOString() 
          }).eq("id", emailJob.id);
          
          await supabase.from("email_logs").insert({
            campaign_id: emailJob.campaign_id,
            student_id: campaign.user_id,
            pending_email_id: emailJob.id,
            sent_at: new Date().toISOString(),
            status: "sent",
            open_count: 0,
            tracking_id: trackingId,        // Our custom tracking ID for the pixel
            gmail_thread_id: gmailThreadId, // Gmail's thread ID for response tracking
            updated_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          });
          
          return { success: true, emailJobId: emailJob.id };
    
        } catch (err) {
          await supabase
            .from("pending_emails")
            .update({ status: "failed", error_message: err instanceof Error ? err.message : "Unknown error", updated_at: new Date().toISOString() })
            .eq("id", emailJob.id);
          return { success: false, emailJobId: emailJob.id, error: err };
        }
      });
    }));

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
            body: JSON.stringify({ campaignId })
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
