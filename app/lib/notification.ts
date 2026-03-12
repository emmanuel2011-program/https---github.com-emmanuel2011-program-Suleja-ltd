import postgres from 'postgres';
import { Resend } from 'resend';
import { LoanReminderEmail } from '@/app/ui/emails/loan-reminder'; 

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
const resend = new Resend(process.env.RESEND_API_KEY);

export async function checkAndSendReminders() {
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
      // 1. Fix the Date Jump (Force UTC so it stays on the 10th)
      const formattedDate = new Date(loan.repayment_date).toLocaleDateString('en-NG', {
        timeZone: 'UTC', 
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

      // 2. Fix the Currency (Ensure Naira formatting)
      const formattedAmount = new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
      }).format(loan.loan_amount / 100); // Divided by 100 if stored in kobo

      const { data, error } = await resend.emails.send({
        from: 'SulejaHH <onboarding@resend.dev>',
        to: [loan.email],
        subject: 'Urgent: Your Loan Repayment is Due Tomorrow',
        react: LoanReminderEmail({
          firstName: loan.first_name, 
          loanAmount: formattedAmount, 
          repaymentDate: formattedDate,
        }),
      });

      results.push({ email: loan.email, success: !error });
    } catch (err) {
      console.error(`Error sending to ${loan.email}:`, err);
    }
  }
  return results;
}