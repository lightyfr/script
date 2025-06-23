"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Column, Row, Card, Heading, Text, Button, Icon, useToast, Feedback, Tag, Dialog, Line, Grid, Avatar, Spinner, Skeleton } from "@/once-ui/components";
import { LineChart } from "@/once-ui/modules/data/LineChart";
import { ChartCard } from "@/app/components/chartCard";
import { PricingTable, useAuth } from "@clerk/nextjs";
import { getStudentName, getStudentDashboardStats, hasUserGmailToken, getCampaignStatus, getRecentActivity, getConnectionStats, getEmailStatusStats } from "./actions";
import { BarChart, LineBarChart } from "@once-ui-system/core";


interface ActivityItemProps {
  action: string;
  name: string;
  time: string;
  icon?: string;
  university?: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ action, name, time, icon = "user", university }) => (
  <Card href="#" background="transparent" border="transparent" gap="16" paddingY="12" paddingX="24" fillWidth>
    <Column fillWidth gap="8">
      <Row vertical="center" gap="12">
        <Icon name={icon as any} size="s" />
        <Text variant="body-default-s">
          {action}
        </Text>
      </Row>
      <Row vertical="center" gap="12">
        <Text variant="label-default-s" onBackground="neutral-weak">
          {time}
        </Text>
        {university && (
          <>
            <Text variant="label-default-s" onBackground="neutral-weak">•</Text>
            <Text variant="label-default-s" onBackground="neutral-weak">
              {university}
            </Text>
          </>
        )}
      </Row>
    </Column>
  </Card>
);

function StudentDashboardInner() {
  const { addToast } = useToast();
  const { has } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasSuper = has && has({ plan: 'script_super' });
  const [userName, setUserName] = useState('Student');
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [showGmailFeedback, setShowGmailFeedback] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<{
    stats: { 
      emailsSent: number;
      applications: number;
      responses: number;
      responseRate: number;
      openRate: number;
      totalOpens: number;
      totalTrackedEmails: number;
      totalCampaigns: number;
    };
    dailyChartData: Array<{ 
      name: string; 
      date: Date;
      activity: number; 
      replies: number 
      responseRate: number
    }>;
  } | null>({
    stats: {
      emailsSent: 0,
      applications: 0,
      responses: 0,
      responseRate: 0,
      openRate: 0,
      totalOpens: 0,
      totalTrackedEmails: 0,
      totalCampaigns: 0
    },
    dailyChartData: []
  });  const [connectionStats, setConnectionStats] = useState<{
    monthlyConnectionData: Array<{ name: string; activity: number; replies: number, responseRate: number }>;
  } | null>(null);
  const [emailStatusStats, setEmailStatusStats] = useState<{
    statusData: Array<{ status: string; count: number }>;
  } | null>(null);
  const [campaignStatus, setCampaignStatus] = useState<Array<{
    id: string;
    name: string;
    progress: number;
    status: string;
    universities: number;
    interests: number;
    totalEmails: number;
    sentEmails: number;
    repliedEmails: number;
  }>>([]);
  const [recentActivity, setRecentActivity] = useState<Array<{
    id: string;
    type: 'email' | 'connection';
    action: string;
    icon: string;
    name: string;
    time: string;
    timeFormatted: string;
    university?: string;
  }>>([]);

  const [isGmailConnectDialogOpen, setIsGmailConnectDialogOpen] = useState(false);
  const [isDialogGmailStatusLoading, setIsDialogGmailStatusLoading] = useState(true);
  const [isDialogGmailConnected, setIsDialogGmailConnected] = useState(false);

  const fetchMainDashboardData = useCallback(async () => {
    try {
      const name = await getStudentName();
      setUserName(name);
      const statsData = await getStudentDashboardStats();
      if (statsData) {
        setDashboardStats({
          stats: {
            emailsSent: statsData.stats.emailsSent,
            applications: statsData.stats.applications,
            responses: statsData.stats.responses,
            responseRate: statsData.stats.responseRate,
            openRate: statsData.stats.openRate,
            totalOpens: statsData.stats.totalOpens,
            totalTrackedEmails: statsData.stats.totalTrackedEmails,
            totalCampaigns: statsData.stats.totalCampaigns
          },
          dailyChartData: statsData.dailyChartData
        });
      }
      const campaigns = await getCampaignStatus();
      setCampaignStatus(campaigns);      const activities = await getRecentActivity();
      setRecentActivity(activities);
      const connectionData = await getConnectionStats();
      setConnectionStats(connectionData);
      const emailStatusData = await getEmailStatusStats();
      setEmailStatusStats(emailStatusData);
      const showFeedback = !(await hasUserGmailToken());
      setShowGmailFeedback(showFeedback);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setUserName('Student'); 
      setDashboardStats(prev => ({
        ...prev,
        stats: { 
          emailsSent: 0,
          applications: 0,
          responses: 0,
          responseRate: 0,
          openRate: 0,
          totalOpens: 0,
          totalTrackedEmails: 0,
          totalCampaigns: 0,
          ...(prev?.stats || {})
        },
        dailyChartData: [],
      }));      setConnectionStats({
        monthlyConnectionData: [],
      });
      setEmailStatusStats({
        statusData: [],
      });
      setCampaignStatus([]);
      setRecentActivity([]);
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

  const statsToDisplay = [
    { 
      icon: "mailBulk" as const, 
      label: "Emails Sent", 
      value: dashboardStats?.stats?.emailsSent ?? 0, 
      variant: "success" as const,
    },
    { 
      icon: "eye" as const, 
      label: "Opens", 
      value: dashboardStats?.stats?.totalOpens ?? 0, 
      variant: "info" as const,
      change: `${(dashboardStats?.stats?.openRate ?? 0).toFixed(1)}% open rate`
    },
    { 
      icon: "messageSquare" as const, 
      label: "Email Responses", 
      value: dashboardStats?.stats?.responses ?? 0, 
      variant: "info" as const,
      change: `${(dashboardStats?.stats?.responseRate ?? 0).toFixed(1)}% response rate`
    },
    { 
      icon: "sparkles" as const, 
      label: "Response Rate", 
      value: `${dashboardStats?.stats?.responseRate ?? 0}%`, 
      variant: "success" as const 
    },
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
      <Row vertical="center" horizontal="space-between" fillWidth>
        <Heading variant="display-strong-m">Welcome Back, {userName}!</Heading>
        <Button label="Create Campaign" suffixIcon="plus" onClick={() => router.push("/student/campaigns/new")}/>
        </Row>
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
            subtitle={stat.subtitle}
            change={stat.change}
            value={stat.value}
          />
        ))}
      </Row>
        <Row gap="24">      
          <LineChart
            data={dashboardStats?.dailyChartData?.map(item => ({
              date: item.date,
              'Emails Sent': item.activity,
              'Replies': item.replies,
              'Response Rate': item.responseRate
            })) || []}
            series={[
              { key: 'Emails Sent', color: "magenta" },
              { key: 'Replies', color: "yellow" },
              { key: 'Response Rate', color: "emerald" },
            ]}
            date={{
              format: 'MMM d',
              start: (() => {
                const d = new Date();
                d.setDate(d.getDate() - 29); // Last 30 days
                d.setHours(0, 0, 0, 0);
                return d;
              })(),
              end: new Date(),
              selector: true,
              presets: {
                display: true,
                granularity: 'week'
              },
            }}
            title="Daily Activity (Last 30 Days)"
            description="Track your daily email activity and response rates"
          />          <BarChart
            border="neutral-medium"
            fill
            minHeight={24}
            data={emailStatusStats?.statusData?.map(item => ({
              status: item.status,
              Count: item.count
            })) || []}
            series={[
              { key: 'Count', color: 'blue' }
            ]}
            title="Email Status Distribution"
            description="Breakdown of your email delivery and engagement statuses"
          />
        </Row>
         <Grid columns="2" tabletColumns="1" gap="24" fillWidth>
              <Column fillWidth border="neutral-medium" radius="l" overflow="hidden">
                <Row vertical="center" horizontal="space-between" fillWidth padding="24" gap="16" wrap>
                  <Heading wrap="nowrap" variant="heading-strong-s">
                    Campaign Status
                  </Heading>
                  <Button size="s" variant="secondary" href="/student/campaigns">
                    View All
                  </Button>
                </Row>
                
                <Column fillWidth borderTop="neutral-medium">
                  {campaignStatus.length > 0 ? (
                    campaignStatus.map((campaign, index) => (
                      <Card direction="column" background="transparent" href={`/student/campaigns/${campaign.id}`} border="transparent" key={campaign.id} fillWidth>
                        <Column gap="12" padding="24">
                          <Row vertical="center" fillWidth horizontal="space-between">
                            <Column gap="4">
                              <Text variant="body-default-s" color="inherit">
                                {campaign.name}
                              </Text>
                              <Text variant="label-default-s" onBackground="neutral-weak">
                                {campaign.universities} {campaign.universities === 1 ? 'university' : 'universities'} • {campaign.sentEmails}/{campaign.totalEmails} emails sent
                              </Text>
                            </Column>
                            <Tag variant={
                              campaign.status === 'Completed' ? 'success' : 
                              campaign.status === 'In Progress' ? 'info' : 'warning'
                            }>
                              {campaign.status}
                            </Tag>
                          </Row>
                          <Row gap="8" vertical="center">
                            <Text variant="label-default-s" onBackground="neutral-weak">
                              Progress: {campaign.progress}%
                            </Text>
                            <div style={{ 
                              width: '100px', 
                              height: '4px', 
                              backgroundColor: 'var(--neutral-alpha-weak)', 
                              borderRadius: '2px',
                              overflow: 'hidden'
                            }}>
                              <div style={{ 
                                width: `${campaign.progress}%`, 
                                height: '100%', 
                                backgroundColor: campaign.status === 'Completed' ? 'var(--success-alpha-medium)' : 'var(--background-info-medium)',
                                transition: 'width 0.3s ease'
                              }} />
                            </div>
                          </Row>
                        </Column>
                        {index < campaignStatus.length - 1 && <Line />}
                      </Card>
                    ))
                  ) : (
                    <Card background="transparent" border="transparent" padding="24" fillWidth>
                      <Column gap="8" horizontal="center" vertical="center">
                        <Icon name="campaign" size="l" />
                        <Text variant="body-default-s" onBackground="neutral-weak">
                          No campaigns yet
                        </Text>
                        <Button size="s" variant="secondary" href="/student/campaigns/new">
                          Create Campaign
                        </Button>
                      </Column>
                    </Card>
                  )}
                </Column>
              </Column>

              <Column border="neutral-medium" radius="l" fillWidth overflow="hidden">
                <Row fillWidth vertical="center" horizontal="space-between" padding="24" gap="16" wrap>
                  <Heading wrap="nowrap" variant="heading-strong-s">
                    Recent Activity
                  </Heading>
                  <Button size="s" variant="secondary" suffixIcon="chevronRight">
                    View All
                  </Button>
                </Row>
                <Column fillWidth borderTop="neutral-medium">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                      <div key={activity.id}>
                        <ActivityItem 
                          action={activity.action}
                          name={activity.name}
                          time={activity.timeFormatted}
                          icon={activity.icon}
                          university={activity.university}
                        />
                        {index < recentActivity.length - 1 && <Line />}
                      </div>
                    ))
                  ) : (
                    <Card background="transparent" border="transparent" padding="24" fillWidth>
                      <Column gap="8" horizontal="center" vertical="center">
                        <Icon name="activity" size="l" />
                        <Text variant="body-default-s" onBackground="neutral-weak">
                          No recent activity
                        </Text>
                        <Text variant="label-default-s" onBackground="neutral-weak">
                          Start a campaign to see activity here
                        </Text>
                      </Column>
                    </Card>
                  )}
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

export default function StudentDashboardWrapper() {
  return (
    <Suspense fallback={<Skeleton shape="block"/>}>
      <StudentDashboardInner />
    </Suspense>
  );
}