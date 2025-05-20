'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Heading,
  Column,
  Row,
  Card,
  Button,
  Text,
  Input,
  Textarea,
  TagInput, // Assuming Once UI might have a TagInput, if not, we'll use Textarea for interests
  useToast,
  Spinner // For loading state
} from '@/once-ui/components';
import { updateStudentProfile, getStudentProfile, uploadResume } from './actions'; // Server actions to be created
import type { Database } from '@/database.types';
import { MediaUpload } from '@/once-ui/modules';

// Define a type for the profile data to ensure type safety
export type StudentProfileData = {
  firstName: string;
  lastName: string;
  school: string;
  interests: string[]; // Storing interests as an array of strings
  resumeUrl: string;
  bio: string;
};

export default function StudentProfilePage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true); // For initial data loading
  const [isUploadingResume, setIsUploadingResume] = useState(false); // New state for resume upload

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [school, setSchool] = useState('');
  const [interestsInput, setInterestsInput] = useState<string[]>([]); // For TagInput, use array of strings
  const [resumeUrl, setResumeUrl] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      setIsLoading(true);
      try {
        const profile = await getStudentProfile();
        if (profile) {
          setFirstName(profile.firstName || '');
          setLastName(profile.lastName || '');
          setSchool(profile.school || '');
          setInterestsInput(profile.interests || []);
          setResumeUrl(profile.resumeUrl || '');
          setBio(profile.bio || '');
        }
      } catch (error) {
        console.error('Failed to fetch student profile:', error);
        addToast({
          variant: 'danger',
          message: 'Could not load your profile. Please try refreshing.',
        });
      }
      setIsLoading(false);
    }
    fetchProfile();
  }, [addToast]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      const profileData: StudentProfileData = {
        firstName,
        lastName,
        school,
        interests: interestsInput,
        resumeUrl,
        bio,
      };

      try {
        await updateStudentProfile(profileData);
        addToast({
          variant: 'success',
          message: 'Profile updated successfully! Redirecting to dashboard...',
        });
        router.push('/student/dashboard'); // TODO: Create student dashboard page
      } catch (error) {
        console.error('Failed to update profile:', error);
        addToast({
          variant: 'danger',
          message: (error instanceof Error && error.message) || 'Failed to update profile. Please try again.',
        });
      }
    });
  };
  
  const handleResumeUpload = async (file: File) => {
    try {
      const url = await uploadResume(file);
      setResumeUrl(url);
    } catch (error) {
      console.error('Error uploading resume:', error);
      addToast({
        variant: 'danger',
        message: (error instanceof Error && error.message) || 'Failed to upload resume. Please try again.'
      });
    } finally {
      setIsUploadingResume(false); // End resume upload loading
    }
  };

  if (isLoading) { // This is for the initial page load
    return (
      <Column fillWidth fillHeight vertical="center" horizontal="center" padding="l">
        <Spinner size="xl" />
        <Text marginTop="m">Loading your profile...</Text>
      </Column>
    );
  }

  return (
    <Column fillWidth vertical="center" horizontal="center" padding="l" gap="32" paddingTop="xl">
      <Column gap='16'>
      <Heading variant="display-default-l" align="center">
        Complete Your Student Profile
      </Heading>
      <Text align="center" onBackground="neutral-weak">
        Tell us more about yourself to help us find the best research opportunities for you.
      </Text>
      </Column>
      <Column border='neutral-weak' maxWidth="s" fillWidth padding="32" radius="l" shadow="s">
        <form onSubmit={handleSubmit}>
          <Column gap="24" fillWidth padding='s'>
          <Row fillWidth gap='s'>
          <Input
              id="firstName"
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              autoFocus
            />
            <Input
              id="lastName"
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              autoFocus
            />
          </Row>
            
            <Input
              id="school"
              label="School/University"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              required
            />
            <TagInput
              id='interests'
              icon='arrowDown'
              label="Research Interests"
              value={interestsInput}
              onChange={setInterestsInput}
            />
            <Heading>Resume</Heading>
            <MediaUpload
              pdfMode
              onFileUpload={handleResumeUpload}
              fileUrl={resumeUrl} /* Pass resumeUrl to display the file */
            />
            <Button
              type="submit"
              label={isPending ? 'Saving...' : 'Save Profile & Continue'}
              variant="primary"
              fillWidth
              disabled={isPending || isUploadingResume} /* Disable submit while uploading resume */
              arrowIcon={!isPending && !isUploadingResume}
            />
          </Column>
        </form>
      </Column>
    </Column>
  );
}