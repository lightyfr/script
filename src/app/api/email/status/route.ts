import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserGmailToken } from '@/lib/gmail';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ isConnected: false }, { status: 401 });
    }
    try {
      await getUserGmailToken(userId);
      return NextResponse.json({ isConnected: true });
    } catch {
      return NextResponse.json({ isConnected: false });
    }
  } catch (error) {
    return NextResponse.json({ isConnected: false }, { status: 500 });
  }
}
