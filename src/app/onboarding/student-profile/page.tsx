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
  // TagInput, // Assuming Once UI might have a TagInput, if not, we'll use Textarea for interests
  useToast,
  Spinner // For loading state
} from '@/once-ui/components';
import { updateStudentProfile, getStudentProfile } from './actions'; // Server actions to be created
import type { Database } from '@/database.types';

// Define a type for the profile data to ensure type safety
export type StudentProfileData = {
  name: string;
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

  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [interestsInput, setInterestsInput] = useState(''); // For comma-separated interests
  const [resumeUrl, setResumeUrl] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      setIsLoading(true);
      try {
        const profile = await getStudentProfile();
        if (profile) {
          setName(profile.name || '');
          setSchool(profile.school || '');
          setInterestsInput((profile.interests || []).join(', '));
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
      const interestsArray = interestsInput.split(',').map(interest => interest.trim()).filter(interest => interest !== '');
      const profileData: StudentProfileData = {
        name,
        school,
        interests: interestsArray,
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
  
  if (isLoading) {
    return (
      <Column fillWidth fillHeight vertical="center" horizontal="center" padding="l">
        <Spinner size="xl" />
        <Text marginTop="m">Loading your profile...</Text>
      </Column>
    );
  }

  return (
    <Column fillWidth vertical="center" horizontal="center" padding="l" gap="32" paddingTop="xl">
      <Column>
      <Heading variant="display-default-l" align="center">
        Complete Your Student Profile
      </Heading>
      <Text align="center" onBackground="neutral-weak" maxWidth="s">
        Tell us more about yourself to help us find the best research opportunities for you.
      </Text>
      </Column>
      <Column border='neutral-weak' maxWidth="l" fillWidth padding="32" radius="l" shadow="s">
        <form onSubmit={handleSubmit}>
          <Column gap="24" fillWidth>
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
            <Input
              label="School/University"
              placeholder="Enter your school or university name"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              required
            />
            <Textarea
              label="Research Interests (comma-separated)"
              placeholder="e.g., Machine Learning, Neuroscience, Quantum Physics"
              value={interestsInput}
              onChange={(e) => setInterestsInput(e.target.value)}
              rows={3}
              required
            />
            <Input
              label="Resume/CV URL (Optional)"
              type="url"
              placeholder="https://example.com/your-resume.pdf"
              value={resumeUrl}
              onChange={(e) => setResumeUrl(e.target.value)}
            />
            <Textarea
              label="Short Bio (Optional)"
              placeholder="Briefly describe your academic background and research goals."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={5}
            />
            <Button 
              type="submit" 
              label={isPending ? 'Saving...' : 'Save Profile & Continue'} 
              variant="primary" 
              fillWidth 
              disabled={isPending}
              arrowIcon={!isPending}
            />
          </Column>
        </form>
      </Column>
    </Column>
  );
} 