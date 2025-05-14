import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/database.types';

export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Note: For server-side client, we'll typically create it within server actions or route handlers
// using createServerClient from '@supabase/ssr', passing cookies.
// We can add a helper for that here later if needed. 