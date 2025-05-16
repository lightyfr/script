"use client";
import React, { useState } from "react";
import { Column, Dialog, Flex, Icon, IconButton, Line, Row, Text } from "@/once-ui/components";
import type { IconName } from "@/once-ui/icons";
import { PricingTable, UserButton } from "@clerk/nextjs";

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

  const handleUpgradeClick = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

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
          <UserButton />
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
        <IconButton
          icon="energy"
          tooltip="Upgrade"
          variant="tertiary"
          size="l"
          onClick={handleUpgradeClick}
        />
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
