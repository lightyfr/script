"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heading,
  Text,
  Button,
  Icon,
  InlineCode,
  Logo,
  // Input, // Keep if needed for a contact form or demo input
  // Avatar,
  // AvatarGroup,
  // Textarea, // Keep if needed
  // PasswordInput,
  // SegmentedControl,
  SmartLink,
  // Dialog,
  // Feedback,
  // SmartImage, // Keep if we decide to use images
  Line,
  LogoCloud,
  Background,
  // Select,
  useToast,
  Card,
  Fade,
  // StatusIndicator,
  // DateRangePicker,
  // type DateRange,
  TiltFx,
  // HoloFx,
  IconButton,
  // TagInput,
  // Switch,
  Column,
  Row,
  // StyleOverlay,
  // CompareImage,
  ThemeSwitcher,
  RevealFx,
  Badge,
} from "@/once-ui/components";
// import { CodeBlock, MediaUpload } from "@/once-ui/modules"; // Remove if not used for code or media
import { ScrollToTop } from "@/once-ui/components/ScrollToTop";

export default function ConnectPage() {
  const { addToast } = useToast();
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(false); // Add state for LinkedIn connection

  // Placeholder function for LinkedIn connection
  const handleConnectLinkedIn = async () => {
    // TODO: Implement LinkedIn OAuth flow
    addToast({
      variant: "danger",
      message: "LinkedIn connection functionality to be implemented.",
    });
    // For now, let's simulate a successful connection for UI purposes
    // setIsLinkedInConnected(true); 
  };

  return (
    <Column fillWidth paddingX="l" paddingY="l" gap="s">
      <Row fillWidth horizontal="space-between" align="center">
        <Heading variant="display-strong-m">Connect</Heading>
        <Button href="/student/campaigns/new" label="Create New Campaign" />
      </Row>
      <Column fillWidth padding="xl" gap="xl" border="neutral-weak" radius="l">
        {/* LinkedIn Connection Section */}
        <Column fillWidth horizontal="center" gap="l" align="center" padding="m" borderBottom="neutral-weak">
          <Column gap="s">
            <Heading variant="display-strong-xs">LinkedIn Integration</Heading>
            <Text  onBackground="neutral-weak">
              Connect your LinkedIn account to find and connect with professors.
            </Text>
          </Column>
          {isLinkedInConnected ? (
            <Badge/>
          ) : (
            <Button
              label="Connect LinkedIn"
              onClick={handleConnectLinkedIn}
              prefixIcon="link" // Assuming you have a 'link' icon or similar
            />
          )}
        </Column>

        {isLinkedInConnected && (
          <Column fillWidth padding="m" gap="m">
            <Text variant="body-strong-m">LinkedIn Actions</Text>
            {/* Placeholder for LinkedIn search, connect, and messaging features */}
            <Text onBackground="neutral-weak">
              Search for professors, send connection requests, and draft personalized messages here. (Functionality to be implemented)
            </Text>
          </Column>
        )}
      </Column>
    </Column>
  );
}