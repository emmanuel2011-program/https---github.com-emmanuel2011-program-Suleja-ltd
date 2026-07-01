import postgres from 'postgres';
import { Resend } from 'resend';
import { LoanReminderEmail } from '@/app/ui/emails/loan-reminder'; 

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
const resend = new Resend(process.env.RESEND_API_KEY);

// Add a parameter to accept a specific email
export async function sendSingleLoanReminder(targetEmail: string) {
  try {
    const loan = await sql`
      SELECT 
        email, 
        first_name, 
        loan_amount, 
        interest,      
        request_date,  
        amount_paid,   
        status,
        repayment_date 
      FROM loan_applications 
      WHERE 
        -- 1. Filter specifically by the provided email
        email = ${targetEmail}
        -- 2. Keep safety checks to ensure it's an active, unpaid loan
        AND LOWER(TRIM(status)) = 'approved'
        AND (amount_paid::numeric < loan_amount::numeric)
      LIMIT 1
    `;

    if (loan.length === 0) {
      return { success: false, message: `No active loan found for: ${targetEmail}` };
    }

    const applicant = loan[0];

    // Send the email
    const { data, error } = await resend.emails.send({
      from: 'SulejaHH <info@shhmcsoc.me>',
      to: [applicant.email],
      subject: 'Specific Loan Repayment Update',
      react: LoanReminderEmail({
        firstName: applicant.first_name, 
        loanAmount: applicant.loan_amount,     
        interestRate: applicant.interest,      
        requestDate: applicant.request_date,   
        amountPaid: Number(applicant.amount_paid || 0),
      }),
    });

    return { 
      success: !error, 
      recipient: targetEmail, 
      message: error ? error : "Email sent successfully" 
    };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}