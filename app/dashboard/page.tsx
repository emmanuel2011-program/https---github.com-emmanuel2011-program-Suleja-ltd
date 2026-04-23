import { auth } from '@/auth';
import { getDashboardSummary } from '@/app/lib/actions';
import SummaryCards from '@/app/ui/dashboard/summary-cards';
import { redirect } from 'next/navigation';

export default async function Page() {
  const session = await auth();
  
  // 1. Extract role safely
  const user = session?.user as { role?: string };
  const role = user?.role?.toLowerCase().trim() || 'investor';

  // 2. THE SECURITY GATE: If investor, kick them to their own dashboard
  if (role === 'investor') {
    redirect('/dashboard/membership');
  }

  // 3. Only Admins/Users reach this point
  const summaryData = await getDashboardSummary();
  if (!summaryData) return <p className="p-6">Error loading stats.</p>;

  return (
    <main className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 uppercase text-gray-800">
          Cooperative Overview
        </h1>
        <p className="text-sm text-gray-500 mb-6">Admin Financial Control Panel</p>
        
        {/* Cards are strictly only rendered here for authorized roles */}
        <SummaryCards data={summaryData} role={role} />
        
        <hr className="mt-8 border-gray-100" />
      </div>
      
      {/* Rest of your admin tables/charts */}
    </main>
  );
}