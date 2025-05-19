"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser, useAuth } from "@clerk/nextjs";
import {
  Column,
  Button,
  Text,
  Spinner,
  useToast,
} from "@/once-ui/components";

const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.settings.basic',
  'https://www.googleapis.com/auth/gmail.settings.sharing',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

export default function EmailSettingsPage() {
  const router = useRouter();
  const { user } = useUser();
  const { userId } = useAuth();
  const { addToast } = useToast();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    checkGmailStatus();
  }, []);

  const checkGmailStatus = async () => {
    try {
      const response = await fetch('/api/email/status');
      const data = await response.json();
      setIsConnected(data.isConnected);
    } catch (error) {
      console.error('Error checking Gmail status:', error);
      addToast({
        variant: 'danger',
        message: 'Failed to check Gmail connection status',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectGmail = async () => {
    setIsLoading(true);
    try {
      // Get the Gmail OAuth URL from the backend
      const response = await fetch('/api/email/oauth-url');
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        addToast({
          variant: 'danger',
          message: 'Failed to get Gmail connect URL',
        });
        setIsLoading(false);
      }
    } catch (error) {
      addToast({
        variant: 'danger',
        message: 'Failed to start Gmail connection',
      });
      setIsLoading(false);
    }
  };

  // Show success/error messages from URL parameters only once on mount
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success === 'true') {
      addToast({
        variant: 'success',
        message: 'Gmail account connected successfully',
      });
      checkGmailStatus();
    } else if (error) {
      addToast({
        variant: 'danger',
        message: 'Failed to connect Gmail account',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  if (isLoading) {
    return (
      <Column fillWidth vertical="center" horizontal="center" padding="l">
        <Spinner size="xl" />
        <Text marginTop="m">Checking Gmail connection status...</Text>
      </Column>
    );
  }

  return (
    <Column fillWidth padding="l" gap="32">
      <Column gap="16">
        <Text variant="heading-strong-l">Email Settings</Text>
        <Text onBackground="neutral-weak">
          Connect your Gmail account to send emails to professors
        </Text>
      </Column>
      
      {isConnected ? (
        <Column gap="16">
          <Text color="success">✓ Gmail account is connected</Text>
          <Button
            variant="danger"
            label="Disconnect Gmail"
            onClick={() => {
              // TODO: Implement disconnect functionality
              addToast({
                variant: 'success',
                message: 'Disconnect functionality coming soon',
              });
            }}
          />
        </Column>
      ) : (
        <Button
          variant="primary"
          label="Connect Gmail"
          onClick={handleConnectGmail}
        />
      )}
    </Column>
  );
}