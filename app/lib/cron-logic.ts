import postgres from 'postgres';
import { Resend } from 'resend';
import { LoanReminderEmail } from '@/app/ui/emails/loan-reminder'; 

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
const resend = new Resend(process.env.RESEND_API_KEY);

// Helper to prevent Rate Limiting (429 errors)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function sendDailyReminders() {
  try {
    // UPDATED: Targets loans where the repayment_date was between 1 and 6 days ago
    const overdueLoans = await sql`
      SELECT 
        email, 
        first_name, 
        loan_amount, 
        repayment_date 
      FROM loan_applications 
      WHERE status = 'active' 
      AND repayment_date::date BETWEEN 
        (CURRENT_DATE - INTERVAL '6 days')::date 
        AND 
        (CURRENT_DATE - INTERVAL '1 day')::date
    `;

    console.log(`Cron Task: Found ${overdueLoans.length} loans between 1-6 days overdue.`);

    const results = [];

    for (const loan of overdueLoans) {
      try {
        const { data, error } = await resend.emails.send({
          from: 'SulejaHH Cooperative <info@shhmcsoc.me>',
          to: [loan.email],
          // UPDATED: Subject line changed to reflect overdue status
          subject: 'IMPORTANT: Your Loan Repayment is Overdue',
          react: LoanReminderEmail({
            firstName: loan.first_name, 
            loanAmount: Number(loan.loan_amount).toLocaleString('en-NG'), 
            repaymentDate: new Date(loan.repayment_date).toLocaleDateString('en-GB', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }),
          }),
        });

        if (error) {
          console.error(`Resend error for ${loan.email}:`, error);
          results.push({ email: loan.email, success: false, error });
        } else {
          results.push({ email: loan.email, success: true });
        }

        // Rate limit protection: 600ms delay
        await delay(600);

      } catch (sendError) {
        console.error(`Failed to send to ${loan.email}:`, sendError);
        results.push({ email: loan.email, success: false });
      }
    }

    return results;

  } catch (dbError) {
    console.error('Database connection error in Cron:', dbError);
    throw dbError; 
  }
}