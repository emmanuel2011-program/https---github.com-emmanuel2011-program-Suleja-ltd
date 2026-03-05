import postgres from 'postgres';
import { Resend } from 'resend';
// Updated path to point to your UI emails folder
import { LoanReminderEmail } from '@/app/ui/emails/loan-reminder'; 

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendDailyReminders() {
  // 1. Fetching from loan_applications using repayment_date
  const expiringLoans = await sql`
    SELECT 
      email, 
      first_name, 
      loan_amount, 
      repayment_date 
    FROM loan_applications 
    WHERE status = 'approved' 
    AND repayment_date::date = (CURRENT_DATE + INTERVAL '1 day')::date
  `;

  const results = [];

  for (const loan of expiringLoans) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'SulejaHH <onboarding@resend.dev>',
        to: [loan.email],
        subject: 'Urgent: Your Loan Repayment is Due Tomorrow',
        react: LoanReminderEmail({
          firstName: loan.first_name, 
          loanAmount: Number(loan.loan_amount).toLocaleString('en-NG'), 
          repaymentDate: new Date(loan.repayment_date).toDateString(),
        }),
      });

      results.push({ email: loan.email, success: !error });
    } catch (sendError) {
      console.error(`Failed to send to ${loan.email}:`, sendError);
      results.push({ email: loan.email, success: false });
    }
  }

  return results;
}