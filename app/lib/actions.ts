'use server';

import React from 'react';
import { signIn, auth } from '@/auth';
import { AuthError } from 'next-auth';
import { sql } from '@vercel/postgres';
import bcrypt from 'bcrypt';
import { put } from '@vercel/blob';
import { revalidatePath } from 'next/cache';
import { Resend } from 'resend'; 
import { render } from '@react-email/render';
import { redirect } from 'next/navigation';

// Email Components
import { WelcomeMembershipEmail } from '@/app/ui/emails/welcome-membership';
import { LoanConfirmationEmail } from '@/app/ui/emails/loan-confirmation'; 
import { LoanStatusEmail } from '@/app/ui/emails/loan-status';
import { GuarantorConfirmationEmail } from '@/app/ui/emails/guarantor-confirmation';
import { InvestmentConfirmationEmail } from '@/app/ui/emails/investment-confirmation';

// Helper to get the current user and determine if they are an admin
async function getSessionInfo() {
  const session = await auth();
  if (!session?.user?.email) return null;

  // Define your admin email here
  const adminEmail = 'admin@shhmcsoc.me'; 
  const isAdmin = session.user.email.toLowerCase() === adminEmail.toLowerCase();

  return {
    email: session.user.email.toLowerCase(),
    isAdmin,
  };
}
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

export async function registerUser(formData: FormData) {
  const firstName = formData.get('firstName') as string;
  const surname = formData.get('surname') as string;
  const email = (formData.get('email') as string).toLowerCase();
  const password = formData.get('password') as string;
  const role = formData.get('role') as string; // This gets 'investor' or 'admin' from your select

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await sql`
      INSERT INTO users (name, email, password, role)
      VALUES (${firstName + ' ' + surname}, ${email}, ${hashedPassword}, ${role})
    `;
    
    // After registration, send them to login
    return { success: true }; 
  } catch (error: any) {
    console.error('Registration Error:', error);
    return { message: 'Database error: Failed to create account.' };
  }
}
/**
 * ACTION: Create Investment
 */

export async function createInvestment(formData: FormData): Promise<ActionResponse> {
  try {
    // 1. Extract and sanitize
    const email = (formData.get('email') as string)?.toLowerCase().trim();
    const amountToInvest = parseFloat(formData.get('amountToInvest') as string) || 0;
    const duration = (formData.get('investmentDuration') as string) || '1 Month';
    const accountClass = (formData.get('accountClass') as string) || 'Investment';
    const selectedRoi = parseFloat(formData.get('selectedRoi') as string) || 7;
    
    const bankName = formData.get('bankName') as string;
    const accountNumber = formData.get('accountNumber') as string;
    const accountName = formData.get('accountName') as string; 
    const signatureName = formData.get('signatureName') as string;

    // 2. Validate Member
    const memberResult = await sql`SELECT id FROM memberships WHERE LOWER(email) = ${email} LIMIT 1`;
    
    if (memberResult.rows.length === 0) {
      return { success: false, message: 'No member account found with this email. Please register first.' };
    }
    const memberId = memberResult.rows[0].id;

    // 3. Handle File
    const receiptFile = formData.get('paymentReceipt') as File;
    if (!receiptFile || receiptFile.size === 0) {
       return { success: false, message: 'Payment receipt image/PDF is required.' };
    }
    
    const receiptUrl = await uploadFile(receiptFile, 'receipts');
    if (!receiptUrl) {
      return { success: false, message: 'Failed to upload receipt.' };
    }

    // 4. Calculate Interest
    const months = getMonthsFromDuration(duration);
    const totalInterest = Math.round(amountToInvest * (selectedRoi / 100) * months);

    // 5. Transaction
    await sql`BEGIN`;

    try {
      await sql`
        UPDATE memberships 
        SET 
          bank_name = ${bankName},
          account_number = ${accountNumber},
          payout_account_name = ${accountName}
        WHERE id = ${memberId}
      `;

      await sql`
        INSERT INTO investments (
          member_id, member_email, amount, monthly_interest, 
          bank_name, account_number, account_name, receipt_url, 
          status, contract_accepted, duration, account_class, 
          selected_roi, signature_name
        )
        VALUES (
          ${memberId}, ${email}, ${amountToInvest}, ${totalInterest}, 
          ${bankName}, ${accountNumber}, ${accountName}, ${receiptUrl}, 
          'pending', ${formData.get('contractNotice') === 'on'}, 
          ${duration}, ${accountClass}, ${selectedRoi}, ${signatureName}
        )
      `;

      await sql`COMMIT`;
    } catch (dbError: any) {
      await sql`ROLLBACK`;
      throw dbError;
    }

    // 6. Email (Non-blocking)
    try {
      const emailHtml = await render(
        React.createElement(InvestmentConfirmationEmail, {
          amount: amountToInvest,
          duration: duration,
          interest: totalInterest 
        })
      );

      await resend.emails.send({
        from: 'SulejaHH MCoop <noreply@shhmcsoc.me>',
        to: [email],
        subject: 'Investment Registration Received',
        html: emailHtml,
      });
    } catch (e) { console.error('Email error:', e); }

    revalidatePath('/dashboard/investments');
    return { success: true, message: 'Investment recorded successfully!' };

  } catch (error: any) {
    console.error('Action Error:', error);
    return { success: false, message: 'Database Error: ' + error.message };
  }
}


/**
 * ACTION: Create Membership
 */
export type ActionResponse = {
  success: boolean;
  message: string;
};


// app/lib/actions.ts

export async function createMembership(formData: FormData): Promise<ActionResponse> {
  try {
    // 1. Upload files
    const passport_url = await uploadFile(formData.get('passportFile') as File, 'passports');
    const id_card_url = await uploadFile(formData.get('idCardFile') as File, 'ids');
    
    let receipt_url = null;
    const receiptFile = formData.get('paymentReceipt') as File;
    if (receiptFile && receiptFile.size > 0) {
      receipt_url = await uploadFile(receiptFile, 'receipts');
    }

    // 2. Extract and format basic data
    const email = (formData.get('email') as string).toLowerCase().trim();
    const firstName = formData.get('firstName') as string;
    const surname = formData.get('surname') as string;
    const tin = (formData.get('tin') as string) || 'N/A';
    const membershipType = (formData.get('membershipType') as string) || 'Nominal';

    // 3. Extract Investment Data (if provided)
    const amountToInvest = formData.get('amountToInvest') ? parseFloat(formData.get('amountToInvest') as string) : 0;
    const selectedRoi = formData.get('selectedRoi') ? parseInt(formData.get('selectedRoi') as string) : 0;
    const duration = (formData.get('duration') as string) || '1 Month';
    const accountName = (formData.get('accountName') as string) || null;
    const bankName = (formData.get('bankName') as string) || null;
    const accountNumber = (formData.get('accountNumber') as string) || null;
    const accountClass = (formData.get('accountClass') as string) || 'Investment';

    // 4. Database Transaction
    await sql`BEGIN`;

    try {
      // Create Membership Record
      const memberResult = await sql`
        INSERT INTO memberships (
          title, surname, first_name, middle_name, date_of_birth, 
          gender, nationality, residential_address, tin, email, 
          mobile_phone, passport_url, id_card_url, membership_type,
          amount_to_invest, selected_roi, investment_duration,
          payout_account_name, bank_name, account_number, 
          account_class, payment_receipt_url
        )
        VALUES (
          ${formData.get('title') as string}, ${surname}, ${firstName}, 
          ${formData.get('middle_name') as string || null}, 
          ${formData.get('dateOfBirth') as string}, 
          ${formData.get('gender') as string},
          ${formData.get('nationality') as string || 'Nigerian'}, 
          ${formData.get('residentialAddress') as string}, ${tin}, ${email}, 
          ${formData.get('mobilePhone') as string}, ${passport_url}, 
          ${id_card_url}, ${membershipType}, ${amountToInvest}, 
          ${selectedRoi}, ${duration}, ${accountName}, ${bankName}, 
          ${accountNumber}, ${accountClass}, ${receipt_url}
        )
        RETURNING id
      `;

      const memberId = memberResult.rows[0].id;

      // 4.5 IMPORTANT: If there is an investment, insert it into the investments table
      if (amountToInvest > 0) {
        const months = getMonthsFromDuration(duration);
        const totalInterest = Math.round(amountToInvest * (selectedRoi / 100) * months);

        await sql`
          INSERT INTO investments (
            member_id, 
            member_email, 
            amount, 
            monthly_interest, 
            bank_name, 
            account_number, 
            account_name, 
            receipt_url, 
            status, 
            contract_accepted, 
            duration, 
            account_class, 
            selected_roi
          )
          VALUES (
            ${memberId}, 
            ${email}, 
            ${amountToInvest}, 
            ${totalInterest}, 
            ${bankName}, 
            ${accountNumber}, 
            ${accountName}, 
            ${receipt_url}, 
            'pending', 
            true, 
            ${duration}, 
            ${accountClass}, 
            ${selectedRoi}
          )
        `;
      }

      await sql`COMMIT`;
    } catch (dbError) {
      await sql`ROLLBACK`;
      throw dbError;
    }

    // 5. Trigger Welcome Email (Non-blocking)
    try {
      const emailHtml = await render(
        React.createElement(WelcomeMembershipEmail, { firstName })
      );

      await resend.emails.send({
        from: 'SulejaHH MCoop <noreply@shhmcsoc.me>',
        to: [email],
        subject: 'Welcome to Suleja HH Multi-purpose Coop',
        html: emailHtml,
      });
    } catch (e) {
      console.error('Welcome Email failed to send:', e);
    }

    revalidatePath('/dashboard/investments');
    return { success: true, message: 'Membership and Investment created successfully!' };

  } catch (error: any) {
    if (error.code === '23505') {
      return { success: false, message: 'This email is already registered.' };
    }
    console.error('Membership Creation Error:', error);
    return { success: false, message: 'A database error occurred.' };
  }
}

export async function checkEmailExists(email: string) {
  try {
    // We only need to select 1 to see if it exists
    const result = await sql`
      SELECT id FROM memberships WHERE email = ${email.toLowerCase()} LIMIT 1
    `;
    
    // Check the length of the rows array instead of rowCount
    return result.rows.length > 0;
  } catch (error) {
    console.error("Error checking email:", error);
    return false;
  }
}
/**
 * ACTION: Create Loan Application
 */
export async function createLoan(prevState: any, formData: FormData) {
  try {
    const email = formData.get('email') as string;
    const surname = formData.get('surname') as string;
    const first_name = formData.get('first_name') as string;
    
    const isGuarantorSubmission = formData.has('guarantorName') && formData.get('guarantorName') !== '';

    if (isGuarantorSubmission) {
      // --- GUARANTOR SUBMISSION ---
      const existingLoan = await sql`SELECT id FROM loan_applications WHERE email = ${email} ORDER BY request_date DESC LIMIT 1`;
      if (existingLoan.rows.length === 0) return { success: false, message: 'No active loan application found.' };

      const loan_id = existingLoan.rows[0].id;
      const gPassportUrl = await uploadFile(formData.get('guarantorPassportFile') as File, 'guarantor_passports');
      const gIdUrl = await uploadFile(formData.get('guarantorIdFile') as File, 'guarantor_ids');

      await sql`
        INSERT INTO loan_guarantors (
          loan_id, guarantor_name, guarantor_email, guarantor_phone, 
          guarantor_relationship, guarantor_workplace, guarantor_occupation,
          residential_address, passport_url, id_card_url
        )
        VALUES (
          ${loan_id}, ${formData.get('guarantorName') as string}, ${formData.get('guarantorEmail') as string},
          ${formData.get('guarantorPhone') as string}, ${formData.get('guarantorRelationship') as string},
          ${formData.get('guarantorWorkplace') as string}, ${formData.get('guarantorOccupation') as string},
          ${formData.get('residential_address') as string}, ${gPassportUrl}, ${gIdUrl}
        )
      `;
    } 
    
    else {
      // --- INITIAL APPLICANT SUBMISSION ---
      const passport_url = await uploadFile(formData.get('passportFile') as File, 'passports');
      const id_card_url = await uploadFile(formData.get('idCardFile') as File, 'ids');
      
      const existingMember = await sql`SELECT id FROM memberships WHERE email = ${email} LIMIT 1`;
      let member_id = existingMember.rows[0]?.id;
      
      if (!member_id) {
        // This is the specific INSERT causing the "memberships" error
        const newMember = await sql`
          INSERT INTO memberships (
            surname, 
            first_name, 
            email, 
            mobile_phone, 
            residential_address,
            date_of_birth,     -- Added to satisfy NOT NULL
            gender,            -- Added to satisfy NOT NULL
            title,              -- Added to satisfy NOT NULL
            nationality        -- Added to satisfy NOT NULL
          )
          VALUES (
            ${surname}, 
            ${first_name}, 
            ${email}, 
            ${formData.get('mobile_phone') as string}, 
            ${formData.get('full_residential_address') as string}, -- Using correct key
            ${formData.get('date_of_birth') as string}, 
            ${formData.get('gender') as string},
            ${formData.get('your_title') as string},
            ${formData.get('nationality') as string || 'Nigerian'}
          )
          RETURNING id
        `;
        member_id = newMember.rows[0].id;
      }

      // 1. DATA EXTRACTION & FALLBACKS (Fixes the naming mismatches)
      const loan_amount = parseFloat(formData.get('loan_amount') as string) || 0;
      const reqDate = (formData.get('request_date') || new Date().toISOString().split('T')[0]) as string;
      const purpose = (formData.get('purpose_of_loan') || formData.get('purpose_of_Loan') || 'Business') as string;
      const repayDate = (formData.get('repayment_date') || formData.get('repaymentDate') || reqDate) as string;
      const bName = (formData.get('bank_name') || formData.get('bankName')) as string;
      const accNum = (formData.get('account_number') || formData.get('accountNumber') || formData.get('accoun_number')) as string;
      const accName = (formData.get('account_name') || formData.get('accountName')) as string;

      await sql`
        INSERT INTO loan_applications (
          id, member_id, surname, first_name, middle_name, 
          date_of_birth, gender, nationality, tin, email, 
          mobile_phone, loan_amount, request_date, duration, interest, 
          purpose_of_loan, repayment_date, bank_name, account_number, account_name, 
          account_type, passport_url, id_card_url, status, spouse_name, 
          spouse_mobile_phone, spouse_title, spouse_dob, spouse_gender, spouse_nationality, 
          spouse_state_of_origin, spouse_lga, spouse_marital_status, spouse_residential_address, expiration_date, 
          spouse_state, spouse_address, spouse_phone, amount_paid, last_payment_date, 
          your_title, state_of_origin, lga, full_residential_address
        )
        VALUES (
          uuid_generate_v4(), 
          ${member_id},
          ${surname},
          ${first_name},
          ${formData.get('middle_name') as string || null}, 
          ${formData.get('date_of_birth') as string}, 
          ${formData.get('gender') as string},
          ${formData.get('nationality') as string || 'Nigerian'}, 
          ${formData.get('tin') as string || 'N/A'},
          ${email}, 
          ${formData.get('mobile_phone') as string}, 
          ${loan_amount}, 
          ${reqDate}, 
          ${formData.get('duration') as string}, 
          ${formData.get('interest') as string || '15%'}, 
          ${purpose}, 
          ${repayDate}, 
          ${bName}, 
          ${accNum}, 
          ${accName}, 
          ${formData.get('account_type') as string}, 
          ${passport_url}, 
          ${id_card_url}, 
          'pending', 
          ${formData.get('spouse_name') as string || null}, 
          ${formData.get('spouse_mobile_phone') as string || null}, 
          ${formData.get('spouse_title') as string || null}, 
          ${formData.get('spouse_dob') as string || null}, 
          ${formData.get('spouse_gender') as string || null}, 
          ${formData.get('spouse_nationality') as string || null}, 
          ${formData.get('spouse_state_of_origin') as string || null}, 
          ${formData.get('spouse_lga') as string || null}, 
          ${formData.get('spouse_marital_status') as string || null}, 
          ${formData.get('spouse_residential_address') as string || null}, 
          null, 
          null, 
          null, 
          null, 
          0, 
          null, 
          ${formData.get('your_title') as string}, 
          ${formData.get('state_of_origin') as string}, 
          ${formData.get('lga') as string}, 
          ${formData.get('full_residential_address') as string} 
        )
      `;

      try {
        const appHtml = await render(React.createElement(LoanConfirmationEmail, { firstName: first_name, loanAmount: loan_amount.toLocaleString('en-NG'), duration: formData.get('duration') as string }));
        await resend.emails.send({ from: 'SHHMCSOC Support <noreply@shhmcsoc.me>', to: [email], subject: 'Application Received - SHHMCSOC', html: appHtml });
      } catch (e) { console.error("App email fail:", e); }
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
        id, 
        first_name, 
        surname, 
        email, 
        loan_amount, 
        interest, 
        repayment_date, 
        request_date, -- ADDED THIS LINE
        tin, 
        status,
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


// Inside app/lib/actions.ts
const ITEMS_PER_PAGE = 6;

export async function fetchFilteredLoans(
  query: string,
  currentPage: number,
  userEmail?: string, // Add this
  userRole?: string   // Add this
){
  const ITEMS_PER_PAGE = 6;
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    if (userRole === 'admin') {
      // ADMIN: Sees everyone's loans
      const loans = await sql`
        SELECT * FROM loan_applications
        WHERE
          (first_name ILIKE ${`%${query}%`} OR
          surname ILIKE ${`%${query}%`} OR
          email ILIKE ${`%${query}%`})
        ORDER BY request_date DESC
        LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
      `;
      return loans.rows;
    } else {
      // USER: Sees only their own loans
      const loans = await sql`
        SELECT * FROM loan_applications
        WHERE 
          LOWER(email) = ${userEmail?.toLowerCase()} AND
          (first_name ILIKE ${`%${query}%`} OR 
           surname ILIKE ${`%${query}%`})
        ORDER BY request_date DESC
        LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
      `;
      return loans.rows;
    }
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch loans.');
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

export async function fetchAllInvestments() {
  try {
    const data = await sql`
      SELECT 
        investments.*, 
        users.first_name, 
        users.surname 
      FROM investments
      JOIN users ON investments.member_email = users.email
      ORDER BY investments.created_at DESC
    `;
    
    // For the 'postgres' library, data is already the array of results
    return data; 
  } catch (error) {
    console.error('Database Error:', error);
    return [];
  }
}


export async function fetchInvestments(query: string = '') {
  const user = await getSessionInfo();
  if (!user) {
    console.log("DEBUG: No session found");
    return [];
  }

  // Normalize inputs to prevent "oko" vs "okoyee" style mismatches
  const userEmail = user.email.trim().toLowerCase();
  const searchPattern = `%${query.trim().toLowerCase()}%`;

  console.log("DEBUG: Logged in as:", userEmail, "Is Admin:", user.isAdmin);

  try {
    if (user.isAdmin) {
      // ADMIN: Can search across everything
      const data = await sql`
        SELECT i.*, m.first_name, m.surname 
        FROM investments i 
        LEFT JOIN memberships m ON i.member_id = m.id 
        WHERE 
          m.first_name ILIKE ${searchPattern} OR 
          m.surname ILIKE ${searchPattern} OR 
          i.member_email ILIKE ${searchPattern} OR
          i.status ILIKE ${searchPattern}
        ORDER BY i.created_at DESC`;
      return data.rows;
    } else {
      // INVESTOR: Use LEFT JOIN so records appear even if membership profile is missing
      console.log("DEBUG: Running Investor SQL for:", userEmail);
      
      const data = await sql`
        SELECT i.*, m.first_name, m.surname 
        FROM investments i 
        LEFT JOIN memberships m ON i.member_id = m.id 
        WHERE LOWER(TRIM(i.member_email)) = ${userEmail}
        AND (
          i.status ILIKE ${searchPattern} OR
          i.id::text ILIKE ${searchPattern} OR
          m.first_name ILIKE ${searchPattern}
        )
        ORDER BY i.created_at DESC`;
      
      console.log("DEBUG: Rows found for investor:", data.rows.length);
      return data.rows;
    }
  } catch (error) {
    console.error('Fetch Error:', error);
    return [];
  }
}

export async function approveInvestment(investmentId: string) {
  await sql`UPDATE investments SET status = 'active' WHERE id = ${investmentId}`;
  revalidatePath('/dashboard/investments');
  return { success: true };
}

export async function getPendingWithdrawalCount(): Promise<number> {
  try {
    const data = await sql`SELECT COUNT(*) FROM investment_withdrawals WHERE status = 'pending'`;
    return Number(data.rows[0].count) || 0;
  } catch (error) {
    return 0;
  }
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
/**
 * ACTION: Request Investment Withdrawal
 */
export async function requestWithdrawal(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Get the verified session from NextAuth
    const session = await auth();
    const sessionEmail = session?.user?.email?.toLowerCase();

    if (!sessionEmail) {
      return { success: false, message: 'You must be logged in to perform this action.' };
    }

    const investmentId = formData.get('investmentId') as string;
    const amountToWithdraw = parseFloat(formData.get('amount') as string) || 0;

    // 2. Verify Member exists using the SESSION email
    const memberResult = await sql`
      SELECT id FROM memberships 
      WHERE LOWER(email) = ${sessionEmail} 
      LIMIT 1
    `;
    
    if (memberResult.rows.length === 0) {
      return { success: false, message: 'Your member profile was not found.' };
    }
    const memberId = memberResult.rows[0].id;

    // 3. Verify Investment exists, belongs to THIS member, and is active
    const invResult = await sql`
      SELECT amount, status FROM investments 
      WHERE id = ${investmentId} 
      AND member_id = ${memberId} 
      LIMIT 1
    `;

    if (invResult.rows.length === 0) {
      return { success: false, message: 'Investment record not found or access denied.' };
    }

    const investment = invResult.rows[0];
    
    if (investment.status !== 'active') {
      return { success: false, message: 'Withdrawals are only allowed for active investments.' };
    }

    if (amountToWithdraw > investment.amount) {
      return { success: false, message: 'Insufficient balance. You cannot withdraw more than your current investment.' };
    }

    // 4. Record the withdrawal request
    await sql`
      INSERT INTO investment_withdrawals (
        member_id, 
        investment_id, 
        amount, 
        bank_name, 
        account_number, 
        account_name, 
        status
      )
      VALUES (
        ${memberId},
        ${investmentId},
        ${amountToWithdraw},
        ${formData.get('bankName') as string},
        ${formData.get('accountNumber') as string},
        ${formData.get('accountName') as string},
        'pending'
      )
    `;

    // Revalidate paths so the UI updates immediately
    revalidatePath('/dashboard/investments');
    revalidatePath('/dashboard/withdrawals'); // If you have an admin view
    
    return { success: true, message: 'Withdrawal request submitted successfully for approval!' };

  } catch (error: any) {
    console.error('Withdrawal Error:', error);
    return { success: false, message: 'A system error occurred. Please try again later.' };
  }
}
/**
 * ACTION: Admin Approve Withdrawal
 */
export async function approveWithdrawal(withdrawalId: string) {
  try {
    // 1. Get withdrawal details
    const result = await sql`SELECT * FROM investment_withdrawals WHERE id = ${withdrawalId} LIMIT 1`;
    if (result.rows.length === 0) return { success: false, message: 'Not found' };
    
    const withdrawal = result.rows[0];

    // 2. Deduct from the main investment
    await sql`
      UPDATE investments 
      SET amount = amount - ${withdrawal.amount}
      WHERE id = ${withdrawal.investment_id}
    `;

    // 3. Mark withdrawal as paid
    await sql`UPDATE investment_withdrawals SET status = 'paid' WHERE id = ${withdrawalId}`;

    revalidatePath('/dashboard/withdrawals');
    return { success: true, message: 'Withdrawal approved and balance updated.' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
/**
 * ACTION: Fetch Loan Pages (Pagination Count)
 */
export async function fetchLoansPages(
  query: string, 
  userEmail?: string, 
  userRole?: string
) {
  try {
    let count;
    
    if (userRole === 'admin') {
      // ADMIN: Count all matching applications
      count = await sql`
        SELECT COUNT(*)
        FROM loan_applications
        WHERE
          first_name ILIKE ${`%${query}%`} OR
          surname ILIKE ${`%${query}%`} OR
          email ILIKE ${`%${query}%`}
      `;
    } else {
      // INVESTOR: Count only their own matching applications
      count = await sql`
        SELECT COUNT(*)
        FROM loan_applications
        WHERE 
          LOWER(email) = ${userEmail?.toLowerCase()} AND
          (first_name ILIKE ${`%${query}%`} OR 
           surname ILIKE ${`%${query}%`})
      `;
    }

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of loan pages.');
  }
}


export async function createLoginAfterApproval(email: string, firstName: string) {
  try {
    // 1. Generate a random temporary password
    const tempPassword = Math.random().toString(36).slice(-8); // e.g., "a1b2c3d4"
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // 2. Insert into the 'users' table (Credential Table)
    await sql`
      INSERT INTO users (name, email, password)
      VALUES (${firstName}, ${email.toLowerCase()}, ${hashedPassword})
      ON CONFLICT (email) DO NOTHING
    `;

    // 3. Send the Credentials via Resend
    try {
      await resend.emails.send({
        from: 'SHHMCSOC Support <noreply@shhmcsoc.me>',
        to: [email.toLowerCase()],
        subject: 'Your Account Credentials - SHHMCSOC',
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2>Welcome to the Portal, ${firstName}!</h2>
            <p>Your membership has been approved, and your login account is now active.</p>
            <div style="background-color: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Login Email:</strong> ${email.toLowerCase()}</p>
              <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: #fff; padding: 2px 5px; border: 1px solid #ddd;">${tempPassword}</code></p>
            </div>
            <p>For security, please change your password immediately after logging in.</p>
            <a href="https://shhmcsoc.me/login" style="display: inline-block; padding: 10px 20px; background-color: #16a34a; color: white; text-decoration: none; border-radius: 5px;">Login to Dashboard</a>
            <p style="margin-top: 25px; font-size: 12px; color: #888;">If you did not request this account, please ignore this email.</p>
          </div>
        `,
      });
      console.log(`Success: Login email sent to ${email}`);
    } catch (emailError) {
      // We log the error but don't stop the process, as the user WAS created in DB
      console.error('Failed to send login email:', emailError);
    }

    return { success: true, message: 'User account created and email sent.' };
  } catch (error: any) {
    console.error('Failed to create login:', error);
    return { success: false, message: 'Database Error: ' + error.message };
  }
}

export async function approveMembership(id: string, email: string, firstName: string) {
  try {
    // Update membership status
    await sql`UPDATE memberships SET status = 'active' WHERE id = ${id}`;

    // Trigger login creation
    const loginResult = await createLoginAfterApproval(email, firstName);

    if (loginResult.success) {
      // Send an email saying: "Your account is ready! Use password: ${loginResult.tempPassword}"
      // ... (Use your Resend logic here)
    }

    revalidatePath('/dashboard/memberships');
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
