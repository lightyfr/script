'use server';

import { cookies } from 'next/headers';
import { auth } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/server';
import type { Database } from '@/database.types';

/**
 * Fetches the current student's name from Supabase.
 * Returns an empty string if no name is set.
 */
export async function getStudentName() {
  const supabase = await createSupabaseClientWithClerkToken();
  const { data, error } = await supabase
    .from('student_profiles')
    .select('name')
    .single();

  if (error) {
    console.error('Error fetching student name:', error);
    return '';
  }

  return data?.name || '';
}

// Helper to instantiate Supabase client with Clerk auth token
async function createSupabaseClientWithClerkToken() {
  const authInstance = auth();
  const clerkToken = await (await authInstance).getToken();
  if (!clerkToken) {
    throw new Error('Clerk token not available. Ensure user is authenticated.');
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
