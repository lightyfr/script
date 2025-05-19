'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Column, Spinner, Text } from '@/once-ui/components';
import { useToast } from '@/once-ui/components';

export default function EmailCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        console.error('OAuth error:', error);
        router.push('/settings/email?error=oauth_error');
        return;
      }

      if (!code || !state) {
        router.push('/settings/email?error=missing_params');
        return;
      }

      try {
        const response = await fetch('/api/email/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code, state }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to complete OAuth flow');
        }

        router.push('/settings/email?success=true');
      } catch (error) {
        console.error('Error completing OAuth flow:', error);
        addToast({
          variant: 'danger',
          message: error instanceof Error ? error.message : 'Failed to complete Gmail connection',
        });
        router.push('/settings/email?error=callback_failed');
      }
    };

    handleCallback();
  }, [searchParams, router, addToast]);

  return (
    <Column fillWidth vertical="center" horizontal="center" padding="l">
      <Spinner size="xl" />
      <Text marginTop="m">Completing Gmail connection...</Text>
    </Column>
  );
} 