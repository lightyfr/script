'use server';

import { auth } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/server';
import type { Database } from '@/database.types';

/**
 * Fetches the current user's first name from Supabase.
 * Returns 'Student' if no name is set.
 */
export async function getStudentName() {
  const supabase = await createSupabaseClientWithClerkToken();
  const { data, error } = await supabase
    .from('users')
    .select('firstName')
    .single();

  if (error) {
    console.error('Error fetching user name:', error);
    return 'Student';
  }

  return data?.firstName || 'Student';
}

export async function getStudentDashboardStats() {
  const supabase = await createSupabaseClientWithClerkToken();
  const authData = await auth();
  const userId = authData.userId;

  if (!userId) {
    console.error('Error fetching user data: User not authenticated');
    throw new Error('User not authenticated');
  }

  // Get user's campaigns first
  const { data: userCampaigns, error: userCampaignsError } = await supabase
    .from('campaigns')
    .select('id')
    .eq('user_id', userId);

  if (userCampaignsError || !userCampaigns || userCampaigns.length === 0) {

    return {
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
      dailyChartData: processDailyData([]),
    };
  }

  const campaignIds = userCampaigns.map(c => c.id);

  // Run all the queries concurrently
  const [
    { count: emailsSent = 0 },
    { data: emailLogs = [] },
    { count: repliedEmails = 0 },
    { data: pendingEmails = [] },
    { data: allEmailLogs = [] },
    { data: repliedEmailsData = [] }
  ] = await Promise.all([
    // Count of all sent emails
    supabase
      .from('pending_emails')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'sent')
      .in('campaign_id', campaignIds),
      
    // Get all email logs to calculate open count
    supabase
      .from('email_logs')
      .select('open_count, status, campaign_id, created_at')
      .in('campaign_id', campaignIds),
      
    // Count of replied emails (from email_logs where status is 'replied')
    supabase
      .from('email_logs')
      .select('id', { count: 'exact', head: true })
      .in('campaign_id', campaignIds)
      .eq('status', 'replied'),
      
    // Get sent emails for the last 30 days for activity data
    supabase
      .from('pending_emails')
      .select('id, created_at, status')
      .in('campaign_id', campaignIds)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()), // Last 30 days
      
    // Get all email logs for tracking
    supabase
      .from('email_logs')
      .select('id, open_count, campaign_id, status, created_at')
      .in('campaign_id', campaignIds),
    
    // Get replied emails with timestamps for the last 30 days
    supabase
      .from('email_logs')
      .select('id, created_at, replied_at, status, sent_at')
      .in('campaign_id', campaignIds)
      .eq('status', 'replied')
      .not('replied_at', 'is', null)
      .gte('replied_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
  ]);
  
  // Process daily activity data with all email logs
  // We use emailLogs since it contains all sent emails with their status
  const emailLogsArray = Array.isArray(emailLogs) ? emailLogs : [];
  const dailyActivityData = emailLogsArray.map(log => ({
    ...log,
    // Ensure we have all required fields for processDailyData
    created_at: log.created_at,
    status: log.status,
    // Use type assertion to handle the fact that we know these fields exist in the query
    replied_at: (log as any).replied_at || null,
    sent_at: (log as any).sent_at || log.created_at // Fallback to created_at if sent_at is not available
  }));
  
  // Log for debugging
  console.log('Total email logs:', emailLogsArray.length);
  console.log('Replied emails:', repliedEmailsData?.length || 0);
  // Calculate total opens by summing up all open_counts
  const totalOpens = (emailLogs || []).reduce((sum, log) => sum + (log.open_count || 0), 0);
  const totalTrackedEmails = (allEmailLogs || []).length;

  const responseRate = (emailsSent ?? 0) > 0 ? ((repliedEmails ?? 0) / (emailsSent ?? 0)) * 100 : 0;
  const openRate = totalTrackedEmails > 0 ? (totalOpens / totalTrackedEmails) * 100 : 0;

  return {
    stats: {
      emailsSent: emailsSent || 0,
      applications: 0,
      responses: repliedEmails || 0,
      responseRate: parseFloat(responseRate.toFixed(1)),
      openRate: parseFloat(openRate.toFixed(1)),
      totalOpens: totalOpens || 0,
      totalTrackedEmails: totalTrackedEmails || 0,
      totalCampaigns: campaignIds.length
    },
    dailyChartData: processDailyData(dailyActivityData || []),
  };
}

// Helper function to process daily data
function processDailyData(
  logs: Array<{ 
    created_at: string; 
    status?: string | null; 
    replied_at?: string | null;
    sent_at?: string | null;
  }>
): Array<{ name: string; date: Date; activity: number; replies: number; responseRate: number }> {
  const dailyActivity: { [dateKey: string]: { 
    name: string; 
    date: Date;
    sent: number; // Track sent emails
    replied: number; // Track replies
  } } = {};
  
  const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

  // Initialize data for the last 30 days in local timezone
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    // Convert to YYYY-MM-DD in local timezone
    const dateKey = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
      .toISOString()
      .split('T')[0];
    const formattedDate = dateFormatter.format(date);
    dailyActivity[dateKey] = { 
      name: formattedDate, 
      date: new Date(date), // Store the date object for sorting
      sent: 0,
      replied: 0 
    };
  }


  // First pass: Count sent emails by date
  logs.forEach(log => {
    // Use sent_at if available, otherwise fall back to created_at
    const sentDate = log.sent_at || log.created_at;
    // Create date in local timezone
    const date = new Date(sentDate);
    // Convert to YYYY-MM-DD in local timezone
    const dateKey = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
      .toISOString()
      .split('T')[0];
    
    if (dailyActivity[dateKey]) {
      // Count all logs as sent emails
      dailyActivity[dateKey].sent++;
    }
  });

  // Second pass: Count replies and attribute them to the sent date
  logs.forEach(log => {
    if (log.status === 'replied') {
      // Use sent_at to attribute the reply to the correct day
      const sentDate = log.sent_at || log.created_at;
      const date = new Date(sentDate);
      date.setHours(0, 0, 0, 0);
      const dateKey = date.toISOString().split('T')[0];
      
      if (dailyActivity[dateKey]) {
        dailyActivity[dateKey].replied++;
      }
    }
  });

  // Convert to array, sort by date, and return the data
  return Object.values(dailyActivity)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map(data => ({
      name: data.name,
      date: data.date,
      activity: data.sent,
      replies: data.replied,
      responseRate: data.sent > 0 ? parseFloat(((data.replied / data.sent) * 100).toFixed(1)) : 0,
    }));
}


// Helper to instantiate Supabase client with Clerk auth token
async function createSupabaseClientWithClerkToken() {
  const authInstance = auth();
  const clerkToken = await (await authInstance).getToken();
  if (!clerkToken) {
    throw new Error('Clerk token not available. Ensure user is authenticated.');
  }

  const supabase = await createServerSupabaseClient();
  // Attach Clerk token to global headers if needed
  (supabase as any).global = {
    ...(supabase as any).global,
    headers: {
      Authorization: `Bearer ${clerkToken}`,
    },
  };
  return supabase;
}

export async function hasUserGmailToken(): Promise<boolean> {
  const supabase = await createSupabaseClientWithClerkToken();
  const authData = await auth(); // Await the auth() call
  const userId = authData.userId;

  if (!userId) {
    console.error("Error checking Gmail token: User not authenticated");
    return false; // Or throw an error, depending on desired behavior
  }

  const { data, error } = await supabase
    .from("user_oauth_tokens")
    .select("id")
    .eq("user_id", userId)
    .eq("provider", "gmail") // Assuming 'google' is the provider name for Gmail
    .maybeSingle(); // Use maybeSingle to get one record or null

  if (error) {
    console.error("Error fetching Gmail token:", error);
    return false; // Or handle error appropriately
  }

  return !!data; // True if data is not null (token exists), false otherwise
}

export async function getCampaignStatus() {
  const supabase = await createSupabaseClientWithClerkToken();
  const authData = await auth();
  const userId = authData.userId;

  if (!userId) {
    console.error('Error fetching campaign status: User not authenticated');
    return [];
  }

  // Fetch user's campaigns with their stats
  const { data: campaigns, error: campaignsError } = await supabase
    .from('campaigns')
    .select(`
      id,
      status,
      target_universities,
      research_interests,
      max_emails,
      created_at,
      updated_at
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(4);

  if (campaignsError) {
    console.error('Error fetching campaigns:', campaignsError);
    return [];
  }

  if (!campaigns || campaigns.length === 0) {
    return [];
  }

  // For each campaign, get email stats
  const campaignStats = await Promise.all(
    campaigns.map(async (campaign) => {
      const { count: totalEmails } = await supabase
        .from('pending_emails')
        .select('id', { count: 'exact', head: true })
        .eq('campaign_id', campaign.id);

      const { count: sentEmails } = await supabase
        .from('pending_emails')
        .select('id', { count: 'exact', head: true })
        .eq('campaign_id', campaign.id)
        .not('sent_at', 'is', null);

      const { count: repliedEmails } = await supabase
        .from('email_logs')
        .select('id', { count: 'exact', head: true })
        .eq('campaign_id', campaign.id)
        .eq('status', 'replied');

      const progress = totalEmails && totalEmails > 0 ? Math.round((sentEmails || 0) / totalEmails * 100) : 0;
      
      // Determine status based on campaign data
      let displayStatus = 'Active';
      if (campaign.status === 'completed') {
        displayStatus = 'Completed';
      } else if (campaign.status === 'paused') {
        displayStatus = 'Paused';
      } else if (progress < 30) {
        displayStatus = 'Starting';
      } else if (progress >= 90) {
        displayStatus = 'Nearly Done';
      }

      return {
        id: campaign.id,
        name: `${campaign.target_universities?.[0] || 'University'} Campaign`,
        progress,
        status: displayStatus,
        universities: campaign.target_universities?.length || 0,
        interests: campaign.research_interests?.length || 0,
        totalEmails: totalEmails || 0,
        sentEmails: sentEmails || 0,
        repliedEmails: repliedEmails || 0
      };
    })
  );

  return campaignStats;
}

export async function getRecentActivity() {
  const supabase = await createSupabaseClientWithClerkToken();
  const authData = await auth();
  const userId = authData.userId;

  if (!userId) {
    console.error('Error fetching recent activity: User not authenticated');
    return [];
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Get recent email activities
  const { data: emailActivities, error: emailError } = await supabase
    .from('pending_emails')
    .select(`
      id,
      professor_name,
      professor_email,
      status,
      sent_at,
      created_at,
      university,
      campaigns!inner(user_id)
    `)
    .eq('campaigns.user_id', userId)
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(10);

  if (emailError) {
    console.error('Error fetching email activities:', emailError);
  }

  // Get recent connections
  const { data: connections, error: connectionsError } = await supabase
    .from('connections')
    .select(`
      id,
      status,
      created_at,
      updated_at,
      users!connections_professor_id_fkey(firstName, lastName, email)
    `)
    .eq('student_id', userId)
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(5);

  if (connectionsError) {
    console.error('Error fetching connections:', connectionsError);
  }

  const activities: Array<{
    id: string;
    type: 'email' | 'connection';
    action: string;
    icon: string;
    name: string;
    time: string;
    university?: string;
  }> = [];

  // Process email activities
  if (emailActivities) {
    emailActivities.forEach(email => {
      let action = '';
      let icon = 'mail';
      
      if (email.status === 'sent' || email.sent_at) {
        action = `Sent email to ${email.professor_name} at ${email.university || 'university'}`;
        icon = 'send';
      } else if (email.status === 'replied') {
        action = `Received reply from ${email.professor_name}`;
        icon = 'mail-check';
      } else if (email.status === 'pending') {
        action = `Queued email for ${email.professor_name}`;
        icon = 'clock';
      } else {
        action = `Email activity with ${email.professor_name}`;
      }

      activities.push({
        id: email.id,
        type: 'email',
        action,
        icon,
        name: email.professor_name,
        time: email.sent_at || email.created_at,
        university: email.university || undefined
      });
    });
  }

  // Process connection activities
  if (connections) {
    connections.forEach(connection => {
      const professorName = connection.users ? 
        `${connection.users.firstName ?? ''} ${connection.users.lastName ?? ''}`.trim() : 
        'Professor';
      
      let action = '';
      let icon = 'users';

      if (connection.status === 'accepted') {
        action = `${professorName} accepted your research collaboration request`;
        icon = 'check-circle';
      } else if (connection.status === 'pending') {
        action = `Sent collaboration request to ${professorName}`;
        icon = 'user-plus';
      } else if (connection.status === 'rejected') {
        action = `${professorName} declined your collaboration request`;
        icon = 'x-circle';
      }

      activities.push({
        id: connection.id,
        type: 'connection',
        action,
        icon,
        name: professorName,
        time: connection.updated_at || connection.created_at
      });
    });
  }

  // Sort all activities by time and take the most recent 6
  return activities
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 6)
    .map(activity => ({
      ...activity,
      timeFormatted: formatTimeAgo(activity.time)
    }));
}

// Helper function to format time ago
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString();
}

export async function getConnectionStats() {
  const supabase = await createSupabaseClientWithClerkToken();
  const authData = await auth();
  const userId = authData.userId;

  if (!userId) {
    console.error('Error fetching connection stats: User not authenticated');
    return {
      monthlyConnectionData: []
    };
  }

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  threeMonthsAgo.setDate(1);
  threeMonthsAgo.setHours(0, 0, 0, 0);

  // Get connection data for the last 3 months
  const { data: connections, error: connectionsError } = await supabase
    .from('connections')
    .select('created_at, status, updated_at')
    .eq('student_id', userId)
    .gte('created_at', threeMonthsAgo.toISOString());

  if (connectionsError) {
    console.error('Error fetching connection stats:', connectionsError);
    return {
      monthlyConnectionData: []
    };
  }

  const monthActivity: { [monthYear: string]: { name: string, activity: number; accepted: number } } = {};
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Initialize data for the last 3 months
  const today = new Date();
  for (let i = 2; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthKey = monthNames[d.getMonth()];
    const year = d.getFullYear();
    const monthYearKey = `${monthKey}-${year}`;
    monthActivity[monthYearKey] = { name: monthKey, activity: 0, accepted: 0 };
  }

  // Process connections
  if (connections) {
    connections.forEach(connection => {
      const date = new Date(connection.created_at);
      const monthKey = monthNames[date.getMonth()];
      const year = date.getFullYear();
      const monthYearKey = `${monthKey}-${year}`;

      if (monthActivity[monthYearKey]) {
        monthActivity[monthYearKey].activity++;
        if (connection.status === 'accepted') {
          monthActivity[monthYearKey].accepted++;
        }
      }
    });
  }

  const monthlyConnectionData = Object.values(monthActivity)
    .map(data => ({
      name: data.name,
      activity: data.activity,
      replies: data.activity > 0 ? parseFloat(((data.accepted / data.activity) * 100).toFixed(1)) : 0,
      responseRate: data.activity > 0 ? parseFloat(((data.accepted / data.activity) * 100).toFixed(1)) : 0,
    }));

  return {
    monthlyConnectionData
  };
}