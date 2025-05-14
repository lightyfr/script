'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heading, Column, Row, Card, Text, Icon, useToast } from '@/once-ui/components';
import { updateUserRole } from './actions'; // We'll create this server action next

export default function SelectRolePage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'student' | 'professor' | null>(null);

  const handleRoleSelect = async (role: 'student' | 'professor') => {
    if (isLoading) return; // Prevent multiple submissions
    setIsLoading(true);
    setSelectedRole(role);
    try {
      await updateUserRole(role);
      addToast({
        variant: 'success',
        message: `Role selected: ${role}. Redirecting...`,
      });
      // Redirect to the appropriate profile completion page or dashboard
      if (role === 'student') {
        router.push('/onboarding/student-profile');
      } else if (role === 'professor') {
        router.push('/onboarding/professor-profile');
      }
    } catch (error) {
      console.error('Failed to update role:', error);
      addToast({
        variant: 'danger',
        message: (error instanceof Error && error.message) || 'Failed to save your role. Please try again.',
      });
      setSelectedRole(null); // Reset selection on error
    }
    setIsLoading(false);
  };

  return (
    <Column fillWidth fillHeight vertical="center" horizontal="center" padding="l" gap="32">
      <Heading variant="display-default-l" align="center">
        Welcome to Script! Tell us who you are.
      </Heading>
      <Column horizontal="center" maxWidth="s">
        <Text align="center" onBackground="neutral-weak">
          Please select your role to personalize your experience.
        </Text>
      </Column>
      <Row gap="24" mobileDirection="column" fillWidth maxWidth="m" horizontal="center">
        <Card
          fillWidth
          direction="column"
          padding="32"
          radius="l"
          border={selectedRole === 'student' ? 'brand-strong' : 'neutral-alpha-medium'}
          horizontal="center"
          gap="16"
          onClick={isLoading ? undefined : () => handleRoleSelect('student')}
          aria-busy={isLoading && selectedRole === 'student'}
          shadow={selectedRole === 'student' ? 'm' : 's'}
          style={{ cursor: isLoading ? 'default' : 'pointer' }}
        >
          <Icon name="userGraduate" size="xl" onBackground={selectedRole === 'student' ? 'brand-strong' : 'accent-strong'} />
          <Heading as="h2" variant="heading-default-m" align="center">
            I am a Student
          </Heading>
          <Text align="center" onBackground="neutral-medium">
            Looking for research opportunities and want to connect with professors.
          </Text>
        </Card>
        <Card
          fillWidth
          direction="column"
          padding="32"
          radius="l"
          border={selectedRole === 'professor' ? 'brand-strong' : 'neutral-alpha-medium'}
          horizontal="center"
          gap="16"
          onClick={isLoading ? undefined : () => handleRoleSelect('professor')}
          aria-busy={isLoading && selectedRole === 'professor'}
          shadow={selectedRole === 'professor' ? 'm' : 's'}
          style={{ cursor: isLoading ? 'default' : 'pointer' }}
        >
          <Icon name="userTie" size="xl" onBackground={selectedRole === 'professor' ? 'brand-strong' : 'accent-strong'} />
          <Heading as="h2" variant="heading-default-m" align="center">
            I am a Professor
          </Heading>
          <Text align="center" onBackground="neutral-medium">
            Offering research positions and looking to mentor students.
          </Text>
        </Card>
      </Row>
      {isLoading && <Text onBackground="neutral-weak">Saving your preference...</Text>}
    </Column>
  );
} 