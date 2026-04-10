import { fetchInvestments } from '@/app/lib/actions'; 
import { auth } from '@/auth'; 
import { WifiIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import InvestmentTable from '@/app/ui/investments/table'; 
import Search from '@/app/ui/search'; 

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  
  const session = await auth();
  const userRole = (session?.user as any)?.role || '';
  const isAdmin = userRole.toLowerCase() === 'admin' || userRole.toLowerCase() === 'user';

  let safeInvestments: any[] = []; 
  let connectionError = false;

  try {
    const rawData = await fetchInvestments(query);
    const investments = Array.isArray(rawData) ? rawData : (rawData as any)?.rows || [];

    safeInvestments = investments.map((inv: any) => {
      const startDate = new Date(inv.created_at);
      const today = new Date();
      
      // Calculate exact days passed
      const diffTime = Math.max(0, today.getTime() - startDate.getTime());
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      
      // Sforte Logic: Day 1-30 = Cycle 1 | Day 31-60 = Cycle 2
      const currentCycle = Math.ceil(diffDays / 30) || 1; 

      // Data normalization
      const principal = parseFloat(inv.amount) || 0;
      const monthlyRate = parseFloat(inv.monthly_interest) || 0;
      const totalRoi = currentCycle * monthlyRate;
      const grandTotal = principal + totalRoi;

      return {
        ...inv,
        amount: principal,
        monthly_interest: monthlyRate,
        months_counted: currentCycle,
        cycle: currentCycle, // Added Cycle property
        total_roi_due: totalRoi,
        total_due: grandTotal,
        status: inv.status || 'pending' 
      };
    });

  } catch (error) {
    console.error('Data Fetch Error:', error);
    connectionError = true;
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
            Investment Portfolio
          </h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
            Sforte Microfinance Management
          </p>
        </div>
        {connectionError && (
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-lg border border-amber-100 animate-pulse">
            <WifiIcon className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase">Syncing Live...</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search investments..." />
      </div>

      {connectionError && safeInvestments.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
           <ExclamationTriangleIcon className="h-12 w-12 text-gray-300 mb-2" />
           <p className="text-gray-500 font-bold uppercase text-[10px]">Connection Error</p>
        </div>
      ) : (
        <InvestmentTable 
          initialInvestments={safeInvestments} 
          isAdmin={isAdmin} 
        />
      )}
    </div>
  );
}