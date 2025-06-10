import React, { useState, useEffect } from "react";
import Link from "next/link";

import {
  Button,
  Logo,
  IconButton,
  Row,
  Text,
  StyleOverlay,
  ThemeSwitcher,
  SmartImage,
  MegaMenu,
  type MenuGroup,
  SmartLink
} from "@/once-ui/components";
import { CodeBlock, MediaUpload } from "@/once-ui/modules";
import { ScrollToTop } from "@/once-ui/components/ScrollToTop";
import {
    ClerkProvider,
    RedirectToSignIn,
    SignIn,
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    UserButton,
  } from '@clerk/nextjs'
import { useUser } from '@clerk/nextjs';
// Define menu groups for the MegaMenu
const staticMenuGroups: MenuGroup[] = [ // Renamed to staticMenuGroups
  { label: "Features", href: "/features", sections: [
    {
      links: [
        { label: "AI-Powered", href: "/features/ai" },
      ]
    }
  ]},
  { label: "Prices", href: "/projects" },
  { label: "Team", href: "/careers" },
];

interface HeaderProps {
  animateOnMount?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ animateOnMount = false }) => {
  const [isExpanded, setIsExpanded] = useState(!animateOnMount);
  
  useEffect(() => {
    if (animateOnMount) {
      const timer = setTimeout(() => {
        setIsExpanded(true);
      }, 300); // Short delay before expansion starts
      return () => clearTimeout(timer);
    }
  }, [animateOnMount]);

  const { user } = useUser();

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
  };
  
  return (
    <Row position="fixed" paddingTop="s" top="0" fitWidth horizontal="center" zIndex={3}>
      <Row
        data-border="rounded"
        background="surface"
        border="neutral-alpha-weak"
        radius="m"
        shadow="s"
        vertical="center"
        paddingRight="0"
        paddingLeft="16"
        paddingY="8"
      >
        {/* Logo part - always visible */}
        <Row>
          <SmartLink unstyled href="/">
            <img 
              src="/images/script-logo-main.png" 
              alt="SCRIPT AI Logo" 
              height={32}
              style={{ height: '32px', width: 'auto' }}
            />
            <span style={{ 
              fontSize: '1rem', 
              fontWeight: 530, 
              color: 'var(--neutral-on-background-strong)',
              fontFamily: 'var(--font-sans)'
            }}>
              Script
            </span>
          </SmartLink>
        </Row>
          
        {/* Animated Content Wrapper - This will expand */}
        <Row 
           paddingX="xs"
          vertical="center"
          style={{
            opacity: isExpanded ? 1 : 0,
            maxWidth: isExpanded ? '600px' : '0px', // Adjust 600px if content is wider
            overflow: 'hidden',
            whiteSpace: 'nowrap', // Prevents content from wrapping during transition
            transition: 'opacity 1.2s cubic-bezier(.52,.05,.97,.53), max-width 1.5s cubic-bezier(.36,.01,.83,.55)', // Smoother transition
            transitionDelay: isExpanded ? '0.1s' : '0s', // Adjusted delay slightly
          }}
        >
          {/* Group 1: MegaMenu */}
          <Row vertical="center" paddingX="xs" fitWidth  >
            <SignedIn>
              <Row data-border="playful" paddingLeft="0"style={{ cursor: 'pointer' }} onClick={handleMenuClick}>
                <MegaMenu data-border="rounded" menuGroups={staticMenuGroups} />
              </Row>
            </SignedIn>
            <SignedOut>
              <Row 
              padding="0"
                data-border="playful" 
                style={{ cursor: 'pointer' }} 
                onClick={handleMenuClick}
              >
                <MegaMenu data-rounded="rounded" menuGroups={staticMenuGroups} />
              </Row>
            </SignedOut>
          </Row>

          {/* Group 2: Auth Buttons / Dashboard Button */}
          <Row vertical="center" fitWidth paddingLeft="4">
            <SignedOut>
                 <Row gap="8" background="surface" padding="4" radius="xs" horizontal="center" vertical="center">
              <SignInButton mode="modal" forceRedirectUrl={"/student/dashboard"}>
                <Button 
                  data-border="playful" 
                  variant="secondary" 
                  size="s" 
                  label="Sign in"
                />
              </SignInButton>
              <SignUpButton mode="modal" forceRedirectUrl={"/onboarding/select-role"}>
                <Button 
                  data-border="playful" 
                  variant="primary" 
                  size="s" 
                  label="Sign up"
                />
              </SignUpButton>
                </Row>
            </SignedOut>
            <SignedIn>
              <Button label="Dashboard" size="s" data-border="playful" variant="primary" href="/student/dashboard"/>
            </SignedIn>
          </Row>
        </Row>
      </Row>
      <Row 
        hide="m" 
        maxHeight={3} 
        position="fixed" 
        right="104" 
        vertical="center"
        style={{
          opacity: isExpanded ? 1 : 0,
          transition: 'opacity 0.6s ease-in-out', // Smoother transition
          transitionDelay: isExpanded ? '0.5s' : '0s', // Delay for ThemeSwitcher to appear after main content
        }}
      >
        <ThemeSwitcher/>
      </Row>
      <SignedIn>
      <Row 
        hide="m" 
        padding="xs"
        radius="s"
        data-border="rounded"
        border="neutral-alpha-weak"
        background="surface"
        maxHeight={3} 
        position="fixed" 
        left="104" 
        vertical="center"
        style={{
          opacity: isExpanded ? 1 : 0,
          transition: 'opacity 0.6s ease-in-out', // Smoother transition
          transitionDelay: isExpanded ? '0.5s' : '0s', // Delay for ThemeSwitcher to appear after main content
        }}
      >
        <UserButton/>
        <Text paddingLeft="xs" variant="heading-strong-xs">
          {user?.firstName || 'User'}
          </Text>
      </Row>
      </SignedIn>
    </Row>
  );
};