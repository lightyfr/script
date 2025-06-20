"use client";
import React, { useState, useRef } from "react"; // Removed useEffect
import {
  Column,
  Dialog,
  // Dropdown, // No longer directly used here
  Flex,
  Icon,
  IconButton,
  Line,
  Logo,
  Row,
  Option,
  Text,
  DropdownWrapper,
  Tag,
  SegmentedControl,
  useTheme, // Added DropdownWrapper
} from "@/once-ui/components";
import type { IconName } from "@/once-ui/icons";
import { PricingTable, useAuth, useClerk, useUser } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation"; // Fixed import for app directory

interface SidebarItem {
  icon: IconName;
  href?: string;
  onClick?: () => void;
  tooltip?: string;
}

interface SidebarProps {
  items: SidebarItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ items }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false); // Kept for DropdownWrapper control
  // const dropdownRef = useRef<HTMLDivElement>(null); // No longer needed, DropdownWrapper handles its own ref
  const pathname = usePathname(); // Fixed for app directory
  const router = useRouter(); // Fixed for app directory
  const { has } = useAuth();
  const { openUserProfile, signOut } = useClerk();
  const { user } = useUser();
  const hasSuper = has && has({ plan: 'script_super' });
  
  const handleUpgradeClick = () => {
    setIsDialogOpen(true);
  };

  const handleProfileClick = () => {
    if (openUserProfile) {
      openUserProfile();
    }
    setIsProfileDropdownOpen(false); // Close dropdown after action
  };

  const { theme, setTheme } = useTheme();

  const handleSignOut = async () => {
    if (signOut) {
      await signOut();
      router.push('/'); // Fixed for app directory
    }
    setIsProfileDropdownOpen(false); // Close dropdown after action
  };

  const handleSelect = () => {
    console.log("Option selected");
    setIsProfileDropdownOpen(false);
  };


  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  // useEffect for handleClickOutside is removed as DropdownWrapper should handle it

  let imageSrc: string | null = null;
  if (user && user.imageUrl) {
    const params = new URLSearchParams();
    params.set('height', '40');
    params.set('width', '40');
    params.set('quality', '90');
    params.set('fit', 'crop');
    imageSrc = `${user.imageUrl}?${params.toString()}`;
  }

  const profileDropdownTrigger = (
    <Column
      width={2}
      height={2}
      radius="full"
      borderWidth={2}
      border="neutral-medium"
      // onClick is handled by DropdownWrapper
      style={{ overflow: 'hidden', cursor: 'pointer' }}
    >
      {imageSrc && (
        <img
          src={imageSrc}
          alt="User profile"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}
    </Column>
  );

  const profileDropdownContent = (
    <Flex direction="column" gap="2" vertical="center" background="neutral-weak" radius="m" minWidth={17}>
      <Row padding="8" paddingX="s" horizontal="space-between" gap="16" vertical="center"> 
        <Row gap="16" vertical="center">
        <img
          src={imageSrc || ''}
          alt="User profile"
          width={30}
          height={30}
          style={{ objectFit: 'cover', borderRadius: '50%' }}
        />
        <Text variant="heading-default-s" onBackground="neutral-strong">
          {user?.firstName || 'User'}
        </Text>
        </Row>
        {hasSuper && (
        <Tag variant="brand" label="Pro"/>
        )}
      </Row>
      <Line />
      <Row padding="4">
      <Option
      hasPrefix={<Icon name="user" size="s" />}
      label="Manage Profile"
      value="manageProfile"
      onClick={handleProfileClick}
    />
    </Row>
    <Row padding="4">
    <SegmentedControl
    selected={theme}
    buttons={[
      { label: "Dark", value: "dark", onClick: () => setTheme("dark") },
      { label: "Light", value: "light", onClick: () => setTheme("light") },
    ]}
    onToggle={handleSelect}
    />
    </Row>
    <Row padding="4">
    <Option
      hasPrefix={<Icon name="signOut" onBackground="danger-medium" size="s" />}
      danger
      label="Sign Out"
      value="signOut"
      onClick={handleSignOut}
    />    
    </Row>

    </Flex>
  );

  return (
    <Flex
      zIndex={1}
      direction="column"
      position="fixed"
      top="0"
      left="8"
      bottom="0"
      radius="l"
      padding="s"
      gap="s"
    >
      <Column
        fill
        horizontal="center"
        vertical="space-between"
        radius="xl"
        paddingY="s"
        background="neutral-weak"
        border="neutral-alpha-medium"
        style={{ width: "60px" }}
      >
        <Column horizontal="center">
          <DropdownWrapper
            isOpen={isProfileDropdownOpen}
            onOpenChange={setIsProfileDropdownOpen}
            trigger={profileDropdownTrigger}
            dropdown={profileDropdownContent}
            floatingPlacement="bottom-end" // Adjust as needed
          >
            {/* DropdownWrapper handles rendering its trigger and dropdown */}
          </DropdownWrapper>
          <Column paddingTop="s" gap="8">
            {items.map((item, idx) => (
              <IconButton
                key={idx}
                icon={item.icon}
                href={item.href}
                onClick={item.onClick}
                tooltip={item.tooltip}
                variant="tertiary"
                size="l"
                selected={item.href === pathname} // Set selected based on current route
              />
            ))}
          </Column>
        </Column>
        {!hasSuper && (
        <IconButton
          icon="energy"
          tooltip="Upgrade"
          variant="tertiary"
          size="l"
          onClick={handleUpgradeClick}
        />
        )}
        {hasSuper && (
          <Column gap="4" horizontal="center">
          <img 
              src="/images/script-logo-main.png" 
              alt="SCRIPT AI Logo" 
              height={32}
              style={{ height: '32px', width: 'auto' }}
            />
          <Text variant="label-default-s" onBackground="neutral-weak">
            PRO
          </Text>
          </Column>
        )}
      </Column>
      <Dialog isOpen={isDialogOpen} onClose={handleCloseDialog} title="Upgrade to Script Super">
        <Line/>
        <Column gap="l" paddingTop="m">
          <Text>
        Gain access to advanced tools, priority support, and exclusive updates that will elevate your workflow.
          </Text>
          <Row gap="s">
            <PricingTable />
          </Row>
        </Column>
      </Dialog>
    </Flex>
  );
};
