'use server';

import { auth } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/server'; // Assuming this is your Supabase client helper
import type { Database, Tables } from '@/database.types';

export type CampaignDisplayData = Pick<
  Tables<'campaigns'>,
  'id' | 'created_at' | 'status' | 'research_interests' | 'target_universities' | 'max_emails' | 'type' 
>;

export async function getStudentCampaigns(): Promise<CampaignDisplayData[]> {
  const supabase = await createServerSupabaseClient(); // Or your specific client instantiation with auth
  const authData = await auth();
  const userId = authData.userId;

  if (!userId) {
    console.error('Error fetching campaigns: User not authenticated');
    // Consider returning an empty array or throwing a specific error
    return [];
  }

  const { data: campaigns, error } = await supabase
    .from('campaigns')
    .select('id, created_at, status, type, research_interests, target_universities, max_emails')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching student campaigns:', error);
    return []; // Or handle error as appropriate
  }

  return campaigns || [];
}

// Helper to instantiate Supabase client with Clerk auth token if needed by your setup
// This might be redundant if createServerSupabaseClient already handles auth
// async function createSupabaseClientWithClerkToken() {
//   const authInstance = auth();
//   const clerkToken = await (await authInstance).getToken();
//   if (!clerkToken) {
//     throw new Error('Clerk token not available. Ensure user is authenticated.');
//   }

//   const supabase = await createServerSupabaseClient();
//   (supabase as any).global = {
//     ...(supabase as any).global,
//     headers: {
//       Authorization: `Bearer ${clerkToken}`,
//     },
//   };
//   return supabase;
// }
