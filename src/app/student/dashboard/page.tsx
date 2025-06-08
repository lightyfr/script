"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Column, Row, Card, Heading, Text, Button, Icon, useToast, Feedback, Tag, Dialog, Line, Grid, Avatar, Spinner, Skeleton } from "@/once-ui/components";
import { LineChart } from "@/once-ui/modules/data/LineChart";
import { ChartCard } from "@/app/components/chartCard";
import { PricingTable, useAuth, useSession, useUser } from "@clerk/nextjs";
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/database.types';
import { getStudentName, getStudentDashboardStats, hasUserGmailToken, getCampaignStatus, getRecentActivity, getConnectionStats } from "./actions";

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
  const { user } = useUser();
  const { session } = useSession();
  
  const [userName, setUserName] = useState('Student');
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [showGmailFeedback, setShowGmailFeedback] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<{
    stats: { emailsSent: number; applications: number; offers: number; responseRate: number };
    monthlyChartData: Array<{ name: string; activity: number; responseRate: number }>;
  } | null>(null);
  const [connectionStats, setConnectionStats] = useState<{
    monthlyConnectionData: Array<{ name: string; activity: number; responseRate: number }>;
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

  const { isLoaded, userId } = useAuth();
  
  // Create Supabase client following Clerk documentation pattern
  const supabaseClient = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      async accessToken() {
        return session?.getToken() ?? null
      },
    }
  );
  
  const fetchMainDashboardData = useCallback(async () => {
    if (!user || !session || !userId) return;
    
    try {
      const name = await getStudentName(supabaseClient);
      setUserName(name);
      const statsData = await getStudentDashboardStats(supabaseClient, userId);
      setDashboardStats(statsData);
      const campaigns = await getCampaignStatus(supabaseClient, userId);
      setCampaignStatus(campaigns);
      const activities = await getRecentActivity(supabaseClient, userId);
      setRecentActivity(activities);
      const connectionData = await getConnectionStats(supabaseClient, userId);
      setConnectionStats(connectionData);
      const showFeedback = !(await hasUserGmailToken(supabaseClient, userId));
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
      setConnectionStats({
        monthlyConnectionData: [
          { name: "Jan", activity: 0, responseRate: 0 },
          { name: "Feb", activity: 0, responseRate: 0 },
          { name: "Mar", activity: 0, responseRate: 0 },
        ],
      });
      setCampaignStatus([]);
      setRecentActivity([]);
      setShowGmailFeedback(true); 
    }
  }, [user, session, userId, supabaseClient]);

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
            data={connectionStats?.monthlyConnectionData || [
              { name: "Jan", activity: 2, responseRate: 25 },
              { name: "Feb", activity: 6, responseRate: 40 },
              { name: "Mar", activity: 4, responseRate: 30 },
            ]}
            series={[
              { key: "activity", color: "#0072ff8e" },
              { key: "responseRate", color: "#00b3008e" },
            ]}
            title="Connections"
            description="Your connection requests and acceptance rate over the last three months."
            labels="both"
            curveType="natural"
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
                              campaign.status === 'Paused' ? 'warning' : 
                              campaign.status === 'Nearly Done' ? 'info' : 'neutral'
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
                                backgroundColor: campaign.status === 'Completed' ? 'var(--brand-on-brand-weak)' : 'var(--accent-medium)',
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