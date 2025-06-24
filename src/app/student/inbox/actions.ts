'use server';

import { auth } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/server';

export type InboxEmail = {
  id: string;
  professor_name: string;
  professor_email: string;
  university: string;
  department: string;
  research_areas: string[];
  sent_at: string;
  replied_at?: string | null;
  status: string;
  open_count?: number | null;
  gmail_thread_id?: string | null;
  campaign_id: string;
  campaign_type: string;
  campaign_number: number;
};

async function createSupabaseClientWithClerkToken() {
  return createServerSupabaseClient();
}

export async function getInboxEmails(): Promise<InboxEmail[]> {
  const supabase = await createSupabaseClientWithClerkToken();
  const authData = await auth();
  const userId = authData.userId;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Get all email logs for the user with campaign and pending email details
  const { data: emailLogs, error } = await supabase
    .from('email_logs')
    .select(`
      id,
      sent_at,
      replied_at,
      status,
      open_count,
      gmail_thread_id,
      campaign_id,
      pending_emails!pending_email_id (
        professor_name,
        professor_email,
        university,
        department,
        research_areas
      ),
      campaigns!campaign_id (
        type,
        created_at
      )
    `)
    .eq('student_id', userId)
    .order('sent_at', { ascending: false });

  if (error) {
    console.error('Error fetching inbox emails:', error);
    return [];
  }

  if (!emailLogs) {
    return [];
  }

  // Get all user's campaigns to calculate campaign numbers
  const { data: allCampaigns } = await supabase
    .from('campaigns')
    .select('id, created_at, type')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  const campaignNumberMap = new Map<string, number>();
  if (allCampaigns) {
    allCampaigns.forEach((campaign, index) => {
      campaignNumberMap.set(campaign.id, index + 1);
    });
  }
  // Transform the data to match our InboxEmail type
  return emailLogs
    .filter(log => log.pending_emails && log.campaigns) // Filter out logs without required data
    .map(log => {
      const pendingEmail = log.pending_emails!;
      const campaign = log.campaigns!;
      
      return {
        id: log.id,
        professor_name: pendingEmail.professor_name,
        professor_email: pendingEmail.professor_email,
        university: pendingEmail.university || '',
        department: pendingEmail.department || '',
        research_areas: pendingEmail.research_areas || [],
        sent_at: log.sent_at,
        replied_at: log.replied_at,
        status: log.status || 'sent',
        open_count: log.open_count,
        gmail_thread_id: log.gmail_thread_id,
        campaign_id: log.campaign_id || '',
        campaign_type: campaign.type || 'research',
        campaign_number: campaignNumberMap.get(log.campaign_id || '') || 0,
      };
    });
}
