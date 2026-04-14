// app/dashboard/page.tsx
import { getDashboardSummary } from '@/app/lib/actions';
import SummaryCards from '@/app/ui/dashboard/summary-cards';

export default async function Page() {
  const summaryData = await getDashboardSummary();

  if (!summaryData) return <p>Error loading stats.</p>;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">Financial Overview</h1>
      <SummaryCards data={summaryData} />
      
      {/* Your existing tables for Active Loans and Investments below */}
    </main>
  );
}