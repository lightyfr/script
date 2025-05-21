"use client";

import React, { useState, useEffect } from "react";
import { Column, Row, Card, Heading, Text, Button, Icon, useToast, Feedback, Tag, Dialog, Line, Badge } from "@/once-ui/components";
import { getStudentCampaigns, CampaignDisplayData } from "./actions"; // Import the action and type
import styles from "./styles.module.scss"; // Assuming you have a CSS module for styles
export default function StudentCampaignsPage() { // Renamed component for clarity
  const [campaigns, setCampaigns] = useState<CampaignDisplayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchCampaigns = async () => {
      setIsLoading(true);
      try {
        const fetchedCampaigns = await getStudentCampaigns();
        setCampaigns(fetchedCampaigns);
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

  return (
    <Column fillWidth paddingX="l" paddingY="l" gap="32">
      <Row fillWidth horizontal="space-between" align="center">
        <Heading variant="display-strong-m">Your Campaigns</Heading>
        <Button href="/student/campaigns/new" label="Create New Campaign" />
      </Row>

      {isLoading && <Text>Loading campaigns...</Text>}

      {!isLoading && campaigns.length === 0 && (
        <Feedback
          variant="info"
          title="No Campaigns Yet"
          description="You haven't created any campaigns. Get started by creating a new one!"
          actionButtonProps={{ href: "/student/campaigns/new", label: "Create Campaign" }}
        />
      )}

      {!isLoading && campaigns.length > 0 && (
        <Column fillWidth gap="0" paddingBottom="s"> {/* Set gap to 0 to bring rows closer */}
          {/* Table Header */}
          <Column padding="m" border="neutral-alpha-weak" fillWidth radius="s">
            <Row fillWidth horizontal="space-between" align="center" gap="m">
              <Text variant="body-strong-s" style={{ flex: 1.5 }}>Campaign ID</Text>
              <Text variant="body-strong-s" style={{ flex: 1 }}>Status</Text>
              <Text variant="body-strong-s" style={{ flex: 2 }}>Research Interests</Text>
              <Text variant="body-strong-s" style={{ flex: 2 }}>Target Universities</Text>
              <Text variant="body-strong-s" style={{ flex: 1 }}>Max Emails</Text>
              <Text variant="body-strong-s" style={{ flex: 1 }}>Created</Text>
              <Text variant="body-strong-s" style={{ flex: 0.5 }}></Text> {/* For potential actions */}
            </Row>
          </Column>

          {/* Table Body */}
          {campaigns.map((campaign) => (
            <React.Fragment key={campaign.id}>
              {/* Removed Card from individual rows, Row now has padding to align with header */}
              <Row fillWidth className={styles.hover} transition="macro-medium" background="surface" borderBottom="neutral-alpha-weak" borderRight="neutral-alpha-weak" borderLeft="neutral-alpha-weak" horizontal="space-between" align="center">
                <Row gap="m" padding="m" fill>
                <Text variant="body-default-s" style={{ flex: 1.5 }}>{campaign.id.substring(0, 8)}...</Text>
                <Column style={{ flex: 1 }} horizontal="center" align="center">
                  <Tag variant={
                    campaign.status === 'completed' ? 'success' :
                    campaign.status === 'in_progress' ? 'neutral' :
                    campaign.status === 'active' || campaign.status === 'warning' ? 'warning' :
                    campaign.status === 'queued' ? 'neutral' :
                    campaign.status === 'failed' ? 'danger' : 'danger'
                  }
                  label={campaign.status === 'completed' ? 'Success' : campaign.status === 'active' || campaign.status === 'queued' ? 'Queued' : campaign.status === 'in_progress' ? 'In Progress' : campaign.status === 'warning' ? 'Warning' : campaign.status === 'draft' ? 'Draft' : 'Failed'}
                  prefixIcon={campaign.status === 'completed' ? 'check' : campaign.status === 'active' || campaign.status === 'warning' ? 'warning' : campaign.status === 'queued' ? 'clock' : campaign.status === 'failed' ? 'danger' :  campaign.status === 'in_progress' ? 'clock' : campaign.status === 'draft' ? 'draft' : 'danger'}>
                    {campaign.status}
                  </Tag>
                </Column>
                <Text variant="body-default-s" style={{ flex: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={campaign.research_interests?.join(', ') || 'N/A'}>
                  {campaign.research_interests?.join(', ') || 'N/A'}
                </Text>
                <Text variant="body-default-s" style={{ flex: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={campaign.target_universities?.join(', ') || 'N/A'}>
                  {campaign.target_universities?.join(', ') || 'N/A'}
                </Text>
                <Text variant="body-default-s" style={{ flex: 1 }}>{campaign.max_emails ?? 'N/A'}</Text>
                <Text variant="body-default-s" style={{ flex: 1 }}>{new Date(campaign.created_at).toLocaleDateString()}</Text>
                <Column style={{ flex: 0.5 }} align="end">
                  {/* Example: <Button size="s" variant="secondary" icon="eye" href={`/student/campaigns/${campaign.id}`} /> */}
                </Column>
                </Row>
              </Row>
              {/* Removed Line separator from between rows */}
            </React.Fragment>
          ))}
        </Column>
      )}
    </Column>
  );
}