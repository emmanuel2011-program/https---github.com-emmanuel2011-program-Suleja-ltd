'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { Resend } from 'resend'; 
import { LoanConfirmationEmail } from '@/app/ui/emails/loan-confirmation';

// Initialize Resend with your API Key
const resend = new Resend(process.env.RESEND_API_KEY as string);

/**
 * Action to create a new Membership with Welcome Email
 */
console.log('Resend Key Loaded:', process.env.RESEND_API_KEY?.slice(0, 5) + '...');
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

    // TRIGGER WELCOME EMAIL
    try {
      await resend.emails.send({
        from: 'Cooperative <onboarding@resend.dev>', // Update with your verified domain
        to: [rawFormData.email],
        subject: 'Welcome to the Cooperative!',
        html: `
          <h1>Welcome, ${rawFormData.firstName}!</h1>
          <p>Your membership registration was successful.</p>
          <p><strong>Details:</strong></p>
          <ul>
            <li>Name: ${rawFormData.title} ${rawFormData.firstName} ${rawFormData.surname}</li>
            <li>Phone: ${rawFormData.mobilePhone}</li>
          </ul>
          <p>We are glad to have you with us.</p>
        `,
      });
    } catch (emailError) {
      console.error('Membership Welcome Email Error:', emailError);
    }

    revalidatePath('/membership');
    return { success: true };

  } catch (error: any) {
    if (error.code === '23505') {
      return { success: false, message: 'This email is already registered.' };
    }
    console.error('Database Error:', error);
    return { success: false, message: 'Database Error: Failed to Create Membership.' };
  }
}

/**
 * Action to create a Loan Application with Email Trigger
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

  const passportName = (formData.get('passportFile') as File)?.name || 'no-passport.jpg';
  const idCardName = (formData.get('idCardFile') as File)?.name || 'no-id.jpg';

  try {
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
        ${passportName}, ${idCardName}, 'pending', CURRENT_DATE, ${gender}
      )
    `;

    // TRIGGER LOAN EMAIL NOTIFICATION
    try {
      await resend.emails.send({
        from: 'Cooperative <onboarding@resend.dev>',
        to: [email],
        subject: 'Loan Application Received',
        react: LoanConfirmationEmail({ 
          firstName, 
          loanAmount: loanAmount.toString(), 
          duration 
        }),
      });
    } catch (emailError) {
      console.error('Loan Email Notification Error:', emailError);
    }

    revalidatePath('/loans');
    return { success: true, message: 'Loan application submitted successfully!' };

  } catch (error: any) {
    console.error('Database Error:', error);
    return { 
      success: false, 
      message: `Database Error: ${error.message || 'Failed to process loan.'}` 
    };
  }
}