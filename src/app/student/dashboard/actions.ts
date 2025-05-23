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
    const { count: offers = 0 } = await supabase
      .from('connections')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', userId)
      .eq('status', 'accepted');

    return {
      stats: {
        emailsSent: 0,
        applications: 0,
        offers,
        responseRate: 0,
        totalCampaigns: 0,
      },
      monthlyChartData: processMonthlyData([]),
    };
  }

  const campaignIds = userCampaigns.map(c => c.id);
  const totalCampaigns = campaignIds.length;

  // Run all the queries concurrently
  const [
    { count: emailsSent = 0 },
    { count: offers = 0 },
    { count: repliedEmails = 0 },
    { data: monthlyActivityData = [] }
  ] = await Promise.all([
    supabase
      .from('pending_emails')
      .select('id', { count: 'exact', head: true })
      .in('campaign_id', campaignIds),
    supabase
      .from('connections')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', userId)
      .eq('status', 'accepted'),
    supabase
      .from('pending_emails')
      .select('id', { count: 'exact', head: true })
      .in('campaign_id', campaignIds)
      .eq('status', 'replied'),
    supabase
      .from('pending_emails')
      .select('created_at, status')
      .in('campaign_id', campaignIds)
      .gte('created_at', new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString()),
  ]);

  const responseRate = (emailsSent ?? 0) > 0 ? ((repliedEmails ?? 0) / (emailsSent ?? 0)) * 100 : 0;

  return {
    stats: {
      emailsSent: emailsSent ?? 0,
      applications: 0,
      offers,
      responseRate: parseFloat(responseRate.toFixed(1)),
      totalCampaigns,
    },
    monthlyChartData: processMonthlyData(monthlyActivityData || []),
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
    .eq("provider", "gmail") // Assuming 'google' is the provider name for Gmail
    .maybeSingle(); // Use maybeSingle to get one record or null

  if (error) {
    console.error("Error fetching Gmail token:", error);
    return false; // Or handle error appropriately
  }

  return !!data; // True if data is not null (token exists), false otherwise
}
