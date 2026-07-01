import { Card } from '@/app/ui/dashboard/cards';
import LoanChart from '@/app/ui/dashboard/loan-chart';
import LatestLoans from '@/app/ui/dashboard/latest-loans';
import { lusitana } from '@/app/ui/fonts';
import { fetchLatestLoans, fetchCardData } from '@/app/lib/data';
import { LatestLoan } from '@/app/lib/definitions'; 
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function Page() {
  const session = await auth();

  // 1. Cast to 'any' to stop the TypeScript highlight error
  const user = session?.user as any;
  const role = user?.role?.toLowerCase();

  // DEBUG: Look at your terminal/console to see what this prints
  console.log("LOGIN ATTEMPT ROLE:", role);

  // 2. SECURITY CHECK: 
  // If role is 'investor' OR anything that isn't 'user'/'admin', kick them out.
  if (role === 'investor' || (role !== 'user' && role !== 'admin')) {
    redirect('/dashboard/investments');
  }

  // Data fetching only happens for authorized users
  const rawLatestLoans = await fetchLatestLoans();
  const latestLoans = rawLatestLoans as LatestLoan[];
  const { numberOfMembers, numberOfLoans, totalLoanAmount } = await fetchCardData();

  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl font-bold uppercase`}>
        Cooperative Overview
      </h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Total Members" value={numberOfMembers} type="members" />
        <Card title="Total Loans" value={numberOfLoans} type="loans" />
        <Card
          title="Loan Portfolio"
          value={`₦${totalLoanAmount.toLocaleString()}`}
          type="portfolio"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <LoanChart loans={[]} /> 
        <LatestLoans latestLoans={latestLoans} />
      </div>
    </main>
  );
}