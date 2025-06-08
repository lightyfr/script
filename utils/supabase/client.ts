'use client'
import { useSession } from '@clerk/nextjs'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/database.types'

// Custom hook to create a Supabase client with Clerk authentication
export function useSupabaseClient() {
  const { session } = useSession()

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
    {
      async accessToken() {
        return session?.getToken() ?? null
      },
    }
  )
}

// Function to create Supabase client with Clerk session (following the docs pattern)
export function createClerkSupabaseClient(session: any) {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      async accessToken() {
        return session?.getToken() ?? null
      },
    }
  )
}