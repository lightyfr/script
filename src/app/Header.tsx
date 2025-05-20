import type React from "react";
import Link from "next/link";

import {
  Button,
  Logo,
  IconButton,
  Row,
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
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    UserButton,
    useClerk
  } from '@clerk/nextjs'
// Define menu groups for the MegaMenu
const menuGroups: MenuGroup[] = [
  { label: "Dashboard", href: "/student/dashboard" },
  { label: "Articles", href: "/articles" },
  { label: "Projects", href: "/projects" },
  { label: "Careers", href: "/careers" },
];

export const Header: React.FC = () => {
  const { openSignIn } = useClerk();
  
  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    openSignIn();
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
        horizontal="space-between"
        maxWidth="l"
        paddingRight="16"
        paddingLeft="16"
        paddingY="8"
      >
        <Row gap="m" vertical="center">
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
          
          <SignedIn>
            <Row data-border="playful" paddingX="xs" paddingLeft="0">
              <MegaMenu data-rounded="conservative" menuGroups={menuGroups} />
            </Row>
          </SignedIn>
          <SignedOut>
            <Row 
              data-border="playful" 
              paddingX="m" 
              style={{ cursor: 'pointer' }} 
              onClick={handleMenuClick}
            >
              <MegaMenu data-rounded="conservative" menuGroups={menuGroups.map(item => ({ ...item, href: '#' }))} />
            </Row>
          </SignedOut>
        </Row>
        <Row gap="s" horizontal="center" vertical="center">
          <SignedOut>
            <SignInButton mode="modal">
              <Button 
                data-border="playful" 
                variant="secondary" 
                size="s" 
                label="Sign in"
                style={{ 
                  width: 'auto',
                  minWidth: '80px',
                  padding: '0 12px',
                  textAlign: 'center',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              />
            </SignInButton>
            <SignUpButton mode="modal">
              <Button 
                data-border="playful" 
                variant="primary" 
                size="s" 
                label="Sign up"
                style={{ 
                  width: 'auto',
                  minWidth: '80px',
                  padding: '0 12px',
                  textAlign: 'center',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              />
            </SignUpButton>
          </SignedOut>
        </Row>
      </Row>
      <Row hide="m" maxHeight={3} position="fixed" right="104" vertical="center">
        <ThemeSwitcher/>
      </Row>
    </Row>
  );
};