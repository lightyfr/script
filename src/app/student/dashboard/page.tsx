"use client";

import React from "react";
import { Column, Row, Card, Heading, Text, Button, Icon, useToast } from "@/once-ui/components";
import { LineChart } from "@/once-ui/modules/data/LineChart";

export default function StudentDashboard() {
  const { addToast } = useToast();

  const stats = [
    { icon: "mailBulk", label: "Emails Sent", value: 120 },
    { icon: "sparkles", label: "Templates Created", value: 5 },
    { icon: "activity", label: "Response Rate", value: "35%" },
  ];

  return (
    <Column fillWidth paddingX="l" paddingY="l" gap="32">
      <Column gap="16">
        <Heading variant="display-strong-m">Welcome Back, Student!</Heading>
        <Text variant="body-default-m">Here's an overview of your Script activity.</Text>
      </Column>

      <LineChart
        data-viz="divergent"
        fill
        minHeight={20}
        data={[
          { name: "Jan", activity: 20, responseRate: 15 },
          { name: "Feb", activity: 30, responseRate: 25 },
          { name: "Mar", activity: 50, responseRate: 40 },
        ]}
        series={[
          { key: "activity", color: "success-alpha-strong",},
          { key: "responseRate", color: "accent-alpha-strong"},
        ]}
        title="Monthly Activity & Response Rate"
        description="This chart shows your activity and response rate over the last three months."
        labels="both"
        curveType="natural"
        />
              
      <Row fillWidth gap="24" mobileDirection="column">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            fill
            direction="column"
            padding="24"
            radius="l"
            horizontal="center"
          >
            <Icon name={stat.icon} size="xl" onBackground="brand-strong" marginBottom="8" />
            <Text variant="body-default-l" onBackground="neutral-strong">
              {stat.value}
            </Text>
            <Text variant="body-strong-s" onBackground="neutral-medium">
              {stat.label}
            </Text>
          </Card>
        ))}
      </Row>

      <Column fillWidth gap="16">
      
        <Heading variant="heading-strong-l">Quick Actions</Heading>
        <Row gap="16">
          <Button
            label="Create New Campaign"
            onClick={() => addToast({ variant: "success", message: "Campaign Created!" })}
          />
          <Button
            variant="secondary"
            label="View Reports"
            onClick={() => addToast({ variant: "success", message: "Opening Reports..." })}
          />
        </Row>
      </Column>
    </Column>
  );
}