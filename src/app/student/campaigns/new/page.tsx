"use client";

import { useState } from "react";
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
} from "@/once-ui/components";
import { createCampaign } from './actions';

type CampaignFormData = {
  researchInterests: string[];
  targetUniversities: string[];
  emailTemplate: string;
  maxEmails: number;
};

export default function NewCampaignPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<CampaignFormData>({
    researchInterests: [],
    targetUniversities: [],
    emailTemplate: "",
    maxEmails: 50,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Column gap="24">
            <Heading variant="heading-strong-l">Research Interests</Heading>
            <Text onBackground="neutral-weak">
              What areas of research are you interested in? This will help us find relevant professors.
            </Text>
            <TagInput
              id="research-interests"
              label="Research Interests"
              value={formData.researchInterests}
              onChange={(interests) => setFormData({ ...formData, researchInterests: interests })}
              placeholder="Add research interests..."
            />
            <Row gap="16">
              <Button
                variant="secondary"
                label="Back to Dashboard"
                onClick={() => router.push('/student/dashboard')}
              />
              <Button
                label="Next"
                onClick={() => setStep(2)}
                disabled={formData.researchInterests.length === 0}
              />
            </Row>
          </Column>
        );
      case 2:
        return (
          <Column gap="24">
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
            <Row gap="16">
              <Button
                variant="secondary"
                label="Back"
                onClick={() => setStep(1)}
              />
              <Button
                label="Next"
                onClick={() => setStep(3)}
              />
            </Row>
          </Column>
        );
      case 3:
        return (
          <Column gap="24">
            <Heading variant="heading-strong-l">Email Template</Heading>
            <Text onBackground="neutral-weak">
              Write a template for your outreach emails. Use placeholders like [PROFESSOR_NAME] and [RESEARCH_AREA] that will be automatically filled.
            </Text>
            <Textarea
              id="email-template"
              label="Email Template"
              value={formData.emailTemplate}
              onChange={(e) => setFormData({ ...formData, emailTemplate: e.target.value })}
              placeholder="Dear [PROFESSOR_NAME],\n\nI am writing to express my interest in your research on [RESEARCH_AREA]..."
              rows={10}
            />
            <Input
              id="max-emails"
              type="number"
              label="Maximum Emails to Send"
              value={formData.maxEmails}
              onChange={(e) => setFormData({ ...formData, maxEmails: parseInt(e.target.value) })}
              min={1}
              max={100}
            />
            <Row gap="16">
              <Button
                variant="secondary"
                label="Back"
                onClick={() => setStep(2)}
              />
              <Button
                label="Create Campaign"
                onClick={handleSubmit}
                disabled={!formData.emailTemplate}
              />
            </Row>
          </Column>
        );
    }
  };

  return (
    <Column fillWidth padding="l" gap="32">
      <Column gap="16">
        <Heading variant="display-default-l">Create New Campaign</Heading>
        <Text onBackground="neutral-weak">
          Let's find professors and send personalized outreach emails.
        </Text>
      </Column>

      <Line />

      <Card fillWidth padding="32" radius="l">
        {isLoading ? (
          <Column fillWidth vertical="center" horizontal="center" gap="16">
            <Spinner size="xl" />
            <Text>Creating your campaign...</Text>
          </Column>
        ) : (
          renderStep()
        )}
      </Card>
    </Column>
  );
} 