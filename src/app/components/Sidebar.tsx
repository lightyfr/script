import React from "react";
import { Column, Flex, IconButton } from "@/once-ui/components";
import type { IconName } from "@/once-ui/icons";
import { UserButton } from "@clerk/nextjs";

interface SidebarItem {
  icon: IconName;
  href?: string;
  onClick?: () => void;
  tooltip?: string;
}

interface SidebarProps {
  items: SidebarItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ items }) => (
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
    <Column fill
    horizontal="center"
    radius="xl"
    paddingTop="s"
    background="neutral-weak"
    border="neutral-alpha-weak"
    style={{ width: "60px" }}>
      
    <UserButton/>
    <Column paddingTop="l" gap="s">
    {items.map((item, idx) => (
      <IconButton
        key={idx}
        icon={item.icon}
        href={item.href}
        onClick={item.onClick}
        tooltip={item.tooltip}
        variant="tertiary"
        size="l"
      />
    ))}
    </Column>
    </Column>
  </Flex>
);
