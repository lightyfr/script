import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { createServerSupabaseClient } from "@/server";

// Initialize OAuth2 client
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Scopes required for Gmail API
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.readonly',
];

export function getAuthUrl(): string {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });
}

export async function getTokens(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  body: string;
  trackingId?: string;
  campaignId?: string;
}

export async function sendEmail(
  accessToken: string,
  options: SendEmailOptions
): Promise<{ messageId: string; threadId: string }> {
  try {
    // Set credentials
    oauth2Client.setCredentials({ access_token: accessToken });

    // Create Gmail API client
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Generate a tracking ID if not provided
    const trackingId = options.trackingId || `track-${crypto.randomUUID()}`;
    
    // Create email headers
    const headers = [
      'Content-Type: text/plain; charset="UTF-8"',
      'MIME-Version: 1.0',
      `To: ${options.to}`,
      'From: me',
      `Subject: ${options.subject}`,
      `X-Tracking-ID: ${trackingId}`,
      `References: <${trackingId}@research-connect.com>`,
      `In-Reply-To: <${trackingId}@research-connect.com>`
    ];

    // Add campaign ID if provided
    if (options.campaignId) {
      headers.push(`X-Campaign-ID: ${options.campaignId}`);
    }

    // Create email message
    const message = [
      ...headers,
      '', // Empty line to separate headers from body
      options.body,
    ].join('\n');

    // Encode message in base64
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send email
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    return {
      messageId: response.data.id || '',
      threadId: response.data.threadId || ''
    };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email. Please try again.');
  }
}

export async function getUserGmailToken(userId: string) {
  const supabase = createServerSupabaseClient();
  // Fetch all relevant fields
  const { data, error } = await (await supabase)
    .from('user_oauth_tokens')
    .select('access_token,refresh_token,expires_at')
    .eq('user_id', userId)
    .eq('provider', 'gmail')
    .single();
  if (error || !data) throw new Error('No Gmail token found');

  let { access_token, refresh_token, expires_at } = data;
  let isExpired = false;
  if (expires_at) {
    const expiry = new Date(expires_at).getTime();
    // Consider token expired if less than 2 minutes left
    isExpired = Date.now() > expiry - 2 * 60 * 1000;
  }

  if (isExpired && refresh_token) {
    try {
      oauth2Client.setCredentials({ refresh_token });
      const { credentials } = await oauth2Client.refreshAccessToken();
      if (!credentials.access_token) {
        throw new Error('No access_token returned from refresh');
      }
      access_token = credentials.access_token;
      expires_at = credentials.expiry_date ? new Date(credentials.expiry_date).toISOString() : null;
      // Update Supabase with new token info
      await (await supabase)
        .from('user_oauth_tokens')
        .update({
          access_token,
          expires_at,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('provider', 'gmail');
    } catch (err) {
      console.error('Failed to refresh Gmail access token:', err);
      throw new Error('Gmail access token expired and refresh failed');
    }
  }
  return access_token;
}