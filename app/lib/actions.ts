'use server';

import React from 'react';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { sql } from '@vercel/postgres';
import { put } from '@vercel/blob';
import { revalidatePath } from 'next/cache';
import { Resend } from 'resend'; 
import { render } from '@react-email/render';

// IMPORT YOUR EMAIL COMPONENTS
import { WelcomeMembershipEmail } from '@/app/ui/emails/welcome-membership';
import { LoanConfirmationEmail } from '@/app/ui/emails/loan-confirmation'; 
import { LoanStatusEmail } from '@/app/ui/emails/loan-status';
import { GuarantorConfirmationEmail } from '@/app/ui/emails/guarantor-confirmation';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * HELPER: Extract months from duration string
 */
const getMonthsFromDuration = (duration: string): number => {
  const months = parseInt(duration);
  return isNaN(months) ? 1 : months;
};

/**
 * HELPER: Generic File Upload to Vercel Blob
 */
async function uploadFile(file: File | null, path: string) {
  if (file && file.size > 0 && file.name !== 'undefined') {
    const blob = await put(`${path}/${Date.now()}-${file.name}`, file, { access: 'public' });
    return blob.url;
  }
  return null;
}

/**
 * ACTION: Create Investment
 */
export async function createInvestment(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    const email = formData.get('email') as string;
    const amountToInvest = parseFloat(formData.get('amountToInvest') as string) || 0;
    const duration = (formData.get('investmentDuration') as string) || '1 Month';
    const accountClass = (formData.get('accountClass') as string) || 'Investment';
    
    const memberResult = await sql`SELECT id FROM memberships WHERE email = ${email} LIMIT 1`;
    if (memberResult.rows.length === 0) {
      return { success: false, message: 'No member account found with this email.' };
    }
    const memberId = memberResult.rows[0].id;

    const receiptUrl = await uploadFile(formData.get('paymentReceipt') as File, 'receipts');
    if (!receiptUrl) {
      return { success: false, message: 'Payment receipt is required.' };
    }

    const months = getMonthsFromDuration(duration);
    const totalInterest = amountToInvest * 0.07 * months;

    await sql`
      INSERT INTO investments (
        member_id, member_email, amount, monthly_interest, 
        bank_name, account_number, account_name, receipt_url, status,
        contract_accepted, duration, account_class
      )
      VALUES (
        ${memberId}, ${email}, ${amountToInvest}, ${totalInterest}, 
        ${formData.get('bankName') as string}, 
        ${formData.get('accountNumber') as string},
        ${formData.get('accountName') as string},
        ${receiptUrl}, 'pending',
        ${formData.get('contractNotice') === 'on'},
        ${duration}, 
        ${accountClass}
      )
    `;

    revalidatePath('/dashboard/investments');
    return { success: true, message: 'Investment successfully recorded!' };
  } catch (error: any) {
    return { success: false, message: 'Database Error: ' + error.message };
  }
}

/**
 * ACTION: Create Membership
 */
export async function createMembership(formData: FormData) {
  try {
    const firstName = formData.get('firstName') as string;
    const surname = formData.get('surname') as string;
    const email = formData.get('email') as string;
    const tin = formData.get('tin') as string || 'N/A';

    const passportUrl = await uploadFile(formData.get('passportFile') as File, 'passports');
    const idCardUrl = await uploadFile(formData.get('idCardFile') as File, 'ids');

    await sql`
      INSERT INTO memberships (
        title, surname, first_name, middle_name, date_of_birth, 
        gender, nationality, email, tin, mobile_phone, residential_address, 
        passport_url, id_card_url
      )
      VALUES (
        ${formData.get('title') as string || 'Mr/Ms'}, 
        ${surname}, ${firstName}, 
        ${formData.get('middleName') as string || null}, 
        ${formData.get('dateOfBirth') as string}, 
        ${formData.get('gender') as string || 'Not Specified'},
        ${formData.get('nationality') as string || 'Nigerian'}, 
        ${email}, 
        ${tin},
        ${formData.get('mobilePhone') as string}, 
        ${formData.get('residentialAddress') as string}, 
        ${passportUrl}, ${idCardUrl}
      )
    `;
    
    try {
      const emailHtml = await render(
        React.createElement(WelcomeMembershipEmail, { firstName, surname })
      );
      await resend.emails.send({
        from: 'SHHMCSOC Support <noreply@shhmcsoc.me>',
        to: [email],
        subject: 'Welcome to the Cooperative - SHHMCSOC',
        html: emailHtml,
      });
    } catch (e) { console.error("Welcome email failed:", e); }

    revalidatePath('/dashboard/memberships');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: 'Database Error: ' + error.message };
  }
}

/**
 * ACTION: Create Loan Application
 */
/**
 * ACTION: Create Loan Application
 */
export async function createLoan(prevState: any, formData: FormData) {
  try {
    const email = formData.get('email') as string;
    const surname = formData.get('surname') as string;
    const firstName = formData.get('firstName') as string;
    const tin = formData.get('tin') as string || 'N/A'; 
    
    const loanAmount = parseFloat(formData.get('loanAmount') as string) || 0;
    const duration = (formData.get('duration') as string) || '1 Month';
    const guarantorEmail = formData.get('guarantorEmail') as string;
    const guarantorName = formData.get('guarantorName') as string;
    const guarantorOccupation = formData.get('guarantorOccupation') as string;

    // Check if this specific submission is intended to be a Guarantor addition
    // We check if the form actually contains guarantor fields.
    const isGuarantorSubmission = formData.has('guarantorName') && formData.get('guarantorName') !== '';

    if (isGuarantorSubmission) {
      // --- GUARANTOR SUBMISSION ---
      const existingLoan = await sql`SELECT id FROM loan_applications WHERE email = ${email} ORDER BY request_date DESC LIMIT 1`;
      
      if (existingLoan.rows.length === 0) {
        return { success: false, message: 'No active loan application found to attach a guarantor to.' };
      }

      const loanId = existingLoan.rows[0].id;
      const gPassportUrl = await uploadFile(formData.get('guarantorPassportFile') as File, 'guarantor_passports');
      const gIdUrl = await uploadFile(formData.get('guarantorIdFile') as File, 'guarantor_ids');

      await sql`
        INSERT INTO loan_guarantors (
          loan_id, guarantor_name, guarantor_email, guarantor_phone, 
          guarantor_relationship, guarantor_workplace, guarantor_occupation,
          residential_address, passport_url, id_card_url
        )
        VALUES (
          ${loanId}, ${guarantorName}, ${guarantorEmail},
          ${formData.get('guarantorPhone') as string},
          ${formData.get('guarantorRelationship') as string},
          ${formData.get('guarantorWorkplace') as string},
          ${guarantorOccupation},
          ${formData.get('residentialAddress') as string},
          ${gPassportUrl}, ${gIdUrl}
        )
      `;
    } else {
      // --- INITIAL APPLICANT SUBMISSION (Includes Spouse Info) ---
      const passportUrl = await uploadFile(formData.get('passportFile') as File, 'passports');
      const idCardUrl = await uploadFile(formData.get('idCardFile') as File, 'ids');
      
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 30);
      const repaymentDate = formData.get('repaymentDate') as string || defaultDate.toISOString().split('T')[0];

      const existingMember = await sql`SELECT id FROM memberships WHERE email = ${email} LIMIT 1`;
      let memberId = existingMember.rows[0]?.id;
      
      if (!memberId) {
        const newMember = await sql`
          INSERT INTO memberships (surname, first_name, email, tin, mobile_phone, residential_address, date_of_birth, gender, nationality)
          VALUES (${surname}, ${firstName}, ${email}, ${tin}, ${formData.get('mobilePhone') as string}, ${formData.get('residentialAddress') as string}, ${formData.get('dateOfBirth') as string}, ${formData.get('gender') as string}, ${formData.get('nationality') as string})
          RETURNING id
        `;
        memberId = newMember.rows[0].id;
      }

      await sql`
        INSERT INTO loan_applications (
          member_id, title, surname, first_name, middle_name, email, tin, mobile_phone, 
          loan_amount, duration, interest, bank_name, account_number, account_name, 
          account_type, purpose_of_loan, repayment_date, passport_url, id_card_url, 
          status, request_date, residential_address, date_of_birth, gender, nationality,
          spouse_title, spouse_name, spouse_phone, spouse_dob, spouse_gender, 
          spouse_nationality, spouse_state, spouse_lga, spouse_address
        )
        VALUES (
          ${memberId}, ${surname}, ${firstName}, ${formData.get('middleName') as string || null}, ${email}, ${tin}, ${formData.get('mobilePhone') as string},
          ${loanAmount}, ${duration}, ${formData.get('interest') as string || '15%'}, 
          ${formData.get('bankName') as string || 'N/A'}, 
          ${formData.get('accountNumber') as string || '0000000000'}, 
          ${formData.get('accountName') as string || (firstName + ' ' + surname)}, 
          ${formData.get('accountType') as string || 'Savings'},
          ${formData.get('purposeOfLoan') as string || 'General'}, 
          ${repaymentDate}, 
          ${passportUrl}, ${idCardUrl}, 'pending', CURRENT_DATE, 
          ${formData.get('residentialAddress') as string},
          ${formData.get('dateOfBirth') as string}, ${formData.get('gender') as string},
          ${formData.get('nationality') as string},
          ${formData.get('spouseTitle') as string || null}, ${formData.get('spouseName') as string || null},
          ${formData.get('spousePhone') as string || null}, ${formData.get('spouseDOB') as string || null},
          ${formData.get('spouseGender') as string || null}, ${formData.get('spouseNationality') as string || null},
          ${formData.get('spouseState') as string || null}, ${formData.get('spouseLGA') as string || null},
          ${formData.get('spouseAddress') as string || null}
        )
      `;

      try {
        const appHtml = await render(React.createElement(LoanConfirmationEmail, { firstName, loanAmount: loanAmount.toLocaleString('en-NG'), duration }));
        await resend.emails.send({ from: 'SHHMCSOC Support <noreply@shhmcsoc.me>', to: [email], subject: 'Application Received - SHHMCSOC', html: appHtml });
      } catch (e) { console.error("App email fail:", e); }
    }

    // Only send the Guarantor Email if it was a Guarantor Submission
    if (isGuarantorSubmission && guarantorEmail && guarantorEmail.includes('@')) {
      try {
        const guarantorHtml = await render(React.createElement(GuarantorConfirmationEmail, {
          guarantorName: guarantorName || 'Guarantor',
          applicantName: `${firstName} ${surname}`,
          loanAmount: loanAmount,
        }));
        await resend.emails.send({
          from: 'SHHMCSOC Support <noreply@shhmcsoc.me>',
          to: [guarantorEmail],
          subject: 'Guarantor Acknowledgment - SHHMCSOC',
          html: guarantorHtml,
        });
      } catch (e) { console.error("Guarantor email fail:", e); }
    }

    revalidatePath('/dashboard/loans');
    revalidatePath('/dashboard/active-loans');
    revalidatePath('/dashboard/guarantors');
    return { success: true, message: 'Loan processed successfully!' };
  } catch (error: any) {
    console.error('Loan error:', error);
    return { success: false, message: `System Error: ${error.message}` };
  }
}
/**
 * ACTION: Update Loan Status
 */
export async function updateLoanStatus(loanId: string, status: 'active' | 'rejected' | 'pending' | 'approved') {
  try {
    await sql`UPDATE loan_applications SET status = ${status} WHERE id = ${loanId}`;
    const loanResult = await sql`SELECT first_name, email, loan_amount, repayment_date, interest FROM loan_applications WHERE id = ${loanId} LIMIT 1`;

    if (loanResult.rows.length > 0) {
      const loan = loanResult.rows[0] as any;
      const principal = parseFloat(loan.loan_amount || '0');
      const interestRate = parseFloat(String(loan.interest || '15%').replace('%', '')) / 100;
      const calculatedInterestAmount = principal * interestRate; 
      const totalRepayment = principal + calculatedInterestAmount;

      try {
        const emailHtml = await render(React.createElement(LoanStatusEmail, {
          firstName: loan.first_name,
          status: status,
          amount: principal,
          interestAmount: calculatedInterestAmount, 
          totalRepayment: totalRepayment,
          repaymentDate: loan.repayment_date ? new Date(loan.repayment_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'
        }));
        await resend.emails.send({ from: 'SHHMCSOC Support <noreply@shhmcsoc.me>', to: [loan.email], subject: `Loan Application ${status.toUpperCase()} - SHHMCSOC`, html: emailHtml });
      } catch (e) { console.error("Status email fail:", e); }
    }

    revalidatePath('/dashboard/loans');
    revalidatePath('/dashboard/guarantors');
    return { success: true, message: `Loan ${status} successfully.` };
  } catch (error: any) {
    return { success: false, message: 'Failed to update loan status.' };
  }
}

export async function fetchActiveLoans(query?: string) {
  try {
    const data = await sql`
      SELECT 
        id, first_name, surname, email, loan_amount, interest, 
        repayment_date, tin, status,
        COALESCE(amount_paid, 0) AS amount_paid, 
        last_payment_date
      FROM loan_applications 
      WHERE (status ILIKE 'active' OR status ILIKE 'pending' OR status ILIKE 'approved')
      AND (
        tin ILIKE ${'%' + query + '%'} OR 
        first_name ILIKE ${'%' + query + '%'} OR 
        surname ILIKE ${'%' + query + '%'}
      )
      ORDER BY request_date DESC
    `;
    return data.rows;
  } catch (error) {
    console.error('Detailed Database Error:', error); 
    return [];
  }
}

export async function updateLoanPayment(id: string, newPayment: number) {
  try {
    await sql`
      UPDATE loan_applications
      SET 
        amount_paid = COALESCE(amount_paid, 0) + ${newPayment},
        last_payment_date = NOW()
      WHERE id = ${id}
    `;
    revalidatePath('/dashboard/active-loans'); 
    return { success: true };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false };
  }
}

export async function fetchGuarantors(query: string = '') {
  try {
    const data = await sql`
      SELECT 
        g.id, g.guarantor_name, g.guarantor_phone, g.guarantor_relationship, 
        g.passport_url as guarantor_passport_url, g.id_card_url as guarantor_id_url, 
        g.created_at as request_date, g.status, l.first_name, l.surname, l.loan_amount 
      FROM loan_guarantors g
      JOIN loan_applications l ON g.loan_id = l.id
      WHERE 
        -- THIS IS THE FILTER:
        (g.status IS NULL OR g.status != 'verified') 
        AND (g.guarantor_name ILIKE ${'%' + query + '%'} OR l.first_name ILIKE ${'%' + query + '%'}) 
      ORDER BY g.created_at DESC
    `;
    return data.rows;
  } catch (error) { 
    console.error('Fetch Guarantors Error:', error);
    return []; 
  }
}

export async function verifyGuarantorAction(guarantorId: string) {
  try {
    await sql`UPDATE loan_guarantors SET status = 'verified' WHERE id = ${guarantorId}`;
    revalidatePath('/dashboard/guarantors'); 
    return { success: true };
  } catch (error) {
    console.error('Failed to verify guarantor:', error);
    return { success: false };
  }
}

export async function getPendingCount(): Promise<number> {
  try {
    const data = await sql`SELECT COUNT(*) FROM loan_applications WHERE status = 'pending'`;
    return Number(data.rows[0].count) || 0;
  } catch (error) { return 0; }
}

export async function getPendingLoansAction() {
  const data = await sql`SELECT * FROM loan_applications WHERE status = 'pending' ORDER BY request_date DESC`;
  return data.rows;
}

export async function getTodaysLoans() {
  try {
    const data = await sql`SELECT * FROM loan_applications WHERE request_date = CURRENT_DATE ORDER BY request_date DESC`;
    return data.rows;
  } catch (error) { return []; }
}

export async function fetchInvestments() {
  const data = await sql`
    SELECT i.*, m.first_name, m.surname FROM investments i 
    JOIN memberships m ON i.member_id = m.id ORDER BY i.created_at DESC`;
  return data.rows;
}

export async function approveInvestment(investmentId: string) {
  await sql`UPDATE investments SET status = 'active' WHERE id = ${investmentId}`;
  revalidatePath('/dashboard/investments');
  return { success: true };
}

export async function authenticate(prevState: string | undefined, formData: FormData) {
  try { await signIn('credentials', formData); } 
  catch (error) {
    if (error instanceof AuthError) {
      return error.type === 'CredentialsSignin' ? 'Invalid credentials.' : 'Something went wrong.';
    }
    throw error;
  }
}