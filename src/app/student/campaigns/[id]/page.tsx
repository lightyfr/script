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
  Tag,
  Badge,
} from '@/once-ui/components';
import { getCampaignDetails, getCampaignEmails, getCampaignNumber, CampaignDetails, CampaignEmail } from './actions';
import { Icon } from '@once-ui-system/core';

export default function CampaignDetailsPage() {
  const params = useParams();
  const { addToast } = useToast();  const [campaign, setCampaign] = useState<CampaignDetails | null>(null);
  const [emails, setEmails] = useState<CampaignEmail[]>([]);
  const [campaignNumber, setCampaignNumber] = useState<{ number: number; total: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCampaignData = async () => {
      if (!params.id || typeof params.id !== 'string') {
        addToast({ variant: 'danger', message: 'Invalid campaign ID' });
        setIsLoading(false);
        return;
      }      try {
        const [campaignData, emailData, numberData] = await Promise.all([
          getCampaignDetails(params.id),
          getCampaignEmails(params.id),
          getCampaignNumber(params.id)
        ]);

        setCampaign(campaignData);
        setEmails(emailData);
        setCampaignNumber(numberData);
      } catch (error) {
        console.error('Error fetching campaign data:', error);
        addToast({ variant: 'danger', message: 'Failed to load campaign details' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaignData();
  }, [params.id, addToast]);  const [lastClickedEmail, setLastClickedEmail] = useState<string | null>(null);

  const handleEmailClick = (email: CampaignEmail) => {
    if (email.gmail_thread_id && lastClickedEmail !== email.id) {
      setLastClickedEmail(email.id);
      
      console.log('Opening Gmail with thread ID:', email.gmail_thread_id);
      
      // Try using the sent folder URL format since these are sent emails
      const gmailUrl = `https://mail.google.com/mail/u/0/#inbox/${email.gmail_thread_id}`;
      console.log('Gmail URL:', gmailUrl);
      
      window.open(gmailUrl, '_blank', 'noopener,noreferrer');
      
      // Reset the click tracking after a delay
      setTimeout(() => {
        setLastClickedEmail(null);
      }, 2000);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'info';
      case 'active': return 'warning';
      case 'queued': return 'neutral';
      case 'failed': return 'danger';
      case 'draft': return 'warning';
      default: return 'neutral';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in_progress': return 'In Progress';
      case 'active': return 'Active';
      case 'queued': return 'Queued';
      case 'failed': return 'Failed';
      case 'draft': return 'Draft';
      default: return status;
    }
  };

  const getInterestsLabel = (campaignType: string) => {
    switch (campaignType) {
      case 'research': return 'Research Interests';
      case 'internship': return 'Roles';
      case 'job': return 'Roles';
      case 'custom': return 'Target Audience';
      default: return 'Interests';
    }
  };

  const getTargetsLabel = (campaignType: string) => {
    switch (campaignType) {
      case 'research': return 'Target Universities';
      case 'internship': return 'Target Companies';
      case 'job': return 'Target Companies';
      case 'custom': return 'Target Organizations';
      default: return 'Targets';
    }
  };

  if (isLoading) {
    return (
      <Column fillWidth vertical="center" horizontal="center" padding="l" gap="16">
        <Spinner size="xl" />
        <Text>Loading campaign details...</Text>
      </Column>
    );
  }

  if (!campaign) {
    return (
      <Column fillWidth vertical="center" horizontal="center" padding="l" gap="16">
        <Text variant="heading-strong-l">Campaign not found</Text>
        <Text onBackground="neutral-weak">This campaign may have been deleted or you don't have access to it.</Text>
        <Button href="/student/campaigns" label="Back to Campaigns" />
      </Column>
    );
  }
  return (
    <Column fillWidth paddingX="l" paddingY="l" gap="32">      {/* Breadcrumb */}
      <Row gap="8" vertical="center">
        <Button 
          href="/student/campaigns" 
          variant="tertiary" 
          size="s"
          label="Campaigns"
          style={{ 
            textDecoration: 'underline',
            padding: '0',
            minHeight: 'auto',
            fontSize: 'inherit'
          }}
        />
        <Text variant="body-default-s" onBackground="neutral-weak">&gt;</Text>        <Text variant="body-default-s" onBackground="neutral-weak">
          {campaign.type ? campaign.type.charAt(0).toUpperCase() + campaign.type.slice(1) : 'Campaign'} Campaign #{campaignNumber?.number || '?'} of {campaignNumber?.total || '?'}
        </Text>
      </Row>
      {/* Header */}
      <Row fillWidth horizontal="space-between" vertical="center">
        <Column gap="8">
          <Heading variant="display-strong-m">
            Campaign {campaign.type ? campaign.type.charAt(0).toUpperCase() + campaign.type.slice(1) : ''} Details
          </Heading>
          <Text variant="body-default-s" onBackground="neutral-weak">
            Created {new Date(campaign.created_at).toLocaleDateString()}
          </Text>
        </Column>
        <Tag
          size="l"
          variant={getStatusColor(campaign.status)}
        >
          {getStatusLabel(campaign.status)}
        </Tag>
      </Row>

      {/* Campaign Info Card */}
      <Column fillWidth border='neutral-alpha-weak' padding="24" radius="l">
        <Column gap="24">
          <Heading variant="heading-strong-l">Campaign Overview</Heading>
          
          {campaign.error_message && (
            <Card padding="16" radius="m" border="danger-medium" background="danger-alpha-weak">
              <Text color="danger">{campaign.error_message}</Text>
            </Card>
          )}

          <Row gap="32" wrap>
            <Column gap="8" style={{ minWidth: '200px' }}>
              <Text variant="label-default-m" onBackground="neutral-weak">
                {getInterestsLabel(campaign.type || 'research')}
              </Text>
              <Column gap="4">
                {campaign.research_interests?.map((interest, idx) => (
                            <Column paddingY="4" fitWidth radius="m" border="neutral-alpha-medium" shadow={undefined} paddingX="8" key={idx}>
                    {interest}
                  </Column>
                ))}
                {(!campaign.research_interests || campaign.research_interests.length === 0) && (
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    No interests specified
                  </Text>
                )}
              </Column>
            </Column>

            <Column gap="8" style={{ minWidth: '200px' }}>
              <Text variant="label-default-m" onBackground="neutral-weak">
                {getTargetsLabel(campaign.type || 'research')}
              </Text>
              <Text variant="body-default-s">
                {campaign.target_universities?.length > 0
                  ? campaign.target_universities.join(', ')
                  : `No ${getTargetsLabel(campaign.type || 'research').toLowerCase()} specified`}
              </Text>
            </Column>

            <Column gap="8" style={{ minWidth: '120px' }}>
              <Text variant="label-default-m" onBackground="neutral-weak">
                Maximum Emails
              </Text>
              <Text variant="body-strong-m">
                {campaign.max_emails || 'Unlimited'}
              </Text>
            </Column>
          </Row>
        </Column>
      </Column>

      {/* Emails Section */}
      <Column fillWidth padding="24" border='neutral-alpha-weak' radius="l">
        <Column gap="24">          <Row horizontal="space-between" vertical="center">
            <Heading variant="heading-strong-l">Email Campaign Results</Heading>
            <Row gap="16" vertical="center">
              <Text variant="body-default-s" onBackground="neutral-weak">
                {emails.length} {emails.length === 1 ? 'email' : 'emails'} sent
              </Text>
              <Button 
                href="/student/inbox" 
                variant="tertiary" 
                size="s"
                label="View All Emails"
              />
            </Row>
          </Row>{emails.length > 0 ? (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))', 
              gap: '16px',
              width: '100%'
            }}>              {emails.map((email) => (
                <Card 
                  key={email.id} 
                  fillWidth 
                  padding="16" 
                  radius="m" 
                  border="neutral-alpha-weak"
                  style={{ 
                    cursor: email.gmail_thread_id ? 'pointer' : 'default',
                    transition: email.gmail_thread_id ? 'transform 0.2s ease, box-shadow 0.2s ease' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (email.gmail_thread_id) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (email.gmail_thread_id) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '';
                    }
                  }}
                  onClick={() => handleEmailClick(email)}
                >
                  <Column gap="12" fillWidth>
                    <Row horizontal="space-between" vertical="start" gap="16">
                      <Column gap="8" style={{ flex: 1 }}>
                        <Text variant="body-strong-s">{email.professor_name}</Text>
                        <Text variant="body-default-s" onBackground="neutral-weak">
                          {email.professor_email}
                        </Text>
                        <Text variant="label-default-s" onBackground="neutral-weak">
                          {email.university} • {email.department}
                        </Text>
                      </Column>
                        <Column fillHeight horizontal="end" vertical='space-between'>
                        <Tag radius='s' variant={email.status === 'sent' ? 'success' : 'danger'} size="m">
                          {email.status === 'sent' ? 'Sent' : 'Failed'}
                        </Tag>
                        {email.gmail_thread_id && (
                          <Row vertical='center' paddingX='8' radius='s' background='brand-alpha-weak' gap='4'>
                          <Text variant="body-default-m" onBackground="brand-weak" style={{ fontSize: '11px' }}>
                            Open in Gmail
                          </Text>
                          <Icon onBackground='brand-weak' name="chevronRight" size="xs" />
                          </Row>
                        )}
                      </Column>
                    </Row>
                    
                {/*    {email.error_message && (
                      <Text variant="body-default-s" color="danger">
                        Error: {email.error_message}
                      </Text>
                    )} */}
                    
                  </Column>
                </Card>
              ))}
            </div>
          ) : (
            <Column fillWidth vertical="center" horizontal="center" padding="32" gap="16">
              <Text variant="body-default-m" onBackground="neutral-weak">
                No emails have been sent for this campaign yet.
              </Text>
              <Text variant="body-default-s" onBackground="neutral-weak">
                The campaign may still be processing or pending.
              </Text>
            </Column>
          )}
        </Column>
      </Column>

      {/* Back Button */}
      <Row>
        <Button href="/student/campaigns" variant="secondary" label="Back to Campaigns" />
      </Row>
    </Column>
  );
}