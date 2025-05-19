import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserGmailToken, sendEmail } from '@/lib/gmail';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { to, subject, body } = await request.json();
    if (!to || !subject || !body) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    const accessToken = await getUserGmailToken(userId);
    await sendEmail(accessToken, to, subject, body);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
  }
}
