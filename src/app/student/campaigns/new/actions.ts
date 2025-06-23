'use server';

import { createServerSupabaseClient } from '@/server';
import { cookies } from 'next/headers';
import { auth, currentUser } from '@clerk/nextjs/server';
import type { Database } from '@/database.types';
import { sendEmail } from '@/lib/gmail';
import type { CookieOptions } from '@supabase/ssr';

/**
 * Universal Field Mapping for Campaign Types:
 * 
 * RESEARCH:
 * - researchInterests: Research areas/topics
 * - targetUniversities: Target universities
 * 
 * INTERNSHIP/JOB: 
 * - researchInterests: Job/internship roles
 * - targetUniversities: Target companies
 * 
 * CUSTOM:
 * - researchInterests: Target audience (who you're reaching)
 * - targetUniversities: Target organizations
 * - customPrompt: Purpose and context for outreach
 */

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
  campaignType: 'research' | 'internship' | 'job' | 'custom';
  researchInterests: string[]; // Universal field: research topics / internship roles / job roles / target audience
  targetUniversities: string[]; // Universal field: universities / companies / companies / organizations
  customPrompt?: string;
  maxEmails: number;
};

export async function createCampaign(campaignData: CampaignData) {
  const user = await currentUser();
  if (!user?.id) {
    throw new Error('User not authenticated.');
  }
  const clerkUserId = user.id;
  const supabase = await createSupabaseClientWithClerkToken();

  try {    // 1. Create campaign record
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .insert({
        user_id: clerkUserId,
        type: campaignData.campaignType,
        research_interests: campaignData.researchInterests,
        target_universities: campaignData.targetUniversities,
        custom_prompt: campaignData.customPrompt || null,
        max_emails: campaignData.maxEmails,
        status: 'pending_processing',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (campaignError) {
      throw new Error(`Failed to create campaign: ${campaignError.message || JSON.stringify(campaignError)}`);
    }
    return { success: true, campaignId: campaign.id };
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw error;
  }
}

// Fetch the current user's research interests from student_profiles
export async function getUserInterests(): Promise<string[]> {
  const user = await currentUser();
  if (!user?.id) {
    throw new Error('User not authenticated.');
  }
  const supabase = await createSupabaseClientWithClerkToken();
  const { data, error } = await supabase
    .from('student_profiles')
    .select('interests')
    .eq('user_id', user.id)
    .single();
  if (error) {
    // If no profile, return empty array (user can still proceed)
    if (error.code === 'PGRST116') return [];
    throw new Error('Failed to fetch user interests: ' + error.message);
  }
  // data?.interests may be undefined/null, so default to []
  return (data && Array.isArray(data.interests)) ? data.interests : [];
}