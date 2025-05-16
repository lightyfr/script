"use client";

import React from "react";
import { Column, Row, Card, Heading, Text, Button, Icon, useToast, Feedback } from "@/once-ui/components";
import { LineChart } from "@/once-ui/modules/data/LineChart";
import { ChartCard } from "@/app/components/chartCard";

export default function StudentDashboard() {
  const { addToast } = useToast();

  const stats: Array<{ icon: string; label: string; value: string | number; variant: "success" | "info" | "warning" | "danger" }> = [
    { icon: "mailBulk", label: "Emails Sent", value: 120, variant: "success" },
    { icon: "sparkles", label: "Offers", value: 11, variant: "info" },
    { icon: "activity", label: "Response Rate", value: "35%", variant: "warning" },
  ];

  return (
    <Column fillWidth paddingX="l" paddingY="l" gap="32">
      <Column gap="16">
        <Heading variant="display-strong-m">Welcome Back, Student!</Heading>
        <Text variant="body-default-m">Here's an overview of your Script activity.</Text>
        <Feedback actionButtonProps={{variant: "secondary", label: "Open"}} icon variant="success" title="You Have Unread Responses" description="13 Professors just connected back with you!"/>
      </Column>

      <LineChart
        border="neutral-alpha-weak"
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
          <ChartCard
            key={stat.label}
            variant={stat.variant}
            icon="chevronRight"
            label={stat.label}
            value={stat.value}
          />
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