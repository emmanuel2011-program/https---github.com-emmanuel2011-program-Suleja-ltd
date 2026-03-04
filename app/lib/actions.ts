'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { sql } from '@vercel/postgres';
import { put } from '@vercel/blob';
import { revalidatePath } from 'next/cache';
import { Resend } from 'resend'; 
import { LoanConfirmationEmail } from '@/app/ui/emails/loan-confirmation';
// Import your new status template
import { LoanStatusEmail } from '@/app/ui/emails/loan-status'; 

const resend = new Resend(process.env.RESEND_API_KEY);
// Set your admin email for monitoring
const ADMIN_EMAIL = 'admin@shhmcsoc.me'; 

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
 * Action to create a new Membership
 */
export async function createMembership(formData: FormData) {
  const rawFormData = {
    surname: formData.get('surname') as string,
    firstName: formData.get('firstName') as string,
    middleName: (formData.get('middleName') as string) || null,
    title: (formData.get('title') as string) || 'Mr/Ms',
    dateOfBirth: formData.get('dateOfBirth') as string,
    gender: (formData.get('gender') as string) || 'Not Specified',
    nationality: (formData.get('nationality') as string) || 'Nigerian',
    email: formData.get('email') as string,
    mobilePhone: formData.get('mobilePhone') as string,
    residentialAddress: formData.get('residentialAddress') as string,
    tin: (formData.get('tin') as string) || null,
  };

  try {
    await sql`
      INSERT INTO memberships (
        title, surname, first_name, middle_name, date_of_birth, 
        gender, nationality, email, mobile_phone, residential_address, tin
      )
      VALUES (
        ${rawFormData.title}, ${rawFormData.surname}, ${rawFormData.firstName}, 
        ${rawFormData.middleName}, ${rawFormData.dateOfBirth}, ${rawFormData.gender},
        ${rawFormData.nationality}, ${rawFormData.email}, ${rawFormData.mobilePhone}, 
        ${rawFormData.residentialAddress}, ${rawFormData.tin}
      )
    `;

    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: 'SulejaHH Cooperative <info@shhmcsoc.me>',
          to: [rawFormData.email],
          subject: 'Welcome to the Cooperative!',
          html: `<h1>Welcome, ${rawFormData.firstName}!</h1><p>Your registration was successful.</p>`,
          text: `Welcome, ${rawFormData.firstName}! Your registration at SulejaHH Cooperative was successful.`,
        });
      } catch (e) {
        console.error('Membership Email failed to send:', e);
      }
    }

    revalidatePath('/membership');
    return { success: true };
  } catch (error: any) {
    console.error('Membership Database Error:', error);
    if (error.code === '23505') return { success: false, message: 'Email already registered.' };
    return { success: false, message: 'Database Error.' };
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
  
  let repaymentDate = toNull(formData.get('repaymentDate') as string);
  if (!repaymentDate) {
      const fallback = new Date();
      fallback.setDate(fallback.getDate() + 30);
      repaymentDate = fallback.toISOString().split('T')[0];
  }

  const spouseTitle = toNull(formData.get('spouseTitle') as string);
  const spouseName = toNull(formData.get('spouseName') as string);
  const spouseMobilePhone = toNull(formData.get('spouseMobilePhone') as string);
  const spouseDOB = toNull(formData.get('spouseDOB') as string);
  const spouseGender = toNull(formData.get('spouseGender') as string);
  const spouseStateOfOrigin = toNull(formData.get('spouseStateOfOrigin') as string);
  const spouseLGA = toNull(formData.get('spouseLGA') as string);
  const spouseNationality = toNull(formData.get('spouseNationality') as string);
  const spouseResidentialAddress = toNull(formData.get('spouseResidentialAddress') as string);

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
        spouse_name, spouse_mobile_phone, spouse_dob, spouse_title, spouse_gender,
        spouse_state_of_origin, spouse_lga, spouse_nationality, spouse_residential_address,
        passport_url, id_card_url, status, request_date, gender, residential_address
      )
      VALUES (
        ${memberId}, ${surname}, ${firstName}, ${email}, ${mobilePhone}, ${dateOfBirth},
        ${tin}, ${parseFloat(loanAmount)}, ${duration}, ${interest}, ${bankName}, ${accountNumber}, 
        ${accountName}, ${accountType}, ${purposeOfLoan}, ${repaymentDate},
        ${spouseName}, ${spouseMobilePhone}, ${spouseDOB}, ${spouseTitle}, ${spouseGender},
        ${spouseStateOfOrigin}, ${spouseLGA}, ${spouseNationality}, ${spouseResidentialAddress},
        ${passportUrl}, ${idCardUrl}, 'pending', CURRENT_DATE, ${gender}, ${residentialAddress}
      )
    `;

    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: 'SulejaHH Cooperative <info@shhmcsoc.me>',
          to: [email],
          subject: 'Loan Application Received',
          text: `Hello ${firstName}, your loan application for ₦${loanAmount} has been received.`,
          react: LoanConfirmationEmail({ firstName, loanAmount, duration }),
        });
      } catch (emailError) {
        console.error('Email Render/Send failure:', emailError);
      }
    }

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
    // 1. Fetch the specific loan details first for the email
    const loanQuery = await sql`
      SELECT loan_amount, repayment_date FROM loan_applications WHERE id = ${loanId}
    `;
    const loanDetails = loanQuery.rows[0];

    // 2. Update Database Status
    await sql`
      UPDATE loan_applications 
      SET status = ${newStatus} 
      WHERE id = ${loanId}
    `;

    // 3. Send Status Update Email
    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: 'SulejaHH Cooperative <info@shhmcsoc.me>',
          to: [applicantEmail],
          cc: [ADMIN_EMAIL],
          subject: `Loan Application Status: ${newStatus.toUpperCase()}`,
          react: LoanStatusEmail({ 
            firstName, 
            status: newStatus,
            amount: loanDetails?.loan_amount,
            repaymentDate: loanDetails?.repayment_date
          }), 
        });
        console.log(`Email details: Amount ₦${loanDetails?.loan_amount} sent to ${applicantEmail}`);
      } catch (emailErr) {
        console.error('Email sending failed:', emailErr);
      }
    }

    revalidatePath('/dashboard/loans');
    revalidatePath('/'); 
    
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
    throw new Error('Failed to fetch the membership directory.');
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
    console.error('Error fetching pending count:', error);
    return 0;
  }
}

/**
 * Fetch pending loans for client action
 */
export async function getPendingLoansAction() {
  try {
    const { rows } = await sql`
      SELECT * FROM loan_applications 
      WHERE status = 'pending' 
      ORDER BY request_date DESC`;
    return rows;
  } catch (error) {
    console.error('Failed to fetch loans:', error);
    return [];
  }
}