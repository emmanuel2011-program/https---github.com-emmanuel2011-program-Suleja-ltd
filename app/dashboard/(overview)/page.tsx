import { Card } from '@/app/ui/dashboard/cards';
import LoanChart from '@/app/ui/dashboard/loan-chart';
import LatestLoans from '@/app/ui/dashboard/latest-loans';
import { lusitana } from '@/app/ui/fonts';
import {
  fetchMemberships,
  fetchLatestLoans,
  fetchCardData,
} from '@/app/lib/data';
// 1. Import the type definition
import { LatestLoan } from '@/app/lib/definitions'; 

export default async function Page() {
  // Fetch cooperative data
  const memberships = await fetchMemberships();
  
  // 2. Cast the result to the expected type
  const rawLatestLoans = await fetchLatestLoans();
  const latestLoans = rawLatestLoans as LatestLoan[];

  const {
    numberOfMembers,
    numberOfLoans,
    totalLoanAmount,
  } = await fetchCardData();

  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Cooperative Dashboard
      </h1>

      {/* Summary cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Total Members" value={numberOfMembers} type="members" />
        <Card title="Total Loans" value={numberOfLoans} type="loans" />
        <Card
          title="Loan Portfolio"
          value={`₦${totalLoanAmount.toLocaleString()}`}
          type="portfolio"
        />
      </div>

      {/* Chart + latest loans */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <LoanChart loans={[]} /> 
        {/* Now latestLoans matches the expected type perfectly */}
        <LatestLoans latestLoans={latestLoans} />
      </div>
    </main>
  );
}