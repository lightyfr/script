"use client";

import React, { useState } from "react";
import { Column, Row, Card, Heading, Text, Button, Icon, useToast, Feedback, Tag, Dialog, Line } from "@/once-ui/components";
import { LineChart } from "@/once-ui/modules/data/LineChart";
import { ChartCard } from "@/app/components/chartCard";
import { PricingTable, useAuth } from "@clerk/nextjs"; // Changed from @clerk/nextjs/server

export default function StudentDashboard() { // Removed async
  const { addToast } = useToast();
  const { has } = useAuth(); // Changed from await auth()
  const hasSuper = has && has({ plan: 'script_super' }); // Added a check for has being defined

    const [isDialogOpen, setIsDialogOpen] = useState(false);
  
    const handleUpgradeClick = () => {
      setIsDialogOpen(true);
    };

      const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };
  const stats: Array<{ icon: string; label: string; value: string | number; variant: "success" | "info" | "warning" | "danger" }> = [
    { icon: "mailBulk", label: "Emails Sent", value: 120, variant: "success" },
    { icon: "sparkles", label: "Offers", value: 11, variant: "info" },
    { icon: "activity", label: "Response Rate", value: "35%", variant: "warning" },
  ];

  return (
    <Column fillWidth paddingX="l" paddingY="l" gap="32">
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
        {!hasSuper && (
          <Tag onClick={handleUpgradeClick} position='fixed' zIndex={1} variant='neutral' right='4' top='16' size='l'>
            Upgrade
          </Tag>
        )}
      <Column gap="16">
        <Heading variant="display-strong-m">Welcome Back, Student!</Heading>
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
          { key: "activity", color: "#0072ff8e",},
          { key: "responseRate", color: "#00b3008e"},
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