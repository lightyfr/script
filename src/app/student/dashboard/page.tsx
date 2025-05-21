"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Column, Row, Card, Heading, Text, Button, Icon, useToast, Feedback, Tag, Dialog, Line, Grid, Avatar, Spinner } from "@/once-ui/components";
import { LineChart } from "@/once-ui/modules/data/LineChart";
import { ChartCard } from "@/app/components/chartCard";
import { PricingTable, useAuth } from "@clerk/nextjs";
import { getStudentName, getStudentDashboardStats, hasUserGmailToken } from "./actions";

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasSuper = has && has({ plan: 'script_super' });
  const [userName, setUserName] = useState('Student');
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [showGmailFeedback, setShowGmailFeedback] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<{
    stats: { emailsSent: number; applications: number; offers: number; responseRate: number };
    monthlyChartData: Array<{ name: string; activity: number; responseRate: number }>;
  } | null>(null);

  const [isGmailConnectDialogOpen, setIsGmailConnectDialogOpen] = useState(false);
  const [isDialogGmailStatusLoading, setIsDialogGmailStatusLoading] = useState(true);
  const [isDialogGmailConnected, setIsDialogGmailConnected] = useState(false);

  const fetchMainDashboardData = useCallback(async () => {
    try {
      const name = await getStudentName();
      setUserName(name);
      const statsData = await getStudentDashboardStats();
      setDashboardStats(statsData);
      const showFeedback = !(await hasUserGmailToken());
      setShowGmailFeedback(showFeedback);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setUserName('Student'); 
      setDashboardStats({
        stats: { emailsSent: 0, applications: 0, offers: 0, responseRate: 0 },
        monthlyChartData: [
          { name: "Jan", activity: 0, responseRate: 0 },
          { name: "Feb", activity: 0, responseRate: 0 },
          { name: "Mar", activity: 0, responseRate: 0 },
        ],
      });
      setShowGmailFeedback(true); 
    }
  }, []);

  useEffect(() => {
    fetchMainDashboardData();
  }, [fetchMainDashboardData]);

  const fetchDialogGmailStatus = useCallback(async () => {
    setIsDialogGmailStatusLoading(true);
    try {
      const response = await fetch('/api/email/status');
      if (!response.ok) throw new Error('Failed to fetch status');
      const data = await response.json();
      setIsDialogGmailConnected(data.isConnected);
    } catch (error) {
      console.error('Error checking Gmail status in dialog:', error);
      addToast({
        variant: 'danger',
        message: 'Failed to check Gmail connection status',
      });
      setIsDialogGmailConnected(false);
    } finally {
      setIsDialogGmailStatusLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    const success = searchParams.get('gmail_connect_success');
    const error = searchParams.get('gmail_connect_error');

    if (success === 'true') {
      addToast({
        variant: 'success',
        message: 'Gmail account connected successfully',
      });
      fetchMainDashboardData(); 
      if (isGmailConnectDialogOpen) {
        fetchDialogGmailStatus();
      }
      router.replace('/student/dashboard', { scroll: false });
    } else if (error) {
      addToast({
        variant: 'danger',
        message: error || 'Failed to connect Gmail account',
      });
      router.replace('/student/dashboard', { scroll: false });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, addToast, fetchMainDashboardData, isGmailConnectDialogOpen, router, fetchDialogGmailStatus]);

  const handleUpgradeClick = () => {
    setIsUpgradeDialogOpen(true);
  };

  const handleCloseUpgradeDialog = () => {
    setIsUpgradeDialogOpen(false);
  };

  const handleOpenGmailConnectDialog = () => {
    fetchDialogGmailStatus();
    setIsGmailConnectDialogOpen(true);
  };

  const handleCloseGmailConnectDialog = () => {
    setIsGmailConnectDialogOpen(false);
  };

  const handleDialogConnectGmail = async () => {
    setIsDialogGmailStatusLoading(true);
    try {
      const currentPath = window.location.pathname;
      const response = await fetch(`/api/email/oauth-url?redirect_path=${encodeURIComponent(currentPath)}`);
      if (!response.ok) throw new Error('Failed to get OAuth URL');
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No OAuth URL returned');
      }
    } catch (error) {
      addToast({
        variant: 'danger',
        message: 'Failed to start Gmail connection. Please try again.',
      });
      setIsDialogGmailStatusLoading(false);
    }
  };

  const handleDialogDisconnectGmail = () => {
    addToast({
      variant: 'danger',
      message: 'Disconnect functionality coming soon. Please manage connections via Google Account settings for now.',
    });
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
      <Dialog isOpen={isUpgradeDialogOpen} onClose={handleCloseUpgradeDialog} title="Upgrade to Script Super">
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
        {showGmailFeedback && (
          <Feedback 
            actionButtonProps={{
              variant: "secondary", 
              label: "Connect Gmail", 
              onClick: handleOpenGmailConnectDialog
            }}
            icon 
            variant="danger" 
            title="Connect Your Gmail Account"
            description="Connect your Gmail account to enable automatic email sending and tracking features."
          />
        )}
      </Column>

      {showGmailFeedback && (
        <Dialog 
          isOpen={isGmailConnectDialogOpen} 
          onClose={handleCloseGmailConnectDialog} 
          title="Manage Gmail Connection"
        >
          <Column gap="16" paddingTop="m">
            {isDialogGmailStatusLoading ? (
              <Column fillWidth vertical="center" horizontal="center" padding="l" gap="m">
                <Spinner size="l" />
                <Text>Checking Gmail connection status...</Text>
              </Column>
            ) : isDialogGmailConnected ? (
              <Column gap="16" fillWidth>
                <Text color="success" variant="body-strong-m">✓ Gmail account is connected.</Text>
                <Text onBackground="neutral-weak">
                  You can now send emails and track responses directly through Script.
                </Text>
                <Button
                  variant="danger"
                  label="Disconnect Gmail (Coming Soon)"
                  onClick={handleDialogDisconnectGmail}
                  disabled 
                />
              </Column>
            ) : (
              <Column gap="16" fillWidth>
                <Text variant="body-strong-m">Connect your Gmail account.</Text>
                <Text onBackground="neutral-weak">
                  This will allow Script to send emails on your behalf and track their status. 
                  You will be redirected to Google to authorize the connection.
                </Text>
                <Button
                  variant="primary"
                  label="Connect Gmail"
                  onClick={handleDialogConnectGmail}
                  prefixIcon="mail"
                />
              </Column>
            )}
          </Column>
        </Dialog>
      )}

      <Row fillWidth gap="24" mobileDirection="column">
        {statsToDisplay.map((stat: any) => (
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