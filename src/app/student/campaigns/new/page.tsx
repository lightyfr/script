"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Column,
  Row,
  Card,
  Heading,
  Text,
  Button,
  Input,
  Textarea,
  TagInput,
  useToast,
  Spinner,
  Line,
  Select,
  Tag,
  Dialog,
} from "@/once-ui/components";
import { useAuth } from "@clerk/nextjs";
import { createCampaign, getUserInterests } from './actions';

type CampaignFormData = {
  researchInterests: string[];
  targetUniversities: string[];
  maxEmails: number;
};

export default function NewCampaignPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { has } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CampaignFormData>({
    researchInterests: [],
    targetUniversities: [],
    maxEmails: 5,
  });
  const [interestsLoading, setInterestsLoading] = useState(true);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [previewEmail, setPreviewEmail] = useState<string>("");
  const [previewProfessor, setPreviewProfessor] = useState<{name: string; university: string; department: string} | null>(null);
  
  const hasSuper = has && has({ plan: 'script_super' });

  // Email limit options based on plan
  const emailLimitOptions = hasSuper 
    ? [
        { label: "5 emails", value: 5 },
        { label: "10 emails", value: 10 },
        { label: "25 emails", value: 25 },
        { label: "50 emails", value: 50 },
        { label: "100 emails", value: 100 },
        { label: "200 emails", value: 200 },
        { label: "500 emails", value: 500 },
      ]
    : [
        { label: "5 emails", value: 5 },
      ];

  // Load user's interests on mount
  useEffect(() => {
    let mounted = true;
    setInterestsLoading(true);
    getUserInterests()
      .then((interests) => {
        if (mounted) {
          setFormData((prev) => ({ ...prev, researchInterests: interests }));
        }
      })
      .catch((error) => {
        console.error('Failed to load user interests:', error);
        addToast({
          variant: 'danger',
          message: 'Could not load your research interests. You can still add them manually.',
        });
      })
      .finally(() => {
        if (mounted) setInterestsLoading(false);
      });
    return () => { mounted = false; };
  }, [addToast]);

  const handleGeneratePreview = async () => {
    if (formData.researchInterests.length === 0) {
      addToast({
        variant: "danger",
        message: "Please add at least one research interest to generate a preview.",
      });
      return;
    }

    setIsGeneratingPreview(true);
    try {
      const response = await fetch('/api/campaigns/preview-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          researchInterests: formData.researchInterests,
          hasSuper: hasSuper,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate preview email');
      }

      const data = await response.json();
      setPreviewEmail(data.email);
      setPreviewProfessor(data.professor);
      setIsPreviewDialogOpen(true);
    } catch (error) {
      console.error('Error generating preview email:', error);
      addToast({
        variant: "danger",
        message: "Failed to generate email preview. Please try again.",
      });
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.researchInterests.length === 0) {
      addToast({
        variant: "danger",
        message: "Please add at least one research interest.",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await createCampaign(formData);
      
      addToast({
        variant: "success",
        message: "Campaign created successfully!",
      });
      router.push("/student/campaigns");
    } catch (error) {
      console.error("Failed to create campaign:", error);
      addToast({
        variant: "danger",
        message: (error instanceof Error && error.message) || "Failed to create campaign. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Column fillWidth padding="l" gap="32">
      <Column gap="16">
        <Heading variant="display-default-l">Create New Campaign</Heading>
      </Column>

      <Line />

      <Column fillWidth padding="32" radius="l" background="surface" border="neutral-alpha-weak">
        {isLoading ? (
          <Column fillWidth vertical="center" horizontal="center" gap="16">
            <Spinner size="xl" />
            <Text>Creating your campaign...</Text>
          </Column>
        ) : (
          <form onSubmit={handleSubmit}>
            <Column gap="32">
              {/* Research Interests Section */}
              <Column gap="16">
                <Heading variant="heading-strong-l">Research Interests</Heading>
                <Text onBackground="neutral-weak">
                  What areas of research are you interested in? This will help us find relevant professors.
                </Text>
                {interestsLoading ? (
                  <Row gap="8" vertical="center">
                    <Spinner size="m" />
                    <Text>Loading your interests...</Text>
                  </Row>
                ) : (
                  <TagInput
                    id="research-interests"
                    label="Research Interests"
                    value={formData.researchInterests}
                    onChange={(interests) => setFormData({ ...formData, researchInterests: interests })}
                    placeholder="Add research interests..."
                  />
                )}
              </Column>

              <Line />

              {/* Target Universities Section */}
              <Column gap="16">
                <Heading variant="heading-strong-l">Target Universities</Heading>
                <Text onBackground="neutral-weak">
                  Which universities would you like to target? Leave empty to search all universities.
                </Text>
                <TagInput
                  id="universities"
                  label="Universities"
                  value={formData.targetUniversities}
                  onChange={(universities) => setFormData({ ...formData, targetUniversities: universities })}
                  placeholder="Add universities..."
                />
              </Column>

              <Line />

              {/* Email Limit Section */}
              <Column gap="16">
                <Row gap="8" vertical="center">
                  <Heading variant="heading-strong-l">Email Limit</Heading>
                  {!hasSuper && <Tag variant="neutral" label="Sent with Script" />}
                  {hasSuper && <Tag variant="brand" label="Pro" />}
                </Row>
                <Text onBackground="neutral-weak">
                  {hasSuper 
                    ? "Choose how many emails you'd like to send with your Pro plan."
                    : "Free plan is limited to 5 emails. Upgrade to Pro for higher limits."
                  }
                </Text>
                <Select
                  id="max-emails"
                  label="Maximum Emails to Send"
                  value={formData.maxEmails.toString()}
                  onSelect={(value) => setFormData({ ...formData, maxEmails: parseInt(value) })}
                  options={emailLimitOptions.map(option => ({
                    label: option.label,
                    value: option.value.toString()
                  }))}
                />
                {!hasSuper && (
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    💡 Upgrade to Script Pro to send up to 100 emails per campaign
                  </Text>
                )}
              </Column>

              <Line />

              {/* Email Preview Section */}
              <Column gap="16">
                <Heading variant="heading-strong-l">Email Preview</Heading>
                <Text onBackground="neutral-weak">
                  See how your personalized emails will look before sending your campaign.
                </Text>
                <Button
                  label={isGeneratingPreview ? "Generating Preview..." : "Generate Example Email"}
                  onClick={handleGeneratePreview}
                  disabled={formData.researchInterests.length === 0 || isGeneratingPreview}
                  variant="secondary"
                  size="m"
                />
              </Column>

              <Line />

              {/* Submit Button */}
              <Button
                label="Create Campaign"
                type="submit"
                disabled={formData.researchInterests.length === 0 || interestsLoading}
                size="l"
              />
            </Column>
          </form>
        )}
      </Column>

      {/* Email Preview Dialog */}
      <Dialog 
        isOpen={isPreviewDialogOpen} 
        onClose={() => setIsPreviewDialogOpen(false)} 
        title="Email Preview"
      >
        <Column gap="16">
          {previewProfessor && (
            <Column gap="8">
              <Text variant="label-default-m" onBackground="neutral-strong">
                Sample Professor:
              </Text>
              <Text variant="body-default-s" onBackground="neutral-weak">
                {previewProfessor.name} • {previewProfessor.department} • {previewProfessor.university}
              </Text>
            </Column>
          )}
          
          <Line />
          
          <Column gap="8">
            <Text variant="label-default-m" onBackground="neutral-strong">
              Generated Email:
            </Text>
            <Card padding="16" background="neutral-alpha-weak" radius="m">
              <Text 
                variant="body-default-s" 
                style={{ 
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace',
                  lineHeight: '1.5'
                }}
              >
                {previewEmail}
              </Text>
            </Card>
            
            {!hasSuper && (
              <Text variant="body-default-xs" onBackground="neutral-weak">
                ℹ️ Free plan emails include "Sent with Script" branding. Upgrade to Pro to remove it.
              </Text>
            )}
          </Column>
        </Column>
      </Dialog>
    </Column>
  );
}