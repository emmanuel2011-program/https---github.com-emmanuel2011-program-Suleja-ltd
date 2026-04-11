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

  try {
    const rawData = await fetchInvestments(query);
    const investments = Array.isArray(rawData) ? rawData : (rawData as any)?.rows || [];

    safeInvestments = investments.map((inv: any) => {
      // 1. DATE & CYCLE MATH
      const startDate = inv.created_at ? new Date(inv.created_at) : new Date();
      const today = new Date();
      const diffTime = Math.max(0, today.getTime() - startDate.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      // Automatic jump every 30 days
      const completedCycles = Math.floor(diffDays / 30); 

      // 2. VALUE CONVERSION
      const principal = Number(inv.amount) || 0;
      const totalPlannedInterest = Number(inv.monthly_interest) || 0;
      const durationMonths = parseInt(inv.duration) || 1;
      const alreadyWithdrawn = Number(inv.total_withdrawn) || 0;

      // 3. ROI CALCULATIONS
      const monthlyRoi = totalPlannedInterest / durationMonths;
      
      // Total Accrued = Monthly ROI * Cycles passed
      const totalAccruedSoFar = monthlyRoi * completedCycles;
      
      // Total Estimated ROI = The full interest potential (monthly_interest)
      const totalEstimatedRoi = totalPlannedInterest;
      
      // Net Balance = (Principal + Accrued) - Withdrawals
      const currentNetBalance = (principal + totalAccruedSoFar) - alreadyWithdrawn;

      return {
        ...inv,
        amount: principal,
        cycle: completedCycles, 
        duration_num: durationMonths,
        yield_in_naira: monthlyRoi, 
        total_accrued: totalAccruedSoFar, 
        estimated_roi: totalEstimatedRoi, // Passed to UI
        total_due: currentNetBalance, 
        withdrawn_to_date: alreadyWithdrawn,
        status: inv.status || 'pending' 
      };
    });

  } catch (error) {
    console.error('Data Fetch Error:', error);
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
            Investment Portfolio
          </h1>
          <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-1">
            Real-Time Automated Tracking
          </p>
        </div>
      </div>

      <div className="mt-4">
        <Search placeholder="Search customer name..." />
      </div>

      <InvestmentTable initialInvestments={safeInvestments} isAdmin={isAdmin} />
    </div>
  );
}