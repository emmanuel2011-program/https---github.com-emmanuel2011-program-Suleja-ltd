import postgres from 'postgres';
import { Resend } from 'resend';
import { LoanReminderEmail } from '@/app/ui/emails/loan-reminder'; 

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
const resend = new Resend(process.env.RESEND_API_KEY);

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function sendDailyReminders() {
  try {
    // 1. UPDATED QUERY: 
    // Targets loans where the repayment_date is EXACTLY tomorrow.
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
      WHERE id = '1ffaa285-d598-43e3-89c6-30c4a3bd0f06'
      -- Logic: Send if (Today + 1 Day) matches the Repayment Date
      AND repayment_date::date = (CURRENT_DATE + INTERVAL '1 day')::date
      AND (amount_paid::numeric < loan_amount::numeric)
    `;

    console.log(`Cron Task: Found ${overdueLoans.length} loans due tomorrow.`);

    const results = [];

    for (const loan of overdueLoans) {
      try {
        // 2. DYNAMIC DATE LOGIC:
        // Calculation based on the user-entered start date (request_date)
        const startDate = new Date(loan.request_date);
        const today = new Date();
        
        const diffTime = Math.max(0, today.getTime() - startDate.getTime());
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        
        // Month calculation for the email content
        const monthsElapsed = Math.ceil(diffDays / 30) || 1;

        // 3. SEND EMAIL
        const { data, error } = await resend.emails.send({
          from: 'SulejaHH Cooperative <info@shhmcsoc.me>',
          to: [loan.email],
          subject: `Reminder: Your Loan Repayment is due tomorrow (Month ${monthsElapsed})`,
          react: LoanReminderEmail({
            firstName: loan.first_name, 
            loanAmount: Number(loan.loan_amount),
            interestRate: loan.interest || '15%',
            requestDate: loan.request_date,
            amountPaid: Number(loan.amount_paid || 0),
          }),
        });

        if (error) {
          console.error(`Resend error for ${loan.email}:`, error);
          results.push({ email: loan.email, success: false, error });
        } else {
          console.log(`Pre-expiry reminder sent to ${loan.email}`);
          results.push({ email: loan.email, success: true });
        }

        await delay(600);

      } catch (sendError: any) {
        console.error(`Failed to process ${loan.email}:`, sendError.message);
        results.push({ email: loan.email, success: false });
      }
    }

    return results;

  } catch (dbError) {
    console.error('Database connection error in Cron:', dbError);
    throw dbError; 
  }
}