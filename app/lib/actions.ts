'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { sql } from '@vercel/postgres';
import { put } from '@vercel/blob';
import { revalidatePath } from 'next/cache';
import { Resend } from 'resend'; 
import { LoanConfirmationEmail } from '@/app/ui/emails/loan-confirmation';

const resend = new Resend(process.env.RESEND_API_KEY);

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

    // SEND WELCOME EMAIL
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
 * Action to create a Loan Application with BLOB UPLOAD
 */
export async function createLoan(prevState: any, formData: FormData) {
  const toNull = (val: string | null) => (val && val.trim() !== '' ? val : null);

  // 1. DATA EXTRACTION
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

  // SPOUSE DATA
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
    // 2. FILE UPLOADS
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

    // 3. MEMBER HANDLING (Check or Create)
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

    // 4. DATABASE INSERT
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

    // 5. EMAIL NOTIFICATION (Awaited)
    if (process.env.RESEND_API_KEY) {
      try {
        const { data, error } = await resend.emails.send({
          from: 'SulejaHH Cooperative <info@shhmcsoc.me>',
          to: [email],
          subject: 'Loan Application Received',
          text: `Hello ${firstName}, your loan application for ₦${loanAmount} has been received.`,
          react: LoanConfirmationEmail({ firstName, loanAmount, duration }),
        });

        if (error) console.error('Resend Error:', error);
        else console.log('Loan Email sent successfully:', data?.id);
      } catch (emailError) {
        console.error('Email Render/Send failure:', emailError);
      }
    }

    revalidatePath('/dashboard/loans');
    return { success: true, message: 'Application submitted successfully!' };

  } catch (error: any) {
    console.error('Critical Process Error:', error);
    return { success: false, message: `System Error: ${error.message}` };
  }
}
/**
 * Action to Approve or Reject a Loan
 */
export async function updateLoanStatus(loanId: string, newStatus: 'approved' | 'rejected', applicantEmail: string, firstName: string) {
  try {
    await sql`
      UPDATE loan_applications 
      SET status = ${newStatus} 
      WHERE id = ${loanId}
    `;

    // Send Approval/Rejection Email
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'SulejaHH Cooperative <info@shhmcsoc.me>',
        to: [applicantEmail],
        subject: `Update on your Loan Application: ${newStatus.toUpperCase()}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: ${newStatus === 'approved' ? '#166534' : '#991b1b'};">
              Loan ${newStatus === 'approved' ? 'Approved!' : 'Application Update'}
            </h2>
            <p>Hello ${firstName},</p>
            <p>Your loan application has been <strong>${newStatus}</strong>.</p>
            ${newStatus === 'approved' 
              ? '<p>The funds will be disbursed to your provided bank account shortly.</p>' 
              : '<p>Please contact the cooperative office for further details regarding this decision.</p>'}
            <p>Best regards,<br/>SulejaHH Management</p>
          </div>
        `,
      });
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
    throw new Error('Failed to fetch the membership directory.');
  }
}