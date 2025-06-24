"use client";

import React, { useState, useEffect } from "react";
import { Column, Row, Card, Heading, Text, Button, Icon, useToast, Feedback, Tag, Dialog, Line, Badge, Grid } from "@/once-ui/components";
import { getStudentCampaigns, CampaignDisplayData } from "./actions"; // Import the action and type
import styles from "./styles.module.scss"; // Assuming you have a CSS module for styles
export default function StudentCampaignsPage() { // Renamed component for clarity
  const [campaigns, setCampaigns] = useState<CampaignDisplayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { addToast } = useToast();  useEffect(() => {
    const fetchCampaigns = async () => {
      setIsLoading(true);
      try {
        const fetchedCampaigns = await getStudentCampaigns();
        // Sort campaigns by creation date (oldest first) so numbering is consistent
        const sortedCampaigns = fetchedCampaigns.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        // Reverse for display (newest first) but keep chronological numbering
        setCampaigns(sortedCampaigns.reverse());
      } catch (error) {
        console.error("Failed to fetch campaigns:", error);
        addToast({ variant: "danger", message: "Could not load campaigns." }); // Changed "error" to "danger"
        setCampaigns([]); // Set to empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, [addToast]);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'check';
      case 'in_progress': return 'clock';
      case 'active': return 'play';
      case 'queued': return 'clock';
      case 'failed': return 'x';
      case 'draft': return 'edit';
      default: return 'clock';
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

  return (
    <Column fillWidth paddingX="l" paddingY="l" gap="32">
      <Row fillWidth horizontal="space-between" vertical="center">
        <Column gap="8">
          <Heading variant="display-strong-m">Your Campaigns</Heading>
          <Text variant="body-default-s" onBackground="neutral-weak">
            {campaigns.length} {campaigns.length === 1 ? 'campaign' : 'campaigns'} total
          </Text>
        </Column>
        <Row gap="12" vertical="center">          <Row gap="4" padding="4" radius="m" background="neutral-alpha-weak">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'secondary'}
              size="s"
              prefixIcon="grid"
              onClick={() => setViewMode('grid')}
            />
            <Button
              variant={viewMode === 'list' ? 'primary' : 'secondary'}
              size="s"
              prefixIcon="list"
              onClick={() => setViewMode('list')}
            />
          </Row>
          <Button href="/student/campaigns/new" label="Create Campaign" suffixIcon="plus" />
        </Row>
      </Row>

      {isLoading && (
        <Grid columns="3" tabletColumns="2" mobileColumns="1" gap="24">
          {[...Array(6)].map((_, i) => (
            <Card key={i} padding="24" radius="l" fillWidth>
              <Column gap="16">
                <Row gap="12" vertical="center">
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--neutral-alpha-medium)' }} />
                  <div style={{ width: '80px', height: '16px', borderRadius: '4px', backgroundColor: 'var(--neutral-alpha-medium)' }} />
                </Row>
                <div style={{ width: '100%', height: '40px', borderRadius: '4px', backgroundColor: 'var(--neutral-alpha-weak)' }} />
                <div style={{ width: '60%', height: '16px', borderRadius: '4px', backgroundColor: 'var(--neutral-alpha-weak)' }} />
              </Column>
            </Card>
          ))}
        </Grid>
      )}

      {!isLoading && campaigns.length === 0 && (
        <Column fillWidth vertical="center" horizontal="center" padding="48" gap="24">
          <Icon name="campaign" size="xl" />
          <Column gap="8" horizontal="center">
            <Heading variant="heading-strong-l">No campaigns yet</Heading>
            <Text variant="body-default-m" onBackground="neutral-weak" align="center">
              Start reaching out to professors by creating your first campaign
            </Text>
          </Column>
          <Button href="/student/campaigns/new" label="Create Your First Campaign" suffixIcon="plus" />
        </Column>
      )}

      {!isLoading && campaigns.length > 0 && (
        <>
          {viewMode === 'grid' ? (            <Grid columns="3" tabletColumns="2" mobileColumns="1" gap="24">
              {campaigns.map((campaign, index) => (
                <Card 
                  key={campaign.id} 
                  padding="24"
                  radius="l" 
                  fillWidth 
                  href={`/student/campaigns/${campaign.id}`}
                  background="surface"
                  border="neutral-alpha-weak"
                >
                  <Column gap="20" fillWidth>
                    {/* Header */}                    <Row fillWidth horizontal="space-between" vertical="start">
                      <Column gap="4" style={{ flex: 1 }}>                        <Text variant="body-strong-m" wrap="balance">
                          Campaign {campaign.type ? campaign.type.charAt(0).toUpperCase() + campaign.type.slice(1) : ''} #{campaigns.length - index}
                        </Text>
                        <Text variant="label-default-s" onBackground="neutral-weak">
                          Created {new Date(campaign.created_at).toLocaleDateString()}
                        </Text>
                      </Column>
                      <Tag
                        size="l"
                        variant={getStatusColor(campaign.status)}
                        prefixIcon={getStatusIcon(campaign.status)}
                      >
                        {getStatusLabel(campaign.status)}
                      </Tag>
                    </Row>

                    {/* Content */}
                    <Column gap="16" fillHeight>                      <Column gap="8">
                        <Text variant="label-default-m" onBackground="neutral-weak">
                          {getInterestsLabel(campaign.type || 'research')}
                        </Text>                        <Column gap="4">
                          {campaign.research_interests?.slice(0, 2).map((interest, idx) => (
                            <Column paddingY="4" fitWidth radius="m" border="neutral-alpha-medium" shadow={undefined} paddingX="8" key={idx}>
                              {interest}
                            </Column>
                          ))}
                          {(campaign.research_interests?.length || 0) > 2 && (
                            <Text variant="body-default-xs" onBackground="neutral-weak">
                              +{(campaign.research_interests?.length || 0) - 2} more
                            </Text>
                          )}
                        </Column>
                      </Column>

                      <Column gap="8">
                        <Text variant="label-default-m" onBackground="neutral-weak">
                          {getTargetsLabel(campaign.type || 'research')}
                        </Text>                        <Text variant="body-default-s" style={{ 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {campaign.target_universities?.join(', ') || `No ${getTargetsLabel(campaign.type || 'research').toLowerCase()} specified`}
                        </Text>
                      </Column>
                    </Column>                    {/* Footer */}
                    <Row fillWidth horizontal="space-between" vertical="center" paddingTop="8" borderTop="neutral-alpha-weak">
                      <Column gap="2">
                        <Text variant="label-default-xs" onBackground="neutral-weak">
                          Emails Sent
                        </Text>
                        <Text variant="body-strong-s">
                          {campaign.sentEmails}/{campaign.max_emails || '∞'}
                        </Text>
                      </Column>
                      <Icon name="chevronRight" size="s" />
                    </Row>
                  </Column>
                </Card>
              ))}
            </Grid>
          ) : (
            <Column gap="s" fillWidth>
              {campaigns.map((campaign, index) => (                <Card
                  key={campaign.id}
                  radius="m"
                  padding="24"
                  fillWidth
                  href={`/student/campaigns/${campaign.id}`}
                  background="surface"
                  border="neutral-alpha-weak"
                >
                  <Row fillWidth horizontal="space-between" vertical="center" gap="24">
                    {/* Main Info */}                    <Column gap="8" style={{ flex: 1 }}>
                      <Row gap="12" vertical="center">                        <Text variant="body-strong-m">
                          Campaign #{campaigns.length - index}
                        </Text>
                        <Tag
                          variant={getStatusColor(campaign.status)}
                          prefixIcon={getStatusIcon(campaign.status)}
                          size="m"
                        >
                          {getStatusLabel(campaign.status)}
                        </Tag>
                      </Row>
                      <Text variant="body-default-s" onBackground="neutral-weak">
                        {campaign.research_interests?.slice(0, 3).join(', ') || 'No interests specified'}
                        {(campaign.research_interests?.length || 0) > 3 && ` +${(campaign.research_interests?.length || 0) - 3} more`}
                      </Text>
                    </Column>                    {/* Universities */}
                    <Column gap="4" style={{ flex: 1.5 }}>
                      <Text variant="label-default-s" onBackground="neutral-weak">
                        {getTargetsLabel(campaign.type || 'research')}
                      </Text>
                      <Text variant="body-default-s" style={{ 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap' 
                      }}>
                        {campaign.target_universities?.join(', ') || `No ${getTargetsLabel(campaign.type || 'research').toLowerCase()} specified`}
                      </Text>
                    </Column>                    {/* Stats */}
                    <Row gap="32" vertical="center">
                      <Column gap="4" horizontal="center">
                        <Text variant="label-default-s" onBackground="neutral-weak">
                          Emails Sent
                        </Text>
                        <Text variant="body-strong-m">
                          {campaign.sentEmails}/{campaign.max_emails || '∞'}
                        </Text>
                      </Column>
                      <Column gap="4" horizontal="center">
                        <Text variant="label-default-s" onBackground="neutral-weak">
                          Created
                        </Text>
                        <Text variant="body-default-s">
                          {new Date(campaign.created_at).toLocaleDateString()}
                        </Text>
                      </Column>
                    </Row>

                    <Icon name="chevronRight" size="s" />
                  </Row>
                </Card>
              ))}
            </Column>
          )}
        </>
      )}
    </Column>
  );
}