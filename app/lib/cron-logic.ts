import postgres from 'postgres';
import { Resend } from 'resend';
import { LoanReminderEmail } from '@/app/ui/emails/loan-reminder'; 

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
const resend = new Resend(process.env.RESEND_API_KEY);

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function sendDailyReminders() {
  try {
    // 1. FETCH TARGETED LOANS: 
    // Filters for people due on the 16th or 17th of any month
    const targetLoans = await sql`
      SELECT 
        email, 
        first_name, 
        loan_amount, 
        interest,
        request_date,
        amount_paid,
        repayment_date 
      FROM loan_applications 
      WHERE 
        -- Matches 'approved' or 'Approved' status
        LOWER(TRIM(status)) = 'approved' 
        
        -- Filter by day of the month (16th and 17th)
        AND EXTRACT(DAY FROM repayment_date) IN (16, 17)
        
        -- Only those who still owe money
        AND (amount_paid::numeric < loan_amount::numeric)
    `;

    console.log(`Cron: Found ${targetLoans.length} loans due on the 16th/17th.`);

    const results = [];

    for (const loan of targetLoans) {
      try {
        // 2. MATH LOGIC: Calculate Months Elapsed
        const requestDateObj = new Date(loan.request_date);
        const today = new Date();
        const diffTime = Math.max(0, today.getTime() - requestDateObj.getTime());
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        
        // Ceil ensures if it's month 5.1, it shows as Month 6
        const monthsElapsed = Math.ceil(diffDays / 30) || 1;

        // 3. SEND EMAIL via Resend
        const { data, error } = await resend.emails.send({
          from: 'SulejaHH Cooperative <info@shhmcsoc.me>',
          to: [loan.email],
          subject: `Loan Repayment Update: ${loan.first_name} (Month ${monthsElapsed})`,
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
          console.log(`Successfully sent reminder to ${loan.email}`);
          results.push({ email: loan.email, success: true });
        }

        // Anti-spam delay
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