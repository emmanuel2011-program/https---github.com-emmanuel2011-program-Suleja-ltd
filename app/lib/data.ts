import postgres from 'postgres';
import { 
  LatestLoan, 
  Membership, 
  MonthlyLoan 
} from './definitions';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// Fetch all memberships
export async function fetchMemberships() {
  try {
    const data = await sql`
      SELECT id, title, surname, first_name AS "firstName", email, mobile_phone AS "mobilePhone"
      FROM memberships
      ORDER BY surname ASC;
    `;
    return data as unknown as Membership[];
  } catch (error) {
    console.error('Database Error:', error);
    return []; // Return empty array to prevent build crash
  }
}

// Fetch latest loan applications
export async function fetchLatestLoans() {
  try {
    const data = await sql`
      SELECT 
        loan_applications.id,
        loan_applications.loan_amount AS "loanAmount",
        loan_applications.request_date AS "requestDate",
        memberships.surname,
        memberships.first_name AS "firstName",
        memberships.email
      FROM loan_applications
      JOIN memberships ON loan_applications.member_id = memberships.id
      ORDER BY loan_applications.request_date DESC
      LIMIT 5;
    `;
    return data as unknown as LatestLoan[];
  } catch (error) {
    console.error('Database Error:', error);
    // Returning empty array instead of throwing keeps the build alive
    return []; 
  }
}

// Fetch card metrics for dashboard
export async function fetchCardData() {
  try {
    // Note: count returns a bigint in postgres.js, so we handle it carefully
    const memberCountPromise = sql`SELECT COUNT(*) FROM memberships;`;
    const loanCountPromise = sql`SELECT COUNT(*) FROM loan_applications;`;
    const loanTotalsPromise = sql`
      SELECT SUM(loan_amount) AS total_loans
      FROM loan_applications;
    `;

    const [members, loans, totals] = await Promise.all([
      memberCountPromise,
      loanCountPromise,
      loanTotalsPromise,
    ]);

    const numberOfMembers = Number(members[0].count ?? '0');
    const numberOfLoans = Number(loans[0].count ?? '0');
    const totalLoanAmount = Number(totals[0].total_loans ?? '0');

    return {
      numberOfMembers,
      numberOfLoans,
      totalLoanAmount,
    };
  } catch (error) {
    console.error('Database Error:', error);
    return {
      numberOfMembers: 0,
      numberOfLoans: 0,
      totalLoanAmount: 0,
    };
  }
}

// Pagination for loan applications
const ITEMS_PER_PAGE = 6;
export async function fetchFilteredLoans(query: string, currentPage: number) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const loans = await sql`
      SELECT 
        loan_applications.id,
        loan_applications.loan_amount AS "loanAmount",
        loan_applications.request_date AS "requestDate",
        loan_applications.duration,
        memberships.surname,
        memberships.first_name AS "firstName",
        memberships.email
      FROM loan_applications
      JOIN memberships ON loan_applications.member_id = memberships.id
      WHERE
        memberships.surname ILIKE ${`%${query}%`} OR
        memberships.email ILIKE ${`%${query}%`} OR
        loan_applications.loan_amount::text ILIKE ${`%${query}%`} OR
        loan_applications.request_date::text ILIKE ${`%${query}%`} OR
        loan_applications.duration ILIKE ${`%${query}%`}
      ORDER BY loan_applications.request_date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset};
    `;
    return loans as unknown as LatestLoan[];
  } catch (error) {
    console.error('Database Error:', error);
    return [];
  }
}

export async function fetchLoansPages(query: string) {
  try {
    const data = await sql`
      SELECT COUNT(*)
      FROM loan_applications
      JOIN memberships ON loan_applications.member_id = memberships.id
      WHERE
        memberships.surname ILIKE ${`%${query}%`} OR
        memberships.email ILIKE ${`%${query}%`} OR
        loan_applications.loan_amount::text ILIKE ${`%${query}%`} OR
        loan_applications.request_date::text ILIKE ${`%${query}%`} OR
        loan_applications.duration ILIKE ${`%${query}%`}
    `;
    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    return 0;
  }
}
 
export async function fetchMonthlyLoans() {
  try {
    const data = await sql`
      SELECT 
        TO_CHAR(request_date, 'Mon') AS month,
        SUM(loan_amount) AS "loanAmount",
        DATE_TRUNC('month', request_date) as month_sort
      FROM loan_applications
      GROUP BY month, month_sort
      ORDER BY month_sort ASC;
    `;
    return data as unknown as MonthlyLoan[];
  } catch (error) {
    console.error('Database Error:', error);
    return [];
  }
}