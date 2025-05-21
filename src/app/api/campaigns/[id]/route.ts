import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await auth();
    if (!user?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    const supabase = await createServerSupabaseClient();

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.userId)
      .single();

    if (campaignError) {
      console.error('Error fetching campaign:', campaignError);
      return NextResponse.json(
        { error: 'Failed to fetch campaign' },
        { status: 500 }
      );
    }

    // Get campaign emails
    const { data: emails, error: emailsError } = await supabase
      .from('pending_emails')
      .select('*')
      .eq('campaign_id', params.id)
      .order('created_at', { ascending: false });

    if (emailsError) {
      console.error('Error fetching campaign emails:', emailsError);
      return NextResponse.json(
        { error: 'Failed to fetch campaign emails' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      campaign,
      emails,
    });
  } catch (error) {
    console.error('Error in campaign details API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}