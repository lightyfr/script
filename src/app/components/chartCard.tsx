
import React from "react";
import styles from "./../student/dashboard/styles.module.scss";
import { Column, Flex, Icon, IconButton, Row, Text } from "@/once-ui/components";
import type { IconName } from "@/once-ui/icons";
import { UserButton } from "@clerk/nextjs";


interface ChartCardProps {
  variant: "success" | "danger" | "warning" | "info";
  icon: IconName;
  label: string;
  subtitle?: string;
  change?: string;
  value: string | number;
}

export const ChartCard: React.FC<ChartCardProps> = ({ icon, label, value, variant, subtitle, change }) => (
    <Row fillWidth border="neutral-alpha-weak"
        background="neutral-weak"
        className={styles.card}
        radius="l"
        vertical="center"
        padding="l"
        horizontal="space-between">
          <Column>
      <Column vertical="center">
        <Text variant="display-strong-m" onBackground="neutral-strong">
          {value}
        </Text>
        <Text variant="body-strong-m" onBackground="neutral-medium">
          {label}
        </Text>
        </Column>

        <Text marginTop="8" variant="body-default-xs" onBackground="neutral-medium">
          {subtitle}
        </Text>

      </Column>
      <Icon
        name={
          variant === "success"
            ? "arrowUp"
            : variant === "danger" || variant === "warning"
            ? "arrowDown"
            : ""
        }
        onBackground={`${variant}-weak`}
        size="l"
        marginBottom="8"
      />
    </Row>
);
