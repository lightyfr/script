"use client";

import React, { useState, useEffect } from "react";
import { Column, Row, Card, Heading, Text, Button, Icon, useToast, Feedback, Tag, Dialog, Line, Grid, Avatar } from "@/once-ui/components";
import { LineChart } from "@/once-ui/modules/data/LineChart";
import { ChartCard } from "@/app/components/chartCard";
import { PricingTable, useAuth } from "@clerk/nextjs";
import { getStudentName, getStudentDashboardStats } from "./actions";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  positive?: boolean;
  href?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, positive = true, href }) => (
  <Card minWidth={12} href={href} padding="24" radius="l" fillWidth direction="column">
    <Row vertical="center" gap="16" marginBottom="16">
      <Text variant="label-default-s" onBackground="neutral-medium">{title}</Text>
      <Tag
        size="s"
        variant={positive ? "success" : "danger"}
        prefixIcon={positive ? "trending-up" : "trending-down"}
      >
        {change}
      </Tag>
    </Row>
    <Heading variant="display-strong-s">
      {value}
    </Heading>
  </Card>
);

interface ActivityItemProps {
  avatar: string;
  name: string;
  action: string;
  time: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ avatar, name, action, time }) => (
  <Card href="#"  background="transparent" border="transparent" gap="16" paddingY="12" paddingX="24" fillWidth>
    <Column fillWidth gap="8">
      <Text variant="body-default-s">
        {action}
      </Text>
      <Row vertical="center" gap="12">
        <Avatar size="xs" src={avatar} />
        <Text variant="label-default-s" onBackground="neutral-weak">
          {time}
        </Text>
      </Row>
    </Column>
  </Card>
);
export default function StudentDashboard() {
  const { addToast } = useToast();
  const { has } = useAuth();
  const hasSuper = has && has({ plan: 'script_super' });
  const [userName, setUserName] = useState('Student');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<{
    stats: { emailsSent: number; applications: number; offers: number; responseRate: number };
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
          stats: { emailsSent: 0, applications: 0, offers: 0, responseRate: 0 },
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
    { icon: "user", label: "Applications", value: dashboardStats.stats.applications, variant: "success" as const},
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
        <Row gap="24">      
          <LineChart
            border="neutral-medium"
            data-viz="divergent"
            fill
            minHeight={20}
            data={dashboardStats?.monthlyChartData || [
              { name: "Jan", activity: 10, responseRate: 30 },
              { name: "Feb", activity: 20, responseRate: 50 },
              { name: "Mar", activity: 15, responseRate: 40 },
            ]}
            series={[
              { key: "activity", color: "#0072ff8e" },
              { key: "responseRate", color: "#00b3008e" },
            ]}
            title="Emails"
            description="Your email activity and response rate over the last three months."
            labels="both"
            curveType="natural"
          />
          <LineChart
            border="neutral-medium"
            data-viz="divergent"
            fill
            minHeight={20}
            data={[
              { name: "Jan", activity: 5, responseRate: 20 },
              { name: "Feb", activity: 12, responseRate: 35 },
              { name: "Mar", activity: 8, responseRate: 25 },
            ]}
            series={[
              { key: "activity", color: "#0072ff8e" },
              { key: "responseRate", color: "#00b3008e" },
            ]}
            title="Applications"
            description="Your application activity and response rate over the last three months."
            labels="both"
            curveType="natural"
          />
        </Row>
         <Grid columns="2" tabletColumns="1" gap="24" fillWidth>
              <Column fillWidth border="neutral-medium" radius="l" overflow="hidden">
                <Row vertical="center" horizontal="space-between" fillWidth padding="24" gap="16" wrap>
                  <Heading wrap="nowrap" variant="heading-strong-s">
                    Project status
                  </Heading>
                  <Row gap="8">
                    <Button variant="secondary" size="s">
                      Weekly
                    </Button>
                    <Button size="s">
                      Monthly
                    </Button>
                    <Button variant="secondary" size="s">
                      Yearly
                    </Button>
                  </Row>
                </Row>
                
                <Column fillWidth borderTop="neutral-medium">
                  {[
                    { name: "Website Redesign", progress: 75, status: "On Track" },
                    { name: "Mobile App Development", progress: 45, status: "At Risk" },
                    { name: "Marketing Campaign", progress: 90, status: "On Track" },
                    { name: "Product Launch", progress: 30, status: "Delayed" },
                  ].map((project, index) => (
                    <Card direction="column" background="transparent" href="#" border="transparent" key={index} fillWidth>
                      <Row vertical="center" fillWidth horizontal="space-between" padding="24">
                        <Text variant="body-default-s">
                          {project.name}
                        </Text>
                        <Tag>
                          {project.status}
                        </Tag>
                      </Row>
                      <Line />
                    </Card>
                  ))}
                </Column>
              </Column>

              <Column border="neutral-medium" radius="l" fillWidth overflow="hidden">
                <Row fillWidth vertical="center" horizontal="space-between" padding="24" gap="16" wrap>
                  <Heading wrap="nowrap" variant="heading-strong-s">
                    Recent activity
                  </Heading>
                  <Button size="s" variant="secondary" suffixIcon="chevronRight">
                    View all
                  </Button>
                </Row>
                <Column fillWidth borderTop="neutral-medium">
                  <ActivityItem 
                    avatar="/images/avatars/01.png"
                    name="Alex Chen"
                    action="Completed the Website Redesign task"
                    time="2 hours ago"
                  />
                  <Line />
                  <ActivityItem 
                    avatar="/images/avatars/02.png"
                    name="Sarah Johnson"
                    action="Commented on Mobile App Development"
                    time="4 hours ago"
                  />
                  <Line />
                  <ActivityItem 
                    avatar="/images/avatars/03.png"
                    name="Michael Brown"
                    action="Created a new task in Marketing Campaign"
                    time="Yesterday"
                  />
                  <Line />
                  <ActivityItem 
                    avatar="/images/avatars/04.png"
                    name="Emily Davis"
                    action="Completed 3 tasks in Product Launch"
                    time="Yesterday"
                  />
                </Column>
              </Column>
            </Grid>    

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