'use server';

import { auth } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/server';
import type { Database } from '@/database.types';

export type CampaignDetails = {
  id: string;
  status: string;
  type: string;
  error_message?: string;
  created_at: string;
  research_interests: string[];
  target_universities: string[];
  max_emails: number;
  user_id: string;
};

export type CampaignEmail = {
  id: string;
  professor_name: string;
  professor_email: string;
  university: string;
  department: string;
  research_areas: string[];
  status: string;
  sent_at: string;
  error_message?: string;
};

async function createSupabaseClientWithClerkToken() {
  return createServerSupabaseClient();
}

export async function getCampaignDetails(campaignId: string): Promise<CampaignDetails | null> {
  const supabase = await createSupabaseClientWithClerkToken();
  const authData = await auth();
  const userId = authData.userId;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching campaign:', error);
    return null;
  }

  return {
    ...campaign,
    error_message: campaign.error_message || undefined
  };
}

export async function getCampaignEmails(campaignId: string): Promise<CampaignEmail[]> {
  const supabase = await createSupabaseClientWithClerkToken();
  const authData = await auth();
  const userId = authData.userId;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  // First verify the campaign belongs to the user
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id')
    .eq('id', campaignId)
    .eq('user_id', userId)
    .single();

  if (!campaign) {
    throw new Error('Campaign not found');
  }

  const { data: emails, error } = await supabase
    .from('pending_emails')
    .select(`
      id,
      professor_name,
      professor_email,
      university,
      department,
      research_areas,
      status,
      sent_at,
      error_message
    `)
    .eq('campaign_id', campaignId)
    .order('sent_at', { ascending: false });

  if (error) {
    console.error('Error fetching campaign emails:', error);
    return [];
  }

  return (emails || []).map(email => ({
    ...email,
    university: email.university || '',
    department: email.department || '',
    research_areas: email.research_areas || [],
    sent_at: email.sent_at || '',
    error_message: email.error_message || undefined
  }));
}
