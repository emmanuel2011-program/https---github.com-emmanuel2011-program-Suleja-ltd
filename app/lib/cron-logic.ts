import postgres from 'postgres';
import { Resend } from 'resend';
import { LoanReminderEmail } from '@/app/ui/emails/loan-reminder'; 

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
const resend = new Resend(process.env.RESEND_API_KEY);

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function sendDailyReminders() {
  try {
    // 1. UPDATED QUERY: Fetch interest, request_date, and amount_paid
    const overdueLoans = await sql`
      SELECT 
        email, 
        first_name, 
        loan_amount, 
        interest,
        request_date,
        amount_paid,
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
        // 2. MATH LOGIC: Calculate Months Elapsed (Matching your Dashboard Table)
        const requestDateObj = new Date(loan.request_date);
        const today = new Date();
        const diffTime = Math.max(0, today.getTime() - requestDateObj.getTime());
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        const monthsElapsed = Math.ceil(diffDays / 30) || 1;

        // 3. SEND EMAIL: Passing all necessary accurate data
        const { data, error } = await resend.emails.send({
          from: 'SulejaHH Cooperative <info@shhmcsoc.me>',
          to: [loan.email],
          subject: `IMPORTANT: Your Loan Repayment is Overdue (Month ${monthsElapsed})`,
          react: LoanReminderEmail({
            firstName: loan.first_name, 
            loanAmount: Number(loan.loan_amount), // Pass as number for component math
            interestRate: loan.interest || '15%', // Pass as string (e.g., "15%")
            requestDate: loan.request_date,       // Pass for time calculation
            amountPaid: Number(loan.amount_paid || 0), // Include paid amount
          }),
        });

        if (error) {
          console.error(`Resend error for ${loan.email}:`, error);
          results.push({ email: loan.email, success: false, error });
        } else {
          results.push({ email: loan.email, success: true });
        }

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