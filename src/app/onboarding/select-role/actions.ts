'use server';

import { cookies } from 'next/headers';
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { currentUser, auth } from '@clerk/nextjs/server';
import { Database } from '@/database.types';

export async function updateUserRole(role: 'student' | 'professor') {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    throw new Error('User not authenticated (Clerk)');
  }

  let clerkToken: string | null = null;
  try {
    const authInstance = auth();
    clerkToken = await (await authInstance).getToken();
  } catch (e) {
    console.warn("Failed to get token with auth().getToken(), trying auth.getToken() if 'auth' is an object", e);
    try {
        clerkToken = await (auth as any).getToken();
    } catch (e2) {
        console.error("Could not retrieve Clerk token.", e2);
    }
  }

  if (!clerkToken) {
    throw new Error('Clerk token not available. Ensure user is fully signed in and token retrieval is correct.');
  }

  const clerkUserId = clerkUser.id;
  const clerkUserEmail = clerkUser.primaryEmailAddress?.emailAddress;

  if (!clerkUserEmail) {
    // This case should ideally be handled by Clerk ensuring users have a primary email
    // or your application prompting for it if somehow missing.
    throw new Error('User primary email address not found.');
  }

  const cookieStore = cookies();

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return (await cookieStore).get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            (cookieStore as any).set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            (cookieStore as any).set({ name, value: '', ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
      global: {
        headers: {
          Authorization: `Bearer ${clerkToken}`,
        },
      },
    }
  );

  // 1. Upsert user into public.users to ensure the record exists
  const { error: upsertUserError } = await supabase
    .from('users')
    .upsert(
      { 
        id: clerkUserId, 
        email: clerkUserEmail, 
        // name and school can be populated later during profile completion
      },
      { onConflict: 'id' } // If ID exists, do nothing (or update if needed, but here we just ensure existence)
    );

  if (upsertUserError) {
    console.error('Supabase upsert user error:', upsertUserError);
    throw new Error(`Failed to ensure user record: ${upsertUserError.message}`);
  }

  // 2. Update the user's role in the public.users table
  const { data: updatedUser, error: userUpdateError } = await supabase
    .from('users')
    .update({ role })
    .eq('id', clerkUserId)
    .select()
    .single();

  if (userUpdateError) {
    console.error('Supabase user role update error:', userUpdateError);
    throw new Error(`Failed to update user role: ${userUpdateError.message}`);
  }

  if (!updatedUser) {
    console.error('No user returned after role update');
    throw new Error('Failed to update user role, user not found after update.');
  }

  // 3. Create a corresponding profile entry (student_profiles or professor_profiles)
  if (role === 'student') {
    const { error: studentProfileError } = await supabase
      .from('student_profiles')
      .insert({ user_id: clerkUserId }); 

    if (studentProfileError) {
      console.error('Supabase student profile creation error:', studentProfileError);
      throw new Error(`Failed to create student profile: ${studentProfileError.message}`);
    }
  } else if (role === 'professor') {
    const { error: professorProfileError } = await supabase
      .from('professor_profiles')
      .insert({ user_id: clerkUserId });

    if (professorProfileError) {
      console.error('Supabase professor profile creation error:', professorProfileError);
      throw new Error(`Failed to create professor profile: ${professorProfileError.message}`);
    }
  }

  console.log(`User ${clerkUserId} role updated to ${role} and profile created.`);
  return { success: true, user: updatedUser };
} 