import type React from "react";


import {
  Button,
  Logo,
  IconButton,
  Row,
  StyleOverlay,
  ThemeSwitcher,
  SmartImage,
  MegaMenu,
  type MenuGroup
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
  } from '@clerk/nextjs'
// Define menu groups for the MegaMenu
const menuGroups: MenuGroup[] = [
  { label: "About", href: "/about" },
  { label: "Articles", href: "/articles" },
  { label: "Projects", href: "/projects" },
  { label: "Careers", href: "/careers" },
];

export const Header: React.FC = () => {
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
        <Row position="relative" radius="full" horizontal="center" vertical="center" padding="2" background="neutral-weak" border="neutral-weak" height={2.2} width={2.2}>
        <SignedOut>
              <SignInButton/>
              <SignUpButton />
            </SignedOut>
            <SignedIn>
              <UserButton/>
            </SignedIn>
        </Row>
        <Row data-border="playful" paddingX="m">
        <MegaMenu data-rounded="conservative" menuGroups={menuGroups} />
        </Row>
        <Button data-border="playful" size="s" variant="primary" label="Connect"/>
      </Row>
      <Row hide="m" maxHeight={3} position="fixed" right="104" vertical="center">
        <ThemeSwitcher/>
      </Row>
    </Row>
  );
};