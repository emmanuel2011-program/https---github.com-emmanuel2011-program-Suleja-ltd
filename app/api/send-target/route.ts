import { sendSingleLoanReminder } from '@/app/lib/notification';
import { NextResponse } from 'next/server';

export async function GET() {
  const target = 'vdst2009@gmail.com'; // Your target email
  
  const result = await sendSingleLoanReminder(target);

  if (result.success) {
    return NextResponse.json({ 
      message: `Success! Reminder sent to ${target}`, 
      details: result 
    });
  } else {
    return NextResponse.json({ 
      message: "Failed to send email", 
      reason: result.message 
    }, { status: 404 });
  }
}