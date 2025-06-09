import { NextResponse } from 'next/server';
import { getStudentName, getStudentDashboardStats, getCampaignStatus, getRecentActivity, getConnectionStats, hasUserGmailToken } from '@/app/student/dashboard/actions';

export async function GET() {
  try {
    const [name, statsData, campaigns, activities, connectionData, showFeedback] = await Promise.all([
      getStudentName(),
      getStudentDashboardStats(),
      getCampaignStatus(),
      getRecentActivity(),
      getConnectionStats(),
      hasUserGmailToken().then(token => !token),
    ]);
    return NextResponse.json({
      userName: name,
      dashboardStats: statsData,
      campaignStatus: campaigns,
      recentActivity: activities,
      connectionStats: connectionData,
      showGmailFeedback: showFeedback,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
} 