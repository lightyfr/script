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
  const searchParams = useSearchParams();  // Toggle for fake data - set to true for screenshot/demo mode
  const [USE_FAKE_DATA, setUseFakeData] = useState(false); // Toggle this to true for screenshots

  // Fake data generator for compelling dashboard screenshots
  const generateFakeData = () => {
    // Generate 30 days of fake data with realistic patterns
    const fakeChartData = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Create realistic patterns - higher activity on weekdays, lower on weekends
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const baseActivity = isWeekend ? 2 : 8;
      
      // Add some randomness and trends
      const activity = Math.max(0, Math.floor(baseActivity + Math.random() * 6 - 1));
      const opens = Math.floor(activity * (0.3 + Math.random() * 0.4)); // 30-70% open rate
      const replies = Math.floor(opens * (0.1 + Math.random() * 0.2)); // 10-30% reply rate from opens
      const responseRate = activity > 0 ? (replies / activity) * 100 : 0;
      
      fakeChartData.push({
        name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        date: date,
        activity: activity,
        opens: opens,
        replies: replies,
        responseRate: responseRate
      });
    }

    const totalActivity = fakeChartData.reduce((sum, day) => sum + day.activity, 0);
    const totalOpens = fakeChartData.reduce((sum, day) => sum + day.opens, 0);
    const totalReplies = fakeChartData.reduce((sum, day) => sum + day.replies, 0);
    const overallResponseRate = totalActivity > 0 ? (totalReplies / totalActivity) * 100 : 0;
    const overallOpenRate = totalActivity > 0 ? (totalOpens / totalActivity) * 100 : 0;

    return {
      stats: {
        emailsSent: 702,
        applications: 47, // Static number for applications
        responses: 167,
        responseRate: overallResponseRate,
        openRate: overallOpenRate,
        totalOpens: 610,
        totalTrackedEmails: totalActivity,
        totalCampaigns: 3
      },
      dailyChartData: fakeChartData
    };
  };

  const generateFakeCampaigns = () => [
    {
      id: "1",
      name: "Computer Science PhD Applications",
      progress: 85,
      status: "In Progress",
      universities: 12,
      interests: 5,
      totalEmails: 36,
      sentEmails: 31,
      repliedEmails: 8
    },
    {
      id: "2", 
      name: "AI Research Positions",
      progress: 100,
      status: "Completed",
      universities: 8,
      interests: 3,
      totalEmails: 24,
      sentEmails: 24,
      repliedEmails: 5
    },
    {
      id: "3",
      name: "Data Science Internships",
      progress: 45,
      status: "In Progress",
      universities: 15,
      interests: 7,
      totalEmails: 405,
      sentEmails: 400,
      repliedEmails: 3
    }
  ];

  const generateFakeActivity = () => [
    {
      id: "1",
      type: "email" as const,
      action: "Sent email to Dr. Sarah Johnson",
      icon: "mail",
      name: "Dr. Sarah Johnson",
      time: "2 hours ago",
      timeFormatted: "2 hours ago",
      university: "Stanford University"
    },
    {
      id: "2",
      type: "email" as const,
      action: "Received reply from Prof. Michael Chen",
      icon: "messageCircle",
      name: "Prof. Michael Chen",
      time: "4 hours ago", 
      timeFormatted: "4 hours ago",
      university: "MIT"
    },
    {
      id: "3",
      type: "connection" as const,
      action: "Connected with Dr. Emily Rodriguez",
      icon: "userPlus",
      name: "Dr. Emily Rodriguez",
      time: "1 day ago",
      timeFormatted: "1 day ago",
      university: "Carnegie Mellon University"
    },
    {
      id: "4",
      type: "email" as const,
      action: "Sent follow-up to Prof. David Kim",
      icon: "mail",
      name: "Prof. David Kim",
      time: "2 days ago",
      timeFormatted: "2 days ago", 
      university: "UC Berkeley"
    },
    {
      id: "5",
      type: "email" as const,
      action: "Received reply from Dr. Lisa Wang",
      icon: "messageCircle",
      name: "Dr. Lisa Wang",
      time: "3 days ago",
      timeFormatted: "3 days ago",
      university: "Harvard University"
    }
  ];

  const generateFakeEmailStatusStats = () => ({
    statusData: [
      { status: "Delivered", count: 89 },
      { status: "Opened", count: 47 },
      { status: "Replied", count: 16 },
      { status: "Bounced", count: 3 },
      { status: "Pending", count: 7 }
    ]
  });

  const generateFakeConnectionStats = () => ({
    monthlyConnectionData: [
      { name: "Jan", activity: 75, replies: 13, responseRate: 20 },
      { name: "Feb", activity: 122, replies: 44, responseRate: 27 },
      { name: "Mar", activity: 51, replies: 7, responseRate: 26 },
      { name: "Apr", activity: 88, replies: 12, responseRate: 54 },
      { name: "May", activity: 135, replies: 49, responseRate: 86 }
    ]
  });
  const hasSuper = has && has({ plan: 'script_super' });
  const [userName, setUserName] = useState('Student');
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [showGmailFeedback, setShowGmailFeedback] = useState(false);  const [dashboardStats, setDashboardStats] = useState<{
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
      replies: number;
      opens: number;
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
      if (USE_FAKE_DATA) {
        // Use fake data for screenshots/demos
        setUserName("Alex Thompson");
        setDashboardStats(generateFakeData());
        setCampaignStatus(generateFakeCampaigns());
        setRecentActivity(generateFakeActivity());
        setConnectionStats(generateFakeConnectionStats());
        setEmailStatusStats(generateFakeEmailStatusStats());
        setShowGmailFeedback(false);
        return;
      }

      // Normal data fetching for real usage
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
      setRecentActivity([]);      setShowGmailFeedback(true); 
    }
  }, [USE_FAKE_DATA]);

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
  };  // Helper function to calculate percentage change from recent data
  const calculatePercentageChange = (
    dailyData: Array<{ activity: number; replies: number; opens: number; responseRate: number }>,
    metricKey: 'activity' | 'replies' | 'opens' | 'responseRate'
  ): { change: number; isPositive: boolean; hasValidData: boolean } => {
    if (!dailyData || dailyData.length < 14) return { change: 0, isPositive: true, hasValidData: false };
    
    // Compare last 7 days vs previous 7 days
    const recent7Days = dailyData.slice(-7);
    const previous7Days = dailyData.slice(-14, -7);
    
    if (recent7Days.length === 0 || previous7Days.length === 0) return { change: 0, isPositive: true, hasValidData: false };
    
    let recentSum, previousSum;
    
    if (metricKey === 'responseRate') {
      // For response rate, calculate the actual response rate from replies/activity ratio
      const recentReplies = recent7Days.reduce((sum, day) => sum + day.replies, 0);
      const recentActivity = recent7Days.reduce((sum, day) => sum + day.activity, 0);
      const previousReplies = previous7Days.reduce((sum, day) => sum + day.replies, 0);
      const previousActivity = previous7Days.reduce((sum, day) => sum + day.activity, 0);
      
      recentSum = recentActivity > 0 ? (recentReplies / recentActivity) * 100 : 0;
      previousSum = previousActivity > 0 ? (previousReplies / previousActivity) * 100 : 0;
    } else {
      // For other metrics, use direct sum
      recentSum = recent7Days.reduce((sum, day) => sum + day[metricKey], 0);
      previousSum = previous7Days.reduce((sum, day) => sum + day[metricKey], 0);
    }
    
    console.log(`${metricKey}: recent=${recentSum}, previous=${previousSum}`); // Debug log
    
    // Handle special cases
    if (previousSum === 0 && recentSum === 0) {
      return { change: 0, isPositive: true, hasValidData: false };
    }
    
    if (previousSum === 0 && recentSum > 0) {
      // New activity started - show as significant increase
      return { change: 100, isPositive: true, hasValidData: true };
    }
    
    if (previousSum > 0 && recentSum === 0) {
      // Activity stopped - show as 100% decrease
      return { change: 100, isPositive: false, hasValidData: true };
    }
    
    // For very small numbers (especially response rates), limit the percentage change to prevent extreme values
    const percentChange = ((recentSum - previousSum) / previousSum) * 100;
    const limitedChange = Math.min(Math.abs(percentChange), 999); // Cap at 999%
    
    return { 
      change: limitedChange, 
      isPositive: percentChange >= 0,
      hasValidData: true
    };
  };const statsToDisplay = [
    { 
      icon: "mailBulk" as const, 
      label: "Emails Sent", 
      value: dashboardStats?.stats?.emailsSent ?? 0, 
      variant: (() => {
        const { isPositive, hasValidData } = calculatePercentageChange(dashboardStats?.dailyChartData || [], 'activity');
        if (!hasValidData) return "warning" as const;
        // For emails sent, positive trend is always good
        return isPositive ? "success" as const : "danger" as const;
      })(),
      change: (() => {
        const { change, isPositive, hasValidData } = calculatePercentageChange(dashboardStats?.dailyChartData || [], 'activity');
        if (!hasValidData) return "No recent data";
        return `${isPositive ? '+' : '-'}${change.toFixed(1)}% vs last week`;
      })()
    },
    { 
      icon: "eye" as const, 
      label: "Opens", 
      value: dashboardStats?.stats?.totalOpens ?? 0, 
      variant: (() => {
        const { isPositive, hasValidData, change } = calculatePercentageChange(dashboardStats?.dailyChartData || [], 'opens');
        const openRate = dashboardStats?.stats?.openRate ?? 0;
        
        if (!hasValidData) {
          // Fall back to open rate for variant when no change data available
          return openRate >= 20 ? "success" as const : 
                 openRate >= 10 ? "warning" as const : "danger" as const;
        }
        
        // Consider both trend and absolute performance
        if (openRate >= 20) {
          // Good open rate - even small decreases are okay
          return isPositive || change <= 30 ? "success" as const : "warning" as const;
        } else if (openRate >= 10) {
          // Moderate open rate - positive trends are good, negative trends are concerning
          return isPositive ? "success" as const : "warning" as const;
        } else {
          // Poor open rate - only positive trends are good
          return isPositive ? "warning" as const : "danger" as const;
        }
      })(),
      change: (() => {
        const { change, isPositive, hasValidData } = calculatePercentageChange(dashboardStats?.dailyChartData || [], 'opens');
        if (!hasValidData) return `${(dashboardStats?.stats?.openRate ?? 0).toFixed(1)}% open rate`;
        return `${isPositive ? '+' : '-'}${change.toFixed(1)}% vs last week`;
      })()
    },
    { 
      icon: "messageSquare" as const, 
      label: "Email Responses", 
      value: dashboardStats?.stats?.responses ?? 0, 
      variant: (() => {
        const { isPositive, hasValidData, change } = calculatePercentageChange(dashboardStats?.dailyChartData || [], 'replies');
        const responseRate = dashboardStats?.stats?.responseRate ?? 0;
        
        if (!hasValidData) {
          // Fall back to response rate for variant when no change data available
          return responseRate >= 15 ? "success" as const :
                 responseRate >= 5 ? "warning" as const : "danger" as const;
        }
        
        // Consider both trend and absolute performance
        if (responseRate >= 15) {
          // Good response rate - even small decreases are okay
          return isPositive || change <= 30 ? "success" as const : "warning" as const;
        } else if (responseRate >= 5) {
          // Moderate response rate - positive trends are good, negative trends are concerning
          return isPositive ? "success" as const : "warning" as const;
        } else {
          // Poor response rate - only positive trends are good
          return isPositive ? "warning" as const : "danger" as const;
        }
      })(),
      change: (() => {
        const { change, isPositive, hasValidData } = calculatePercentageChange(dashboardStats?.dailyChartData || [], 'replies');
        if (!hasValidData) return "No recent data";
        return `${isPositive ? '+' : '-'}${change.toFixed(1)}% vs last week`;
      })()
    },
    { 
      icon: "sparkles" as const, 
      label: "Response Rate", 
      value: `${(dashboardStats?.stats?.responseRate ?? 0).toFixed(1)}%`, 
      variant: (() => {
        const { isPositive, hasValidData, change } = calculatePercentageChange(dashboardStats?.dailyChartData || [], 'responseRate');
        const responseRate = dashboardStats?.stats?.responseRate ?? 0;
        
        if (!hasValidData) {
          // Fall back to actual response rate for variant when no change data available
          return responseRate >= 15 ? "success" as const :
                 responseRate >= 5 ? "warning" as const : "danger" as const;
        }
        
        // For response rate, consider both trend and absolute value
        if (responseRate >= 15) {
          // Good response rate - small decreases are acceptable
          return isPositive || change <= 20 ? "success" as const : "warning" as const;
        } else if (responseRate >= 5) {
          // Moderate response rate - focus on trend
          return isPositive ? "success" as const : "warning" as const;
        } else {
          // Poor response rate - only positive trends help
          return isPositive ? "warning" as const : "danger" as const;
        }
      })(),
      change: (() => {
        const { change, isPositive, hasValidData } = calculatePercentageChange(dashboardStats?.dailyChartData || [], 'responseRate');
        if (!hasValidData) return "No recent data";
        return `${isPositive ? '+' : '-'}${change.toFixed(1)}% vs last week`;
      })()
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
        )}      <Column gap="16">
      <Row vertical="center" horizontal="space-between" fillWidth>
        <Heading variant="display-strong-m">Welcome Back, {userName}!</Heading>
        <Row gap="12" vertical="center">
          {/* Data Mode Toggle - for screenshots/demos */}
          <Button label="Create Campaign" suffixIcon="plus" onClick={() => router.push("/student/campaigns/new")}/>
        </Row>
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
        <Row gap="24">          <LineChart
            data={dashboardStats?.dailyChartData?.map(item => ({
              date: item.date,
              'Emails Sent': item.activity,
              'Opens': item.opens,
              'Replies': item.replies,
              'Response Rate': item.responseRate
            })) || []}
            series={[
              { key: 'Emails Sent', color: "magenta" },
              { key: 'Opens', color: "blue" },
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
            title="Activity Chart"
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