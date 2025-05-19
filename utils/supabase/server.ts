import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { auth } from '@clerk/nextjs/server';
import type { Database } from '@/database.types';

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      accessToken: async () => {
        const session = await auth();
        return session?.getToken() ?? null;
      },
    }
  );
}