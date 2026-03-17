
'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { sql } from '@vercel/postgres';
import { put } from '@vercel/blob';
import { revalidatePath } from 'next/cache';
import { Resend } from 'resend'; 

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Helper to extract months from duration string (e.g., "3 Months" -> 3)
 */
const getMonthsFromDuration = (duration: string): number => {
  const months = parseInt(duration);
  return isNaN(months) ? 1 : months;
};

/**
 * Action to handle User Login
 */
export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

/**
 * Action to create a new Membership (Handles File Uploads & Optional Investments)
 */
export async function createMembership(formData: FormData) {
  try {
    // 1. Handle File Uploads
    let passportUrl = null;
    let idCardUrl = null;

    const passportFile = formData.get('passportFile') as File;
    const idCardFile = formData.get('idCardFile') as File;

    if (passportFile && passportFile.size > 0) {
      const blob = await put(`passports/${Date.now()}-${passportFile.name}`, passportFile, { access: 'public' });
      passportUrl = blob.url;
    }

    if (idCardFile && idCardFile.size > 0) {
      const blob = await put(`ids/${Date.now()}-${idCardFile.name}`, idCardFile, { access: 'public' });
      idCardUrl = blob.url;
    }

    // 2. Insert Membership Data
    const membershipResult = await sql`
      INSERT INTO memberships (
        title, surname, first_name, middle_name, date_of_birth, 
        gender, nationality, email, mobile_phone, residential_address, 
        tin, passport_url, id_card_url
      )
      VALUES (
        ${formData.get('title') as string || 'Mr/Ms'}, 
        ${formData.get('surname') as string}, 
        ${formData.get('firstName') as string}, 
        ${formData.get('middleName') as string || null}, 
        ${formData.get('dateOfBirth') as string}, 
        ${formData.get('gender') as string || 'Not Specified'},
        ${formData.get('nationality') as string || 'Nigerian'}, 
        ${formData.get('email') as string}, 
        ${formData.get('mobilePhone') as string}, 
        ${formData.get('residentialAddress') as string}, 
        ${formData.get('tin') as string || null},
        ${passportUrl},
        ${idCardUrl}
      )
      RETURNING id
    `;

    const memberId = membershipResult.rows[0].id;
    const email = formData.get('email') as string;

    // 3. Handle Conditional Investment
    const amountStr = formData.get('amountToInvest');
    if (amountStr && parseFloat(amountStr.toString()) > 0) {
      const amount = parseFloat(amountStr.toString());
      const duration = (formData.get('duration') as string) || '1 Month (Renewable)';
      
      // Calculate Total Interest: Amount * 7% * Number of Months
      const months = getMonthsFromDuration(duration);
      const totalInterest = amount * 0.07 * months;
      
      let receiptUrl = null;
      const receiptFile = formData.get('paymentReceipt') as File;
      if (receiptFile && receiptFile.size > 0) {
        const blob = await put(`receipts/${Date.now()}-${receiptFile.name}`, receiptFile, { access: 'public' });
        receiptUrl = blob.url;
      }

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
          ${duration}, 'Investment'
        )
      `;
    }

    revalidatePath('/dashboard/memberships');
    revalidatePath('/membership');
    return { success: true };

  } catch (error: any) {
    console.error('Membership Error:', error);
    if (error.code === '23505') return { success: false, message: 'Email already registered.' };
    return { success: false, message: 'Database Error: ' + error.message };
  }
}

/**
 * Action to create a Loan Application
 */
export async function createLoan(prevState: any, formData: FormData) {
  const toNull = (val: string | null) => (val && val.trim() !== '' ? val : null);

  const email = formData.get('email') as string;
  const firstName = formData.get('firstName') as string;
  const surname = formData.get('surname') as string;
  const mobilePhone = formData.get('mobilePhone') as string;
  const dateOfBirth = toNull(formData.get('dateOfBirth') as string);
  const gender = (formData.get('gender') as string) || 'Not Specified';
  const nationality = (formData.get('nationality') as string) || 'Nigerian';
  const title = (formData.get('title') as string) || 'Mr/Ms';
  const tin = toNull(formData.get('tin') as string);
  const residentialAddress = formData.get('residentialAddress') as string;
  const loanAmount = formData.get('loanAmount') as string;
  const duration = formData.get('duration') as string;
  const interest = formData.get('interest') as string;
  const bankName = formData.get('bankName') as string;
  const accountNumber = formData.get('accountNumber') as string;
  const accountName = formData.get('accountName') as string;
  const accountType = (formData.get('accountType') as string) || 'Savings';
  const purposeOfLoan = formData.get('purposeOfLoan') as string;
  const requestedDate = toNull(formData.get('requestedDate') as string) || new Date().toISOString().split('T')[0];

  let repaymentDate = toNull(formData.get('repaymentDate') as string);
  if (!repaymentDate) {
      const fallback = new Date();
      fallback.setDate(fallback.getDate() + 30);
      repaymentDate = fallback.toISOString().split('T')[0];
  }

  try {
    let passportUrl = null;
    let idCardUrl = null;

    const passportFile = formData.get('passportFile') as File;
    const idCardFile = formData.get('idCardFile') as File;

    if (passportFile && passportFile.size > 0) {
      const passportBlob = await put(`passports/${Date.now()}-${passportFile.name}`, passportFile, { access: 'public' });
      passportUrl = passportBlob.url;
    }

    if (idCardFile && idCardFile.size > 0) {
      const idBlob = await put(`ids/${Date.now()}-${idCardFile.name}`, idCardFile, { access: 'public' });
      idCardUrl = idBlob.url;
    }

    const existingMember = await sql`SELECT id FROM memberships WHERE email = ${email} LIMIT 1`;
    let memberId;
    
    if (existingMember.rows.length > 0) {
      memberId = existingMember.rows[0].id;
    } else {
      const newMember = await sql`
        INSERT INTO memberships (surname, first_name, email, mobile_phone, date_of_birth, gender, nationality, title, tin, residential_address)
        VALUES (${surname}, ${firstName}, ${email}, ${mobilePhone}, ${dateOfBirth}, ${gender}, ${nationality}, ${title}, ${tin}, ${residentialAddress})
        RETURNING id
      `;
      memberId = newMember.rows[0].id;
    }

    await sql`
      INSERT INTO loan_applications (
        member_id, surname, first_name, email, mobile_phone, date_of_birth,
        tin, loan_amount, duration, interest, bank_name, account_number, 
        account_name, account_type, purpose_of_loan, repayment_date,
        passport_url, id_card_url, status, request_date, gender, residential_address
      )
      VALUES (
        ${memberId}, ${surname}, ${firstName}, ${email}, ${mobilePhone}, ${dateOfBirth},
        ${tin}, ${parseFloat(loanAmount)}, ${duration}, ${interest}, ${bankName}, ${accountNumber}, 
        ${accountName}, ${accountType}, ${purposeOfLoan}, ${repaymentDate},
        ${passportUrl}, ${idCardUrl}, 'pending', ${requestedDate}, ${gender}, ${residentialAddress}
      )
    `;

    revalidatePath('/dashboard/loans');
    revalidatePath('/'); 
    return { success: true, message: 'Application submitted successfully!' };

  } catch (error: any) {
    console.error('Critical Process Error:', error);
    return { success: false, message: `System Error: ${error.message}` };
  }
}

/**
 * Action to Approve or Reject a Loan
 */
export async function updateLoanStatus(
  loanId: string, 
  newStatus: 'approved' | 'rejected', 
  applicantEmail: string, 
  firstName: string
) {
  try {
    const loanQuery = await sql`
      SELECT loan_amount, repayment_date FROM loan_applications WHERE id = ${loanId}
    `;
    const loanDetails = loanQuery.rows[0];

    await sql`
      UPDATE loan_applications 
      SET status = ${newStatus} 
      WHERE id = ${loanId}
    `;

    if (newStatus === 'approved' && process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: 'SulejaHH Cooperative <info@shhmcsoc.me>',
          to: [applicantEmail],
          subject: 'Important: Your Loan Repayment Reminder',
          html: `
            <div style="font-family: sans-serif; padding: 20px;">
              <h2 style="color: #15803d;">Repayment Schedule Active</h2>
              <p>Hello ${firstName}, your loan repayment of ₦${(loanDetails?.loan_amount * 1.15).toLocaleString()} is due on ${loanDetails?.repayment_date}.</p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error('Email failed:', emailErr);
      }
    }

    revalidatePath('/dashboard/loans');
    return { success: true };
  } catch (error) {
    console.error('Failed to update status:', error);
    return { success: false, message: 'Failed to update status.' };
  }
}

/**
 * Fetch Members for Admin Directory
 */
export async function fetchAllMembers() {
  try {
    const data = await sql`
      SELECT id, title, first_name, surname, email, mobile_phone, residential_address, nationality, passport_url, id_card_url
      FROM memberships
      ORDER BY surname ASC`;
    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch membership directory.');
  }
}

/**
 * Fetch count of pending loans
 */
export async function getPendingCount() {
  try {
    const data = await sql`SELECT COUNT(*) FROM loan_applications WHERE status = 'pending'`;
    return Number(data.rows[0].count);
  } catch (error) {
    return 0;
  }
}

/**
 * Fetch all loans for the dashboard
 */
export async function getPendingLoansAction() {
  try {
    const data = await sql`
      SELECT * FROM loan_applications 
      ORDER BY request_date DESC
    `;
    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch loans.');
  }
}

/**
 * Fetch all investments with member names and bank info
 */
export async function fetchInvestments() {
  try {
    const data = await sql`
      SELECT 
        i.*,
        m.first_name,
        m.surname
      FROM investments i
      JOIN memberships m ON i.member_id = m.id
      ORDER BY i.created_at DESC
    `;
    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch investments.');
  }
}

/**
 * Action to create an Investment for an existing member (Standalone Form)
 */
export async function createInvestment(formData: FormData) {
  const email = formData.get('email') as string;
  const amountToInvest = Number(formData.get('amountToInvest'));
  const duration = (formData.get('investmentDuration') as string);
  
  // Calculate total interest based on duration
  const months = getMonthsFromDuration(duration);
  const totalInterest = amountToInvest * 0.07 * months;

  try {
    // 1. Find member
    const memberResult = await sql`SELECT id FROM memberships WHERE email = ${email} LIMIT 1`;
    if (memberResult.rows.length === 0) {
      return { success: false, message: 'No member found with this email.' };
    }
    const memberId = memberResult.rows[0].id;

    // 2. Handle Receipt Upload
    let receiptUrl = null;
    const receiptFile = formData.get('paymentReceipt') as File;
    if (receiptFile && receiptFile.size > 0) {
      const blob = await put(`receipts/${Date.now()}-${receiptFile.name}`, receiptFile, { access: 'public' });
      receiptUrl = blob.url;
    }

    // 3. Insert Investment
    await sql`
      INSERT INTO investments (
        member_id, member_email, amount, monthly_interest, 
        duration, bank_name, account_number, account_name, account_class, 
        contract_accepted, receipt_url, status
      )
      VALUES (
        ${memberId}, ${email}, ${amountToInvest}, ${totalInterest}, 
        ${duration}, 
        ${formData.get('bankName') as string}, 
        ${formData.get('accountNumber') as string}, 
        ${formData.get('accountName') as string}, 
        ${formData.get('accountClass') as string || 'Investment'},
        ${formData.get('contractNotice') === 'on'},
        ${receiptUrl}, 'pending'
      )
    `;

    revalidatePath('/dashboard/investments');
    return { success: true, message: 'Investment successfully recorded!' };
  } catch (error: any) {
    console.error('Investment Database Error:', error);
    return { success: false, message: 'Database Error: ' + error.message };
  }
}

/**
 * Action to Approve an Investment
 */
export async function approveInvestment(investmentId: string) {
  try {
    await sql`
      UPDATE investments 
      SET status = 'active' 
      WHERE id = ${investmentId}
    `;
    revalidatePath('/dashboard/investments');
    return { success: true };
  } catch (error) {
    console.error('Failed to approve investment:', error);
    return { success: false, message: 'Failed to approve.' };
  }
}