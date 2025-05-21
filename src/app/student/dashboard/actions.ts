'use server';

import { cookies } from 'next/headers';
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

  // Fetch user's campaigns
  const { data: userCampaigns, error: userCampaignsError } = await supabase
    .from('campaigns')
    .select('id')
    .eq('user_id', userId);

  if (userCampaignsError) {
    console.error('Error fetching user campaigns:', userCampaignsError);
    // Return zeroed stats or throw, depending on desired error handling
    return {
      stats: { emailsSent: 0, applications: 0, offers: 0, responseRate: 0, totalCampaigns: 0 },
      monthlyChartData: processMonthlyData([]), // Ensure processMonthlyData can handle empty or is typed for string status
    };
  }

  if (!userCampaigns || userCampaigns.length === 0) {
    // No campaigns for the user, so all campaign-related stats are zero
    // Fetch offers separately as it's not campaign-dependent in the current logic
    const { count: offers, error: offersError } = await supabase
      .from('connections')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', userId)
      .eq('status', 'accepted');

    if (offersError) {
      console.error('Error fetching offers count:', offersError);
    }

    return {
      stats: {
        emailsSent: 0,
        applications: 0,
        offers: offers || 0,
        responseRate: 0,
        totalCampaigns: 0,
      },
      monthlyChartData: processMonthlyData([]),
    };
  }

  const campaignIds = userCampaigns.map(c => c.id);
  const totalCampaigns = campaignIds.length;

  // Fetch total emails sent from pending_emails
  const { count: emailsSent, error: emailsSentError } = await supabase
    .from('pending_emails')
    .select('id', { count: 'exact', head: true })
    .in('campaign_id', campaignIds);

  if (emailsSentError) {
    console.error('Error fetching emails sent count from pending_emails:', emailsSentError);
  }

  // Fetch total offers (accepted connections) - kept as is
  const { count: offers, error: offersError } = await supabase
    .from('connections')
    .select('id', { count: 'exact', head: true })
    .eq('student_id', userId)
    .eq('status', 'accepted');

  if (offersError) {
    console.error('Error fetching offers count:', offersError);
  }

  // Fetch replied emails from pending_emails (assuming status 'replied' exists)
  const { count: repliedEmails, error: repliedEmailsError } = await supabase
    .from('pending_emails')
    .select('id', { count: 'exact', head: true })
    .in('campaign_id', campaignIds)
    .eq('status', 'replied'); // Assumption: 'replied' is a status in pending_emails.status

  if (repliedEmailsError) {
    console.error('Error fetching replied emails count from pending_emails:', repliedEmailsError);
  }

  const responseRate = emailsSent && emailsSent > 0 && repliedEmails ? (repliedEmails / emailsSent) * 100 : 0;

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  threeMonthsAgo.setDate(1);
  threeMonthsAgo.setHours(0, 0, 0, 0);

  const { data: monthlyActivityData, error: monthlyActivityError } = await supabase
    .from('pending_emails')
    .select('created_at, status') // pending_emails.status is type string
    .in('campaign_id', campaignIds)
    .gte('created_at', threeMonthsAgo.toISOString());

  if (monthlyActivityError) {
    console.error('Error fetching monthly activity data from pending_emails:', monthlyActivityError);
  }

  const monthlyChartData = processMonthlyData(monthlyActivityData || []);

  return {
    stats: {
      emailsSent: emailsSent || 0,
      applications: 0,
      offers: offers || 0,
      responseRate: parseFloat(responseRate.toFixed(1)) || 0,
      totalCampaigns: totalCampaigns || 0,
    },
    monthlyChartData,
  };
}

// Helper function to process monthly data
// Adjusted 'status' type to string | null for pending_emails
function processMonthlyData(logs: Array<{ created_at: string; status: string | null }>) {
  const monthActivity: { [monthYear: string]: { name: string, activity: number; replied: number } } = {};
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Initialize data for the last 3 months to ensure they are present
  const today = new Date();
  for (let i = 2; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthKey = monthNames[d.getMonth()];
    const year = d.getFullYear();
    const monthYearKey = `${monthKey}-${year}`;
    if (!monthActivity[monthYearKey]) {
        monthActivity[monthYearKey] = { name: monthKey, activity: 0, replied: 0 };
    }
  }

  logs.forEach(log => {
    const date = new Date(log.created_at);
    const monthKey = monthNames[date.getMonth()];
    const year = date.getFullYear();
    const monthYearKey = `${monthKey}-${year}`;

    // Ensure the month is within our tracked range (last 3 months)
    if (monthActivity[monthYearKey]) {
        monthActivity[monthYearKey].activity++;
        if (log.status === 'replied') {
            monthActivity[monthYearKey].replied++;
        }
    }
  });

  return Object.values(monthActivity)
    .map(data => ({
      name: data.name,
      activity: data.activity,
      responseRate: data.activity > 0 ? parseFloat(((data.replied / data.activity) * 100).toFixed(1)) : 0,
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
    .eq("provider", "google") // Assuming 'google' is the provider name for Gmail
    .maybeSingle(); // Use maybeSingle to get one record or null

  if (error) {
    console.error("Error fetching Gmail token:", error);
    return false; // Or handle error appropriately
  }

  return !!data; // True if data is not null (token exists), false otherwise
}
