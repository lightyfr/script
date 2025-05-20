"use client";

import React, { useState, useEffect } from "react";
import { Column, Row, Card, Heading, Text, Button, Icon, useToast, Feedback, Tag, Dialog, Line } from "@/once-ui/components";
import { LineChart } from "@/once-ui/modules/data/LineChart";
import { ChartCard } from "@/app/components/chartCard";
import { PricingTable, useAuth } from "@clerk/nextjs";
import { getStudentName, getStudentDashboardStats } from "./actions";

export default function StudentDashboard() {
  const { addToast } = useToast();
  const { has } = useAuth();
  const hasSuper = has && has({ plan: 'script_super' });
  const [userName, setUserName] = useState('Student');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<{
    stats: { emailsSent: number; offers: number; responseRate: number };
    monthlyChartData: Array<{ name: string; activity: number; responseRate: number }>;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const name = await getStudentName();
        setUserName(name);
        const statsData = await getStudentDashboardStats();
        setDashboardStats(statsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setUserName('Student'); // Default or error state
        // Optionally, set an error state for stats or use default/empty stats
        setDashboardStats({
          stats: { emailsSent: 0, offers: 0, responseRate: 0 },
          monthlyChartData: [
            { name: "Jan", activity: 0, responseRate: 0 },
            { name: "Feb", activity: 0, responseRate: 0 },
            { name: "Mar", activity: 0, responseRate: 0 },
          ],
        });
      }
    };

    fetchData();
  }, []);

  const handleUpgradeClick = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };
  const statsToDisplay = dashboardStats ? [
    { icon: "mailBulk", label: "Emails Sent", value: dashboardStats.stats.emailsSent, variant: "success" as const },
    { icon: "sparkles", label: "Offers", value: dashboardStats.stats.offers, variant: "info" as const },
    { icon: "activity", label: "Response Rate", value: `${dashboardStats.stats.responseRate}%`, variant: "warning" as const },
  ] : [
    { icon: "mailBulk", label: "Emails Sent", value: 0, variant: "success" as const },
    { icon: "sparkles", label: "Offers", value: 0, variant: "info" as const },
    { icon: "activity", label: "Response Rate", value: "0%", variant: "warning" as const },
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
        <Heading variant="display-strong-m">Welcome Back, {userName}!</Heading>
        <Feedback actionButtonProps={{variant: "secondary", label: "Open"}} icon variant="success" title="You Have Unread Responses" description="13 Professors just connected back with you!"/>
      </Column>

      <LineChart
        border="neutral-alpha-weak"
        data-viz="divergent"
        fill
        minHeight={20}
        data={dashboardStats?.monthlyChartData || []}
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
        {statsToDisplay.map((stat) => (
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
          <Button href="campaigns/new"
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