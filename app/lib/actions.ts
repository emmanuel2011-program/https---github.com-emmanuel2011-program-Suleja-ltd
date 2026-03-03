'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { sql } from '@vercel/postgres';
import { put } from '@vercel/blob';
import { revalidatePath } from 'next/cache';
import { Resend } from 'resend'; 
import { LoanConfirmationEmail } from '@/app/ui/emails/loan-confirmation';

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

const resend = new Resend(process.env.RESEND_API_KEY as string);

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

    try {
      await resend.emails.send({
        from: 'Cooperative <onboarding@resend.dev>',
        to: [rawFormData.email],
        subject: 'Welcome to the Cooperative!',
        html: `<h1>Welcome, ${rawFormData.firstName}!</h1><p>Your registration was successful.</p>`,
      });
    } catch (e) { console.error('Email error:', e); }

    revalidatePath('/membership');
    return { success: true };
  } catch (error: any) {
    if (error.code === '23505') return { success: false, message: 'Email already registered.' };
    return { success: false, message: 'Database Error.' };
  }
}

/**
 * Action to create a Loan Application with BLOB UPLOAD
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
  const loanAmount = formData.get('loanAmount') as string;
  const duration = formData.get('duration') as string;
  const interest = formData.get('interest') as string;
  const bankName = formData.get('bankName') as string;
  const accountNumber = formData.get('accountNumber') as string;
  const accountName = formData.get('accountName') as string;
  const accountType = (formData.get('accountType') as string) || 'Savings';
  const purposeOfLoan = formData.get('purposeOfLoan') as string;
  const repaymentDate = toNull(formData.get('repaymentDate') as string);
  const spouseName = toNull(formData.get('spouseName') as string);
  const spouseMobilePhone = toNull(formData.get('spouseMobilePhone') as string);
  const spouseDOB = toNull(formData.get('spouseDOB') as string);

  // --- START BLOB UPLOAD LOGIC ---
  const passportFile = formData.get('passportFile') as File;
  const idCardFile = formData.get('idCardFile') as File;
  // TEMPORARY TEST - Replace the string with your actual token
const TEST_TOKEN = "vercel_blob_rw_IM7wO5HctNrK86vw_tdh9LfJUfZ25gpdbHsRoTWejlI3qvV";

const passportBlob = await put(`passports/${passportFile.name}`, passportFile, {
  access: 'public',
  token: TEST_TOKEN, // Force the function to use this specific token
});

  let passportUrl = null;
  let idCardUrl = null;

  try {
    // Upload Passport
    if (passportFile && passportFile.size > 0) {
      const passportBlob = await put(`passports/${Date.now()}-${passportFile.name}`, passportFile, {
        access: 'public',
      });
      passportUrl = passportBlob.url;
    }

    // Upload ID Card
    if (idCardFile && idCardFile.size > 0) {
      const idBlob = await put(`ids/${Date.now()}-${idCardFile.name}`, idCardFile, {
        access: 'public',
      });
      idCardUrl = idBlob.url;
    }

    // Check Membership
    const existingMember = await sql`SELECT id FROM memberships WHERE email = ${email} LIMIT 1`;
    let memberId;
    if (existingMember.rows.length > 0) {
      memberId = existingMember.rows[0].id;
    } else {
      const newMember = await sql`
        INSERT INTO memberships (surname, first_name, email, mobile_phone, date_of_birth, gender, nationality, title, tin, residential_address)
        VALUES (${surname}, ${firstName}, ${email}, ${mobilePhone}, ${dateOfBirth}, ${gender}, ${nationality}, ${title}, ${tin}, 'Not Provided')
        RETURNING id
      `;
      memberId = newMember.rows[0].id;
    }

    // Insert Loan Application with URLs
    await sql`
      INSERT INTO loan_applications (
        member_id, surname, first_name, email, mobile_phone, date_of_birth,
        tin, loan_amount, duration, interest, bank_name, account_number, 
        account_name, account_type, purpose_of_loan, repayment_date,
        spouse_name, spouse_mobile_phone, spouse_dob,
        passport_url, id_card_url, status, request_date, gender
      )
      VALUES (
        ${memberId}, ${surname}, ${firstName}, ${email}, ${mobilePhone}, ${dateOfBirth},
        ${tin}, ${parseFloat(loanAmount)}, ${duration}, ${interest}, ${bankName}, ${accountNumber}, 
        ${accountName}, ${accountType}, ${purposeOfLoan}, ${repaymentDate},
        ${spouseName}, ${spouseMobilePhone}, ${spouseDOB},
        ${passportUrl}, ${idCardUrl}, 'pending', CURRENT_DATE, ${gender}
      )
    `;

    // Email Notification
    try {
      await resend.emails.send({
        from: 'Cooperative <onboarding@resend.dev>',
        to: [email],
        subject: 'Loan Application Received',
        react: LoanConfirmationEmail({ firstName, loanAmount, duration }),
      });
    } catch (e) { console.error('Email error:', e); }

    revalidatePath('/dashboard/loans');
    return { success: true, message: 'Application submitted successfully!' };

  } catch (error: any) {
    console.error('Process Error:', error);
    return { success: false, message: `Error: ${error.message}` };
  }
}

/**
 * Fetch Members including their ID URLs
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