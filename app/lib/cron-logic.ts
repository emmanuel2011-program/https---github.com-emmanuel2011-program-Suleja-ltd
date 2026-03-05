import postgres from 'postgres';
import { Resend } from 'resend';
import { LoanReminderEmail } from '@/app/ui/emails/loan-reminder'; 

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendDailyReminders() {
  try {
    // 1. Fetching approved loans due exactly tomorrow
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

    console.log(`Cron Task: Found ${expiringLoans.length} loans due tomorrow.`);

    const results = [];

    for (const loan of expiringLoans) {
      try {
        // 2. Updated 'from' to your verified domain
        const { data, error } = await resend.emails.send({
          from: 'SulejaHH Cooperative <info@shhmcsoc.me>',
          to: [loan.email],
          subject: 'Reminder: Your Loan Repayment is Due Tomorrow',
          react: LoanReminderEmail({
            firstName: loan.first_name, 
            loanAmount: Number(loan.loan_amount).toLocaleString('en-NG'), 
            repaymentDate: new Date(loan.repayment_date).toDateString(),
          }),
        });

        if (error) {
          console.error(`Resend error for ${loan.email}:`, error);
        }

        results.push({ email: loan.email, success: !error });
      } catch (sendError) {
        console.error(`Failed to send to ${loan.email}:`, sendError);
        results.push({ email: loan.email, success: false });
      }
    }

    return results;

  } catch (dbError) {
    console.error('Database connection error in Cron:', dbError);
    throw dbError; // This will trigger a 500 error in your API route so you know it failed
  }
}