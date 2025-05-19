import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { createServerSupabaseClient } from "@/server";
import { cookies } from 'next/headers';

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

export async function sendEmail(
  accessToken: string,
  to: string,
  subject: string,
  body: string
): Promise<void> {
  try {
    // Set credentials
    oauth2Client.setCredentials({ access_token: accessToken });

    // Create Gmail API client
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Create email message
    const message = [
      'Content-Type: text/plain; charset="UTF-8"\n',
      'MIME-Version: 1.0\n',
      `To: ${to}\n`,
      'From: me\n',
      `Subject: ${subject}\n\n`,
      body,
    ].join('');

    // Encode message in base64
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send email
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email. Please try again.');
  }
}

export async function getUserGmailToken(userId: string) {
  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient();
  const { data, error } = await (await supabase)
    .from('user_oauth_tokens')
    .select('access_token,expires_at')
    .eq('user_id', userId)
    .eq('provider', 'gmail')
    .single();
  if (error || !data) throw new Error('No Gmail token found');
  return data.access_token;
}