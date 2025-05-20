'use server';

import { createServerSupabaseClient } from '@/server';
import { cookies } from 'next/headers';
import { auth, currentUser } from '@clerk/nextjs/server';
import type { Database } from '@/database.types';
import { findProfessorsWithPerplexity } from '@/lib/perplexity';
import { generatePersonalizedEmailWithClaude } from '@/lib/claude';
import { sendEmail } from '@/lib/gmail';
import type { CookieOptions } from '@supabase/ssr';

// Helper function to create Supabase client with Clerk token
async function createSupabaseClientWithClerkToken() {
  const authInstance = auth();
  const clerkToken = await (await authInstance).getToken();

  if (!clerkToken) {
    throw new Error('Clerk token not available. User might not be fully authenticated.');
  }

  const supabase = await createServerSupabaseClient();
  // Attach Clerk token to global headers if needed
  (supabase as any).global = {
    ...(supabase as any).global,
    headers: {
      Authorization: `Bearer ${clerkToken}`,
    },
  };
  return supabase;
}

type CampaignData = {
  researchInterests: string[];
  targetUniversities: string[];
  emailTemplate: string;
  maxEmails: number;
};

export async function createCampaign(campaignData: CampaignData) {
  const user = await currentUser();
  if (!user?.id) {
    throw new Error('User not authenticated.');
  }
  const clerkUserId = user.id;
  const supabase = await createSupabaseClientWithClerkToken();

  try {
    // 1. Create campaign record
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .insert({
        user_id: clerkUserId,
        research_interests: campaignData.researchInterests,
        target_universities: campaignData.targetUniversities,
        email_template: campaignData.emailTemplate,
        max_emails: campaignData.maxEmails,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (campaignError) {
      throw new Error(`Failed to create campaign: ${campaignError.message || JSON.stringify(campaignError)}`);
    }

    // 2. Trigger background job using Supabase Edge Function
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const { error: jobError } = await supabase.functions.invoke('enqueue-campaign-emails', {
  body: { campaignId: campaign.id },
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${anonKey}`,
  },
});

    if (jobError) {
      // Update campaign status to failed if job trigger fails
      await supabase
        .from('campaigns')
        .update({ status: 'failed', error_message: jobError.message })
        .eq('id', campaign.id);
      
        console.log(jobError)
      throw new Error(`Failed to start campaign processing: ${jobError.message}`);
    }

    return { success: true, campaignId: campaign.id };
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw error;
  }
}