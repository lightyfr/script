// Example page: delete the content or rework the blocks
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
} from "@/once-ui/components";
// import { CodeBlock, MediaUpload } from "@/once-ui/modules"; // Remove if not used for code or media
import { ScrollToTop } from "@/once-ui/components/ScrollToTop";
import { Header } from "./Header";

export default function Home() {
  const { addToast } = useToast(); // Keep for potential notifications

  const dynamicPhrases = [
    "in Computer Science",
    "at Stanford University",
    "for AI Research",
    "in Biomedical Engineering",
    "at MIT Research",
    "for Quantum Physics",
    "in Neuroscience",
    "at UC Berkeley",
    "for Cutting-Edge Projects"
  ];
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setPhraseIndex(prevIndex => (prevIndex + 1) % dynamicPhrases.length);
    }, 2800); // Change every 2.8 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

  const currentPhrase = dynamicPhrases[phraseIndex];

  // Animation variants for the dynamic text
  const textAnimationVariants = {
    initial: { opacity: 0, y: 10 }, // Start transparent and slightly down
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.3, ease: "easeIn" } }, // Exit transparent and slightly up
  };

  // Removed old state variables: selectedValue, selectedRange, dialog states, email, password, tags, twoFA, intro

  // Removed old functions: handleSelect, validateIntro, validateLogin

  const links = [ // Keeping this for the footer, might adjust later
    {
      href: "https://once-ui.com/docs/theming",
      title: "Get Started",
      description: "Create an account with Script",
    },
    {
      href: "https://once-ui.com/docs/flexComponent",
      title: "Enter Your Details",
      description: "Fill out your research interests, skills, and add a resume",
    },
    {
      href: "https://once-ui.com/docs/typography",
      title: "Let Script Work",
      description: "Script will find professors and send emails, all while you sleep",
    },
  ];

  return (
    <Column fillWidth paddingX="s" horizontal="center" flex={1}>
      <ScrollToTop><IconButton variant="secondary" icon="chevronUp"/></ScrollToTop>
      <Fade
        zIndex={3}
        pattern={{
          display: true,
          size: "2",
        }}
        position="fixed"
        top="0"
        left="0"
        to="bottom"
        height={5}
        fillWidth
        blur={0.25}
      />
      <Header/>
      <Column
        as="main"
        paddingX="l"
        position="relative"
        radius="xl"
        horizontal="center"
        // border="neutral-alpha-weak" // Optional border for main content container
        fillWidth
        gap="160" // Increased gap between sections
        paddingBottom="80" // Padding at the bottom of the main content
      >
                  
          <Background
            mask={{
              x: 0,
              y: 50,
              radius: 100,
            }}
            position="absolute"
            zIndex={-1}
            grid={{
              display: false,
              width: "0.25rem",
              color: "neutral-alpha-weak",
              height: "0.25rem",
            }}
          />
        {/* HERO SECTION */}
        <Column
          fillWidth
          horizontal="center"
          gap="24" // Adjusted gap for a tighter feel with the new badge
          paddingTop="104" // Kept user's paddingTop adjustment
          paddingX="32"
          position="relative"
        >
          <Background
            mask={{
              x: 80,
              y: 0,
              radius: 100,
            }}
            position="absolute"
            zIndex={-1}
            gradient={{
              display: true,
              tilt: -35,
              height: 50,
              width: 75,
              x: 100,
              y: 40,
              colorStart: "accent-solid-medium",
              colorEnd: "static-transparent",
            }}
          />

          {/* BADGE / ACCENT ABOVE HEADING */}
          <RevealFx>
          <InlineCode marginTop="xl" radius="full" shadow="m" fit paddingX="16" paddingY="8" background="accent-alpha-weak" onBackground="accent-strong" marginBottom="16">
            AI-Powered Outreach ✨
          </InlineCode>
          </RevealFx>

<RevealFx delay={0.1}>
          <Heading paddingTop="0" wrap="balance" variant="display-strong-xl" align="center" marginBottom="16"> {/* Removed paddingTop="80", badge adds space now*/}
            Connect with Professors{" "}
            <AnimatePresence mode="wait"> {/* mode="wait" ensures one animation finishes before the next starts */}
              <motion.span
                key={currentPhrase} // Important: key change triggers the animation
                variants={textAnimationVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                style={{
                  display: "inline-block", // Needed for transforms and proper layout
                  verticalAlign: "middle", // Aligns nicely with the static text part
                  // This attempts to replicate Once UI's onBackground="accent-strong".
                  // You might need to adjust the CSS variable (--accent-strong)
                  // or use a direct color value from your theme if this doesn't pick up the correct color.
                  color: "var(--accent-strong)",
                }}
              >
                {currentPhrase}
              </motion.span>
            </AnimatePresence>
          </Heading>
          </RevealFx>

          {/* CONCISE HERO DESCRIPTION */}
          <RevealFx delay={0.2}>
          <Column maxWidth="m" horizontal="center"> {/* Added Column wrapper for Text for maxWidth control */}
            <Text align="center" variant="body-default-l" onBackground="neutral-weak"> {/* Removed maxWidth from Text */}
              Mass send <Text onBackground="neutral-strong" variant="body-strong-m">personalized </Text> emails to land your <Text onBackground="neutral-strong" variant="body-strong-m">dream </Text> research position.
            </Text>
          </Column>
          </RevealFx>

          {/* HERO IMAGE */}

      <Column paddingTop="s">
        <RevealFx delay={0.3}>
          <Button
            id="getStartedHero"
            label="Get Started Now"
            size="l" // Changed from xl to l
            variant="primary" // Primary action color
            arrowIcon // Adds a subtle arrow
            onClick={() => addToast({ variant: "success", message: "Get Started Clicked!"})} // Changed variant to success
          />
          </RevealFx>
          </Column>
        </Column>

        {/* PROBLEM / PAIN POINTS SECTION */}
        <Column fillWidth paddingX="32" paddingTop="xl" gap="24" horizontal="center" position="relative">
            <Heading as="h2" variant="display-default-l" align="center">
            Tired of the{" "}
            <InlineCode
              paddingX="12"
              paddingY="4"
              radius="xl"
              background="surface"
              border="neutral-alpha-medium"
              onBackground="neutral-strong"
            >
              Research Grind
            </InlineCode>
            ?
            </Heading>
          <Text align="center" onBackground="neutral-weak" marginBottom="32">
            Finding and contacting professors for research is <Text onBackground="neutral-strong" variant="body-strong-m">time-consuming </Text>and often <Text onBackground="neutral-strong" variant="body-strong-m">frustrating </Text>.
          </Text>
          <Row fillWidth gap="24" mobileDirection="column" horizontal="center">
            <Card fill direction="column" paddingY="48" padding="32" radius="l" border="neutral-alpha-medium" horizontal="center">
              <Icon name="search" size="xl" onBackground="accent-strong" marginBottom="16"/>
              <Column gap="4">
              <Heading as="h3" variant="heading-strong-m" align="center">Endless Searching</Heading>
              <Text align="center" onBackground="neutral-medium">Spending hours finding professor contacts and research interests.</Text>
              </Column>
            </Card>
            <Card fill direction="column" paddingY="48" padding="32" radius="l" border="neutral-alpha-medium" horizontal="center">
              <Icon name="socialDistance" size="xl" onBackground="accent-strong" marginBottom="16"/>
              <Column gap="4">
              <Heading as="h3" variant="heading-strong-m" align="center">Impersonal Outreach</Heading>
              <Text align="center" onBackground="neutral-medium">Struggling to write compelling, personalized emails that get noticed.</Text>
              </Column>
            </Card>
            <Card fill direction="column" paddingY="48" padding="32" radius="l" border="neutral-alpha-medium" horizontal="center">
              <Icon name="chartLow" size="xl" onBackground="accent-strong" marginBottom="16"/>
             <Column gap="4">
              <Heading as="h3" variant="heading-strong-m" align="center">Low Response Rates</Heading>
              <Text align="center" onBackground="neutral-medium">Sending emails into the void with little to no feedback.</Text>
              </Column>
            </Card>
          </Row>
        </Column>

        {/* SOLUTION / FEATURES SECTION */}
        <Column fillWidth paddingX="64" gap="64" horizontal="center" position="relative" paddingY="104">
           <Background
            mask={{
              x: 0,
              y: 90,
              radius: 100,
            }}
            position="absolute"
            gradient={{
              display: true,
              tilt: -5,
              height: 50,
              width: 75,
              x: 0,
              opacity: 80,
              y: 70,
              colorStart: "accent-solid-medium",
              colorEnd: "static-transparent",
            }}
          />
          <Row>
          <Heading as="h2" variant="display-default-l">
            Script Streamlines <Text as="span" variant="display-strong-l">Your</Text> Success
          </Heading>
          </Row>
          {/* Feature 1 */}
          <Row fillWidth vertical="center" gap="48" mobileDirection="column-reverse">
            <Column fillWidth gap="16">
              <Icon name="sparkles" size="l" onBackground="brand-strong" />
              <Heading as="h3" variant="heading-strong-l">Mass Personalization, Simplified</Heading>
              <Text onBackground="neutral-weak" variant="body-default-l">
                Craft a master template and let Script automatically personalize emails for each professor using their specific details. Save hours, not just minutes.
              </Text>
              <Button variant="secondary" label="Learn about Personalization" arrowIcon href="#"/>
            </Column>
            <Column fillWidth horizontal="center" vertical="center">
              {/* Placeholder for an image or an abstract visual */}
              <TiltFx aspectRatio="4/3" radius="xl" border="accent-alpha-weak" overflow="hidden">
                 <Column fill horizontal="center" vertical="center" background="surface" padding="32">
                    <Icon name="mailBulk" size="xl" onBackground="accent-strong"/>
                    <Text marginTop="16" onBackground="neutral-medium">Visual of email personalization</Text>
                 </Column>
              </TiltFx>
            </Column>
          </Row>
          {/* Feature 2 */}
          <Row fillWidth vertical="center" gap="48" mobileDirection="column">
             <Column fillWidth horizontal="center" vertical="center">
               {/* Placeholder for an image or an abstract visual */}
              <TiltFx aspectRatio="4/3" radius="xl" border="accent-alpha-weak" overflow="hidden">
                 <Column fill horizontal="center" vertical="center" background="surface" padding="32">
                    <Icon name="checklist" size="xl" onBackground="accent-strong"/>
                    <Text marginTop="16" onBackground="neutral-medium">Visual of tracking dashboard</Text>
                 </Column>
              </TiltFx>
            </Column>
            <Column fillWidth gap="16">
              <Icon name="activity" size="l" onBackground="brand-strong" />
              <Heading as="h3" variant="heading-default-l">Intelligent Tracking & Analytics</Heading>
              <Text onBackground="neutral-weak" variant="body-default-l">
                Monitor opens, clicks, and replies in real-time. Understand what works and refine your approach for better results.
              </Text>
              <Button variant="secondary" label="Explore Tracking Features" arrowIcon href="#"/>
            </Column>
          </Row>
        </Column>

        {/* HOW IT WORKS SECTION */}
        <Column fillWidth paddingX="32" paddingY="64" gap="32" horizontal="center" position="relative">
          <Heading as="h2" variant="display-default-l" align="center">
            Get Started in <InlineCode
              paddingX="12"
              paddingY="4"
              radius="xl"
              background="surface"
              border="neutral-alpha-medium"
              onBackground="neutral-strong"
            >
              3 Simple Steps
            </InlineCode>
          </Heading>
          <Row fillWidth gap="24" mobileDirection="column" horizontal="stretch" paddingTop="32">
            <Row fillWidth overflow="hidden">
          <Row maxWidth="32" borderTop="neutral-alpha-medium" borderBottom="neutral-alpha-medium" />
          <Row fillWidth border="neutral-alpha-medium" mobileDirection="column">
            {links.map((link, index) => (
              <Card
                key={link.href}
                fillWidth
                href={link.href}
                padding="40"
                gap="8"
                background="page"
                direction="column"
                borderRight={index < links.length - 1 ? "neutral-alpha-medium" : undefined}
                border={undefined}
              >
                <Row fillWidth center gap="12">
                  <Text variant="body-strong-m" onBackground="neutral-strong">
                    {link.title}
                  </Text>
                  <Icon size="s" name="arrowUpRight" />
                </Row>
                <Text align="center" variant="body-default-s" onBackground="neutral-weak">
                  {link.description}
                </Text>
              </Card>
            ))}
          </Row>
          <Row maxWidth="32" borderTop="neutral-alpha-medium" borderBottom="neutral-alpha-medium" />
        </Row>
          </Row>
        </Column>

        {/* FINAL CALL TO ACTION SECTION */}
        <Column
          fillWidth
          horizontal="center"
          gap="24"
          paddingY="80" // Ample padding
          paddingX="32"
          marginX="32"
          position="relative"
          background="surface"
          border="neutral-alpha-weak"
          radius="xl"
        >
          <Background
            borderTop="brand-alpha-strong"
            mask={{
              x: 50,
              y: 0,
            }}
            zIndex={-1}
            position="absolute"
            grid={{
              display: true,
              width: "0.25rem",
              color: "brand-alpha-strong",
              height: "0.25rem",
            }}
          />
          <Heading wrap="balance" variant="display-default-l" align="center" onBackground="accent-strong">
            Ready to Land Your Dream Research Role?
          </Heading>
          <Text align="center" variant="body-default-xl" onBackground="neutral-weak" marginBottom="16">
            Stop waiting, start connecting.
          </Text>
          <Button
            id="getStartedCTA"
            label="Sign Up for Free"
            size="l"
            variant="primary"
            onClick={() => addToast({ variant: "success", message: "Sign Up Clicked!"})}
          />
        </Column>
      </Column>
    </Column>
  );
}
