'use server';

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { auth, currentUser } from '@clerk/nextjs/server';
import type { Database } from '@/database.types';
import type { StudentProfileData } from './page'; // Import the type from the page component
import { createServerSupabaseClient } from '@/server';

// Helper function to create Supabase client with Clerk token
async function createSupabaseClientWithClerkToken() {
    const authInstance = auth();
    const clerkToken = await (await authInstance).getToken();

  if (!clerkToken) {
    throw new Error('Clerk token not available. User might not be fully authenticated.');
  }

  const cookieStore = await cookies();
  return createServerSupabaseClient();
}

export async function getStudentProfile(): Promise<Partial<StudentProfileData> | null> {
  const user = await currentUser();
  if (!user?.id) {
    throw new Error('User not authenticated.');
  }
  const clerkUserId = user.id;
  const supabase = await createSupabaseClientWithClerkToken();

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('firstName, lastName, school')
    .eq('id', clerkUserId)
    .single();

  if (userError && userError.code !== 'PGRST116') { // PGRST116 means no rows found, which is acceptable if profile not complete
    console.error('Error fetching user data:', userError);
    throw new Error(userError.message);
  }

  const { data: studentData, error: studentError } = await supabase
    .from('student_profiles')
    .select('interests, resume_url, bio')
    .eq('user_id', clerkUserId)
    .single();

  if (studentError && studentError.code !== 'PGRST116') {
    console.error('Error fetching student profile data:', studentError);
    throw new Error(studentError.message);
  }
  
  return {
    firstName: userData?.firstName || '',
    lastName: userData?.lastName || '',
    school: userData?.school || '',
    interests: studentData?.interests || [],
    resumeUrl: studentData?.resume_url || '',
    bio: studentData?.bio || '',
  };
}

export async function updateStudentProfile(profileData: StudentProfileData): Promise<{ success: boolean }> {
  const user = await currentUser();
  if (!user?.id) {
    throw new Error('User not authenticated.');
  }
  const clerkUserId = user.id;
  const supabase = await createSupabaseClientWithClerkToken();

  const { firstName, lastName, school, interests, resumeUrl, bio } = profileData;

  // Validate inputs (basic example, add more robust validation as needed)
  if (!firstName || firstName.trim() === '') throw new Error('Name is required.');
  if (!school || school.trim() === '') throw new Error('School is required.');
  if (!interests || interests.length === 0) throw new Error('At least one interest is required.');

  // Update public.users table
  const { error: userUpdateError } = await supabase
    .from('users')
    .update({ firstName, lastName, school, updated_at: new Date().toISOString() })
    .eq('id', clerkUserId);

  if (userUpdateError) {
    console.error('Error updating user data:', userUpdateError);
    throw new Error(`Failed to update user details: ${userUpdateError.message}`);
  }

  // Update student_profiles table (upsert in case the profile row was somehow missed after role selection)
  const { error: studentProfileUpdateError } = await supabase
    .from('student_profiles')
    .upsert(
      {
        user_id: clerkUserId,
        interests,
        resume_url: resumeUrl || null, // Handle optional field
        bio: bio || null, // Handle optional field
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

  if (studentProfileUpdateError) {
    console.error('Error updating student profile:', studentProfileUpdateError);
    throw new Error(`Failed to update student profile: ${studentProfileUpdateError.message}`);
  }
  return { success: true };
}

export async function uploadResume(file: File): Promise<string> {
  const user = await currentUser();
  if (!user?.id) {
    throw new Error('User not authenticated.');
  }
  const clerkUserId = user.id;
  const supabase = await createSupabaseClientWithClerkToken();

  const fileExt = file.name.split('.').pop();
  const fileName = `${clerkUserId}_${Date.now()}.${fileExt}`;
  const filePath = `${clerkUserId}/${fileName}`;

  const arrayBuffer = await file.arrayBuffer();
  const fileData = new Uint8Array(arrayBuffer);

  const { error: uploadError } = await supabase
    .storage
    .from('student-resumes')
    .upload(filePath, fileData, {
      contentType: file.type,
    });

  if (uploadError) {
    console.error('Error uploading resume to Supabase:', uploadError);
    throw new Error(`Failed to upload resume: ${uploadError.message}`);
  }

  // The getPublicUrl method might throw an error directly or return a different structure.
  // We'll try-catch around it and also check if publicUrl is missing.
  try {
    const { data: urlData } = supabase
      .storage
      .from('student-resumes')
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      console.error('Public URL was unexpectedly null or undefined after upload.');
      throw new Error('Failed to retrieve resume URL after upload.');
    }

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error getting public URL for resume:', error);
    // Ensure the error is an instance of Error to access the message property safely
    const message = error instanceof Error ? error.message : 'Unknown error getting public URL';
    throw new Error(`Failed to get resume URL: ${message}`);
  }
}