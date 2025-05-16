'use server';

import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { currentUser, auth } from '@clerk/nextjs/server';
import type { Database } from '@/database.types';

// Helper to instantiate Supabase client with Clerk auth token
async function createSupabaseClientWithClerkToken() {
  const authInstance = auth();
  const clerkToken = await (await authInstance).getToken();
  if (!clerkToken) {
    throw new Error('Clerk token not available. Ensure user is authenticated.');
  }

  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: CookieOptions) => {
          try { (cookieStore as any).set({ name, value, ...options }); } catch {};
        },
        remove: (name: string, options: CookieOptions) => {
          try { (cookieStore as any).set({ name, value: '', ...options }); } catch {};
        }
      },
      global: {
        headers: {
          Authorization: `Bearer ${clerkToken}`
        }
      }
    }
  );
}

/**
 * Fetches the current student's name from Supabase.
 * Returns an empty string if no name is set.
 */
