import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/server";
import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { getTokens } from '@/lib/gmail';

export async function POST(request: Request) {
  try {
    const user = await auth();
    if (!user?.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { tokens } = await request.json();
    if (!tokens?.access_token) {
      return NextResponse.json(
        { error: "Invalid tokens" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = await createServerSupabaseClient();

    // Store tokens in Supabase
    const { error } = await supabase
      .from("user_oauth_tokens")
      .upsert(
        {
          user_id: user.userId,
          provider: "gmail",
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: tokens.expiry_date
            ? new Date(tokens.expiry_date).toISOString()
            : null,
        },
        { onConflict: "user_id,provider" }
      );

    if (error) {
      console.error("Error storing Gmail tokens:", error);
      return NextResponse.json(
        { error: "Failed to store tokens" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in Gmail OAuth callback:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const scope = url.searchParams.get("scope");

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/settings/email?error=missing_code`);
  }

  try {
    // Exchange code for tokens
    const tokens = await getTokens(code);
    const user = await auth();
    if (!user?.userId) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/settings/email?error=unauthorized`);
    }
    const cookieStore = await cookies();
    const supabase = await createServerSupabaseClient();
    // Store tokens in Supabase
    const { error } = await supabase
      .from("user_oauth_tokens")
      .upsert(
        [{
          user_id: user.userId,
          provider: "gmail",
          access_token: tokens.access_token ?? '',
          refresh_token: tokens.refresh_token ?? null,
          expires_at: tokens.expiry_date
            ? new Date(tokens.expiry_date).toISOString()
            : null,
        }],
        { onConflict: "user_id,provider" }
      );
    if (error) {
      console.error("Error storing Gmail tokens:", error);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/settings/email?error=store_failed`);
    }
    // Success
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/settings/email?success=true`);
  } catch (err) {
    console.error("Error in Gmail OAuth callback:", err);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/settings/email?error=internal`);
  }
}