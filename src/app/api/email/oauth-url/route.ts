import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/gmail';

export async function GET() {
  try {
    const url = getAuthUrl();
    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate OAuth URL' }, { status: 500 });
  }
}
