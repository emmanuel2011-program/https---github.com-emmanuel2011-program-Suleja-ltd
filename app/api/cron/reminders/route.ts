import { sendDailyReminders } from '@/app/lib/cron-logic';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Only allow Vercel or you to trigger this
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const report = await sendDailyReminders();
  return NextResponse.json({ processed: report.length, details: report });
}