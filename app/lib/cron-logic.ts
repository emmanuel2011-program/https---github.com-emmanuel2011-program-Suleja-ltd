import postgres from 'postgres';
import { Resend } from 'resend';
import { LoanReminderEmail } from '@/app/ui/emails/loan-reminder'; 

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
const resend = new Resend(process.env.RESEND_API_KEY);

// Helper to prevent Rate Limiting (429 errors)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function sendDailyReminders() {
  try {
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
        const { data, error } = await resend.emails.send({
          from: 'SulejaHH Cooperative <info@shhmcsoc.me>',
          to: [loan.email],
          subject: 'Reminder: Your Loan Repayment is Due Tomorrow',
          react: LoanReminderEmail({
            firstName: loan.first_name, 
            loanAmount: Number(loan.loan_amount).toLocaleString('en-NG'), 
            // Ensures the date stays accurate to the DB entry
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

        // --- THE FIX: RATE LIMIT PROTECTION ---
        // Wait 600ms between each email to stay under 2 requests/second
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