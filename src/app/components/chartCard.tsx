
import React from "react";
import styles from "./../student/dashboard/styles.module.scss";
import { Column, Flex, Icon, IconButton, Row, Text } from "@/once-ui/components";
import type { IconName } from "@/once-ui/icons";
import { UserButton } from "@clerk/nextjs";


interface ChartCardProps {
  variant: "success" | "danger" | "warning" | "info";
  icon: IconName;
  label: string;
  value: string | number;
}

export const ChartCard: React.FC<ChartCardProps> = ({ icon, label, value, variant }) => (
    <Row fillWidth border="neutral-alpha-weak"
        background="neutral-medium"
        className={styles.card}
        radius="l"
        vertical="center"
        padding="l"
        horizontal="space-between">
      <Column>
        <Text variant="display-strong-m" onBackground="neutral-strong">
          {value}
        </Text>
        <Text variant="body-strong-s" onBackground="neutral-medium">
          {label}
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
