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
      interest,      -- Added: needed for interest math
      request_date,  -- Added: needed for months elapsed
      amount_paid,   -- Added: needed for balance
      repayment_date 
    FROM loan_applications 
    WHERE status = 'approved' 
    AND repayment_date::date = (CURRENT_DATE + INTERVAL '1 day')::date
  `;

  const results = [];

  for (const loan of expiringLoans) {
    try {
      // Send the email using the props the component actually expects
      const { data, error } = await resend.emails.send({
        from: 'SulejaHH <info@shhmcsoc.me>',
        to: [loan.email],
        subject: 'Urgent: Your Loan Repayment is Due Tomorrow',
        react: LoanReminderEmail({
          firstName: loan.first_name, 
          loanAmount: loan.loan_amount,     // Component handles the formatting
          interestRate: loan.interest,      // Component handles the parsing
          requestDate: loan.request_date,   // Component calculates months from this
          amountPaid: Number(loan.amount_paid || 0),
        }),
      });

      results.push({ email: loan.email, success: !error });
    } catch (err) {
      console.error(`Error sending to ${loan.email}:`, err);
    }
  }
  return results;
}