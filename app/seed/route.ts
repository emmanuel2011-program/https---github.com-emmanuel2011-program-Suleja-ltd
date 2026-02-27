import bcrypt from 'bcrypt';
import postgres from 'postgres';
import { memberships, loanApplications, users } from '../lib/cooperative-data';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

async function seedUsers() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `;

  for (const user of users as any[]) {
    try {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await sql`
        INSERT INTO users (id, name, email, password)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
        ON CONFLICT (id) DO NOTHING;
      `;
    } catch (err) {
      console.error("User insert failed:", err);
    }
  }
}

async function seedMemberships() {
  await sql`
    CREATE TABLE IF NOT EXISTS memberships (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      title VARCHAR(50),
      surname VARCHAR(255) NOT NULL,
      first_name VARCHAR(255) NOT NULL,
      middle_name VARCHAR(255),
      date_of_birth DATE NOT NULL, 
      gender VARCHAR(50) NOT NULL,
      nationality VARCHAR(100) NOT NULL,
      residential_address TEXT NOT NULL,
      tin VARCHAR(50),
      email VARCHAR(255) NOT NULL UNIQUE,
      mobile_phone VARCHAR(20) NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  for (const member of memberships as any[]) {
    try {
      await sql`
        INSERT INTO memberships (
          id, title, surname, first_name, middle_name, date_of_birth, gender,
          nationality, residential_address, tin, email, mobile_phone
        )
        VALUES (
          ${member.id}, ${member.title}, ${member.surname}, ${member.firstName}, ${member.middleName || null},
          ${member.dateOfBirth}, ${member.gender}, ${member.nationality}, ${member.residentialAddress},
          ${member.tin || null}, ${member.email}, ${member.mobilePhone}
        )
        ON CONFLICT (id) DO NOTHING;
      `;
    } catch (err) {
      console.error("Membership insert failed:", member.email, err);
    }
  }
}

async function seedLoanApplications() {
  await sql`
    CREATE TABLE IF NOT EXISTS loan_applications (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      member_id UUID NOT NULL,
      title VARCHAR(50),
      surname VARCHAR(255) NOT NULL,
      first_name VARCHAR(255) NOT NULL,
      middle_name VARCHAR(255),
      date_of_birth DATE NOT NULL,
      gender VARCHAR(50) NOT NULL,
      nationality VARCHAR(100) NOT NULL,
      residential_address TEXT NOT NULL,
      contact_address TEXT,
      tin VARCHAR(50),
      email VARCHAR(255) NOT NULL,
      mobile_phone VARCHAR(20) NOT NULL,
      loan_amount INT NOT NULL,
      request_date DATE NOT NULL,
      duration VARCHAR(50) NOT NULL,
      interest VARCHAR(20) NOT NULL,
      purpose_of_loan VARCHAR(225) NOT NULL,
      repayment_date DATE NOT NULL,
      bank_name VARCHAR(255) NOT NULL,
      account_number VARCHAR(50) NOT NULL,
      account_name VARCHAR(255) NOT NULL,
      account_type VARCHAR(50) NOT NULL,
      passport_url TEXT,
      id_card_url TEXT,
      spouse_name VARCHAR(255),
      spouse_mobile_phone VARCHAR(20),
      spouse_title VARCHAR(50),
      spouse_dob DATE,
      spouse_gender VARCHAR(50),
      spouse_nationality VARCHAR(100),
      spouse_state_of_origin VARCHAR(100),
      spouse_local_govt VARCHAR(100),
      spouse_marital_status VARCHAR(50),
      spouse_residential_address TEXT,
      FOREIGN KEY (member_id) REFERENCES memberships(id)
    );
  `;

  for (const loan of loanApplications as any[]) {
    try {
      await sql`
        INSERT INTO loan_applications (
          member_id, title, surname, first_name, middle_name, date_of_birth, gender,
          nationality, residential_address, contact_address, tin, email, mobile_phone,
          loan_amount, request_date, duration, interest, purpose_of_loan, repayment_date, bank_name,
          account_number, account_name, account_type,
          passport_url, id_card_url,
          spouse_name, spouse_mobile_phone, spouse_title, spouse_dob, spouse_gender,
          spouse_nationality, spouse_state_of_origin, spouse_local_govt, spouse_marital_status,
          spouse_residential_address
        )
        VALUES (
          ${loan.memberId}, ${loan.title}, ${loan.surname}, ${loan.firstName}, ${loan.middleName || null},
          ${loan.dateOfBirth}, ${loan.gender}, ${loan.nationality}, ${loan.residentialAddress},
          ${loan.contactAddress || null}, ${loan.tin || null}, ${loan.email}, ${loan.mobilePhone},
          ${loan.loanAmount}, ${loan.requestDate}, ${loan.duration}, ${loan.interest}, 
          ${loan.purposeOfLoan || 'General'}, ${loan.repaymentDate},
          ${loan.bankName}, ${loan.accountNumber}, ${loan.accountName}, ${loan.accountType},
          ${loan.passportUrl || null}, ${loan.idCardUrl || null},
          ${loan.spouseName || null}, ${loan.spouseMobilePhone || null}, ${loan.spouseTitle || null}, 
          ${loan.spouseDOB || null}, ${loan.spouseGender || null},
          ${loan.spouseNationality || null}, ${loan.spouseStateOfOrigin || null}, 
          ${loan.spouseLocalGovt || null}, ${loan.spouseMaritalStatus || null},
          ${loan.spouseResidentialAddress || null}
        )
        ON CONFLICT (id) DO NOTHING;
      `;
    } catch (err) {
      console.error("Loan insert failed:", loan.email, err);
    }
  }
}

export async function GET() {
  try {
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    // Dropping tables to apply the new schema (purpose_of_loan)
    await sql`DROP TABLE IF EXISTS loan_applications CASCADE`;
    await sql`DROP TABLE IF EXISTS memberships CASCADE`;
    await sql`DROP TABLE IF EXISTS users CASCADE`;

    await seedUsers();
    await seedMemberships();
    await seedLoanApplications();

    return Response.json({ message: 'Database wiped and re-seeded successfully' });
  } catch (error: any) {
    console.error("Seeding failed:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}