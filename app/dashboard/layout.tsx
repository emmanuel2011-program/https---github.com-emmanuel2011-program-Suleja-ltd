import SideNav from '@/app/ui/dashboard/sidenav';
import { auth } from '@/auth';
import { getDashboardSummary } from '@/app/lib/actions'; // Ensure this path is correct
import SummaryCards from '@/app/ui/dashboard/summary-cards';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  
  // Fetch the financial summary data
  const summaryData = await getDashboardSummary();

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <SideNav user={session?.user} />
      </div>
      <div className="grow p-6 md:overflow-y-auto md:p-12">
        {/* Only show the summary cards if data exists and user is authenticated */}
        {summaryData && session?.user && (
          <div className="mb-8">
             <h1 className="text-xl font-semibold mb-4 text-gray-800">
               Cooperative Overview
             </h1>
             <SummaryCards data={summaryData} />
             <hr className="mt-8 border-gray-100" />
          </div>
        )}
        
        {children}
      </div>
    </div>
  );
}