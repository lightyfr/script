import { NextResponse, NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/server';
import { cookies } from 'next/headers';
import { google } from 'googleapis';
import type { CookieOptions } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  if (!code) {
    return NextResponse.redirect('/settings/email?error=missing_code');
  }

  try {
    // Exchange code for tokens
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    const { tokens } = await oauth2Client.getToken(code);
    if (!tokens.access_token) {
      return NextResponse.redirect('/settings/email?error=token_exchange_failed');
    }

    // Get user info
    oauth2Client.setCredentials({ access_token: tokens.access_token });
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: userinfo } = await oauth2.userinfo.get();
    const userId = userinfo.id;
    if (!userId) {
      return NextResponse.redirect('/settings/email?error=no_user_id');
    }

    // Store token in Supabase
    const cookieStore = await cookies();
    const supabase = createServerSupabaseClient();
    const { error: upsertError } = await (await supabase)
      .from('user_oauth_tokens')
      .upsert(
        {
          user_id: userId,
          provider: 'gmail',
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,provider' }
      );
      console.error('OAuth callback error:', upsertError);
    if (upsertError) {
      return NextResponse.redirect('/settings/email?error=store_token_failed');
    }
    return NextResponse.redirect('/settings/email?success=true');
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect('/settings/email?error=oauth_error');
  }
}