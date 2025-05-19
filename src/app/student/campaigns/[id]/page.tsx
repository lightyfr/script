'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Column,
  Row,
  Card,
  Heading,
  Text,
  Button,
  useToast,
  Spinner,
  Line,
  Table,
} from '@/once-ui/components';
import { createServerSupabaseClient } from '@/server';
import { cookies } from 'next/headers';
import { auth } from '@clerk/nextjs/server';

type Campaign = {
  id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  error_message?: string;
  created_at: string;
  research_interests: string[];
  target_universities: string[];
  max_emails: number;
};

type CampaignEmail = {
  id: string;
  professor_name: string;
  professor_email: string;
  university: string;
  department: string;
  research_areas: string[];
  status: 'sent' | 'failed';
  sent_at: string;
  error_message?: string;
};

export default function CampaignDetailsPage() {
  const params = useParams();
  const { addToast } = useToast();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [emails, setEmails] = useState<CampaignEmail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCampaignDetails = async () => {
      try {
        const response = await fetch(`/api/campaigns/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch campaign details');
        const data = await response.json();
        setCampaign(data.campaign);
        setEmails(data.emails);
      } catch (error) {
        console.error('Error fetching campaign details:', error);
        addToast({
          variant: 'danger',
          message: 'Failed to load campaign details. Please try refreshing.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaignDetails();
  }, [params.id, addToast]);

  if (isLoading) {
    return (
      <Column fillWidth vertical="center" horizontal="center" padding="l">
        <Spinner size="xl" />
        <Text marginTop="m">Loading campaign details...</Text>
      </Column>
    );
  }

  if (!campaign) {
    return (
      <Column fillWidth vertical="center" horizontal="center" padding="l">
        <Text>Campaign not found</Text>
      </Column>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'danger';
      case 'in_progress':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  return (
    <Column fillWidth padding="l" gap="32">
      <Column gap="16">
        <Heading variant="display-default-l">Campaign Details</Heading>
        <Text onBackground="neutral-weak">
          Track the progress of your outreach campaign.
        </Text>
      </Column>

      <Line />

      <Card fillWidth padding="32" radius="l">
        <Column gap="24">
          <Row gap="16" vertical="center">
            <Heading variant="heading-strong-l">Status</Heading>
            <Text
              variant="body-strong"
              color={getStatusColor(campaign.status)}
            >
              {campaign.status.toUpperCase()}
            </Text>
          </Row>

          {campaign.error_message && (
            <Text color="danger">{campaign.error_message}</Text>
          )}

          <Column gap="16">
            <Heading variant="heading-strong-m">Campaign Details</Heading>
            <Row gap="32">
              <Column>
                <Text variant="body-strong">Research Interests</Text>
                <Text>{campaign.research_interests.join(', ')}</Text>
              </Column>
              <Column>
                <Text variant="body-strong">Target Universities</Text>
                <Text>
                  {campaign.target_universities.length > 0
                    ? campaign.target_universities.join(', ')
                    : 'All Universities'}
                </Text>
              </Column>
              <Column>
                <Text variant="body-strong">Maximum Emails</Text>
                <Text>{campaign.max_emails}</Text>
              </Column>
            </Row>
          </Column>

          <Column gap="16">
            <Heading variant="heading-strong-m">Sent Emails</Heading>
            <Table
              columns={[
                { key: 'professor_name', label: 'Professor' },
                { key: 'university', label: 'University' },
                { key: 'department', label: 'Department' },
                { key: 'status', label: 'Status' },
                { key: 'sent_at', label: 'Sent At' },
              ]}
              data={emails.map((email) => ({
                ...email,
                status: (
                  <Text color={email.status === 'sent' ? 'success' : 'danger'}>
                    {email.status.toUpperCase()}
                  </Text>
                ),
                sent_at: email.sent_at
                  ? new Date(email.sent_at).toLocaleString()
                  : '-',
              }))}
            />
          </Column>
        </Column>
      </Card>
    </Column>
  );
}