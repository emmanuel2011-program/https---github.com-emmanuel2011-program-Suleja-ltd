import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

async function listLoanApplications() {
  const data = await sql`
    SELECT loan_applications.loan_amount,
           loan_applications.request_date,
           loan_applications.duration,
           memberships.surname,
           memberships.first_name
    FROM loan_applications
    JOIN memberships ON loan_applications.member_id = memberships.id
    WHERE loan_applications.loan_amount > 100000;
  `;

  return data;
}

export async function GET() {
  try {
    return Response.json(await listLoanApplications());
  } catch (error) {
    console.error("Error fetching loan applications:", error);
    return Response.json({ error }, { status: 500 });
  }
}
