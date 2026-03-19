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

    const passportUrl = await uploadFile(formData.get('passportFile') as File, 'passports');
    const idCardUrl = await uploadFile(formData.get('idCardFile') as File, 'ids');

    const membershipResult = await sql`
      INSERT INTO memberships (
        title, surname, first_name, middle_name, date_of_birth, 
        gender, nationality, email, mobile_phone, residential_address, 
        tin, passport_url, id_card_url,
        spouse_name, spouse_phone, spouse_dob, spouse_gender,
        spouse_nationality, spouse_state, spouse_lga, spouse_address, spouse_title
      )
      VALUES (
        ${formData.get('title') as string || 'Mr/Ms'}, 
        ${surname}, 
        ${firstName}, 
        ${formData.get('middleName') as string || null}, 
        ${formData.get('dateOfBirth') as string}, 
        ${formData.get('gender') as string || 'Not Specified'},
        ${formData.get('nationality') as string || 'Nigerian'}, 
        ${email}, 
        ${formData.get('mobilePhone') as string}, 
        ${formData.get('residentialAddress') as string}, 
        ${formData.get('tin') as string || null},
        ${passportUrl},
        ${idCardUrl},
        ${formData.get('spouseName') as string || null},
        ${formData.get('spousePhone') as string || null},
        ${formData.get('spouseDOB') as string || null},
        ${formData.get('spouseGender') as string || null},
        ${formData.get('spouseNationality') as string || null},
        ${formData.get('spouseState') as string || null},
        ${formData.get('spouseLGA') as string || null},
        ${formData.get('spouseAddress') as string || null},
        ${formData.get('spouseTitle') as string || null}
      )
      RETURNING id
    `;

    // SEND WELCOME EMAIL
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

    const memberId = membershipResult.rows[0].id;
    const amountStr = formData.get('amountToInvest');

    if (amountStr && parseFloat(amountStr.toString()) > 0) {
      const amount = parseFloat(amountStr.toString());
      const duration = (formData.get('duration') as string) || '1 Month (Renewable)';
      const months = getMonthsFromDuration(duration);
      const totalInterest = amount * 0.07 * months;
      const receiptUrl = await uploadFile(formData.get('paymentReceipt') as File, 'receipts');

      await sql`
        INSERT INTO investments (
          member_id, member_email, amount, monthly_interest, 
          bank_name, account_number, account_name, receipt_url, status,
          contract_accepted, duration, account_class
        )
        VALUES (
          ${memberId}, ${email}, ${amount}, ${totalInterest}, 
          ${formData.get('bankName') as string}, 
          ${formData.get('accountNumber') as string},
          ${formData.get('accountName') as string},
          ${receiptUrl}, 'pending',
          ${formData.get('contractNotice') === 'on'},
          ${duration}, 
          ${formData.get('accountClass') as string || 'Investment'}
        )
      `;
    }

    revalidatePath('/dashboard/memberships');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: 'Database Error: ' + error.message };
  }
}

/**
 * ACTION: Create Loan Application
 */
export async function createLoan(prevState: any, formData: FormData) {
  try {
    const email = formData.get('email') as string;
    const surname = formData.get('surname') as string;
    const firstName = formData.get('firstName') as string;
    const loanAmount = parseFloat(formData.get('loanAmount') as string) || 0;
    const duration = (formData.get('duration') as string) || '1 Month';

    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);
    const repaymentDate = formData.get('repaymentDate') as string || defaultDate.toISOString().split('T')[0];

    const passportUrl = await uploadFile(formData.get('passportFile') as File, 'passports');
    const idCardUrl = await uploadFile(formData.get('idCardFile') as File, 'ids');
    const gPassportUrl = await uploadFile(formData.get('guarantorPassportFile') as File, 'guarantor_passports');
    const gIdUrl = await uploadFile(formData.get('guarantorIdFile') as File, 'guarantor_ids');

    const existingMember = await sql`SELECT id FROM memberships WHERE email = ${email} LIMIT 1`;
    let memberId = existingMember.rows[0]?.id;
    
    if (!memberId) {
      const newMember = await sql`
        INSERT INTO memberships (surname, first_name, email, mobile_phone, residential_address, date_of_birth, gender, nationality)
        VALUES (
          ${surname}, ${firstName}, ${email}, 
          ${formData.get('mobilePhone') as string}, 
          ${formData.get('residentialAddress') as string}, 
          ${formData.get('dateOfBirth') as string}, 
          ${formData.get('gender') as string}, 
          ${formData.get('nationality') as string}
        )
        RETURNING id
      `;
      memberId = newMember.rows[0].id;
    }

    await sql`
      INSERT INTO loan_applications (
        member_id, surname, first_name, middle_name, email, mobile_phone, loan_amount, duration, interest, 
        bank_name, account_number, account_name, account_type, purpose_of_loan, repayment_date,
        passport_url, id_card_url, status, request_date, residential_address,
        date_of_birth, gender, nationality,
        guarantor_name, guarantor_phone, guarantor_relationship, guarantor_workplace,
        guarantor_passport_url, guarantor_id_url,
        spouse_title, spouse_name, spouse_phone, spouse_dob, 
        spouse_gender, spouse_nationality, spouse_state, spouse_lga, spouse_address
      )
      VALUES (
        ${memberId}, ${surname}, ${firstName}, ${formData.get('middleName') as string || null}, ${email}, ${formData.get('mobilePhone') as string},
        ${loanAmount}, ${duration}, ${formData.get('interest') as string || '15%'}, 
        ${formData.get('bankName') as string || 'N/A'}, 
        ${formData.get('accountNumber') as string || '0000000000'}, 
        ${formData.get('accountName') as string || (firstName + ' ' + surname)}, 
        ${formData.get('accountType') as string || 'Savings'},
        ${formData.get('purposeOfLoan') as string || 'General'}, 
        ${repaymentDate}, 
        ${passportUrl}, ${idCardUrl}, 'pending', 
        CURRENT_DATE, 
        ${formData.get('residentialAddress') as string},
        ${formData.get('dateOfBirth') as string}, 
        ${formData.get('gender') as string},
        ${formData.get('nationality') as string},
        ${formData.get('guarantorName') as string || 'N/A'}, 
        ${formData.get('guarantorPhone') as string || 'N/A'}, 
        ${formData.get('guarantorRelationship') as string || 'N/A'},
        ${formData.get('guarantorWorkplace') as string || 'N/A'},
        ${gPassportUrl}, ${gIdUrl},
        ${formData.get('spouseTitle') as string || null},
        ${formData.get('spouseName') as string || null},
        ${formData.get('spousePhone') as string || null},
        ${formData.get('spouseDOB') as string || null},
        ${formData.get('spouseGender') as string || null},
        ${formData.get('spouseNationality') as string || null},
        ${formData.get('spouseState') as string || null},
        ${formData.get('spouseLGA') as string || null},
        ${formData.get('spouseAddress') as string || null}
      )
    `;

    // SEND LOAN CONFIRMATION EMAIL
    try {
      const emailHtml = await render(
        React.createElement(LoanConfirmationEmail, {
          firstName,
          loanAmount: loanAmount.toLocaleString('en-NG'),
          duration
        })
      );
      await resend.emails.send({
        from: 'SHHMCSOC Support <noreply@shhmcsoc.me>',
        to: [email],
        subject: 'Application Received - SHHMCSOC',
        html: emailHtml,
      });
    } catch (e) { console.error("Loan confirmation email failed:", e); }

    revalidatePath('/dashboard/loans');
    revalidatePath('/dashboard/guarantors');
    return { success: true, message: 'Loan submitted successfully!' };
  } catch (error: any) {
    console.error('Loan error:', error);
    return { success: false, message: `System Error: ${error.message}` };
  }
}

/**
 * ACTION: Update Loan Status (FETCH DATA BEFORE SENDING EMAIL)
 */
export async function updateLoanStatus(
  loanId: string, 
  status: 'active' | 'rejected' | 'pending' | 'approved'
) {
  try {
    // 1. Update the status in the database
    await sql`UPDATE loan_applications SET status = ${status} WHERE id = ${loanId}`;

    // 2. Fetch loan details
    const loanResult = await sql`
      SELECT first_name, email, loan_amount, repayment_date, interest 
      FROM loan_applications 
      WHERE id = ${loanId} 
      LIMIT 1
    `;

    if (loanResult.rows.length > 0) {
      const loan = loanResult.rows[0] as any;
      
      const principal = parseFloat(loan.loan_amount || '0');
      const interestRaw = String(loan.interest || '15%');
      
      // Convert "15%" string to 0.15 number
      const interestRate = parseFloat(interestRaw.replace('%', '')) / 100;
      
      // Calculate the dollar/naira amount of interest
      const calculatedInterestAmount = principal * interestRate; 
      const totalRepayment = principal + calculatedInterestAmount;

      try {
        const emailHtml = await render(
          React.createElement(LoanStatusEmail, {
            firstName: loan.first_name,
            status: status,
            amount: principal,
            // PASS THE CALCULATED NUMBER HERE
            interestAmount: calculatedInterestAmount, 
            totalRepayment: totalRepayment,
            repaymentDate: loan.repayment_date ? new Date(loan.repayment_date).toLocaleDateString('en-NG', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }) : 'N/A'
          })
        );

        await resend.emails.send({
          from: 'SHHMCSOC Support <noreply@shhmcsoc.me>',
          to: [loan.email],
          subject: `Loan Application ${status.toUpperCase()} - SHHMCSOC`,
          html: emailHtml,
        });
      } catch (e) { console.error("Status email failed:", e); }
    }

    revalidatePath('/dashboard/loans');
    revalidatePath('/dashboard/guarantors');
    return { success: true, message: `Loan ${status} successfully.` };
  } catch (error: any) {
    return { success: false, message: 'Failed to update loan status.' };
  }
}

/**
 * ADMIN FETCHERS
 */
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

export async function fetchGuarantors(query: string = '') {
  try {
    const data = await sql`
      SELECT id, first_name, surname, guarantor_name, guarantor_phone, 
             guarantor_relationship, guarantor_passport_url, guarantor_id_url, request_date
      FROM loan_applications
      WHERE (guarantor_name ILIKE ${'%' + query + '%'} OR first_name ILIKE ${'%' + query + '%'}) 
      AND guarantor_name IS NOT NULL
      AND status = 'pending'
      ORDER BY request_date DESC
    `;
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