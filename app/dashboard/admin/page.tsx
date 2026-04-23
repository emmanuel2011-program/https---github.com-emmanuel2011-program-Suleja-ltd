import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  CurrencyDollarIcon, 
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { sql } from '@vercel/postgres'; // Added direct SQL for withdrawal fetch
import { fetchAllInvestments } from '@/app/lib/actions';
import InvestmentTable from '@/app/ui/investments/table'; 
import WithdrawalAlert from '@/app/ui/admin/withdrawal-alert';

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ query?: string }>; 
}) {
  const session = await auth();
  const params = await searchParams;
  const query = params?.query || ''; 
  
  const user = session?.user as any;
  const rawRole = user?.role?.toLowerCase().trim() || ''; 
  const isAdmin = rawRole === 'user' || rawRole === 'admin';

  if (!isAdmin) {
    redirect('/dashboard/membership');
  }

  let displayData = [];

  try {
    // 1. Fetch main investment records
    const allInvestments = await fetchAllInvestments();
    
    // 2. Fetch specific pending withdrawal requests
    const withdrawalsResult = await sql`
      SELECT * FROM investment_withdrawals 
      WHERE status = 'pending'
    `;
    const pendingWithdrawals = withdrawalsResult.rows;

    // 3. Merge data so the table has everything needed for approval
    displayData = pendingWithdrawals
      .filter((w: any) => 
        query ? w.member_email?.toLowerCase() === query.toLowerCase() : true
      )
      .map((w: any) => {
        // Find the matching main investment record for principal/ROI details
        const inv = allInvestments.find((i: any) => i.id === w.investment_id);
        
        return {
          ...inv, // Contains name, original principal
          ...w,   // Contains withdrawal amount, withdrawal_id
          withdrawal_id: w.id, 
          requested_amount: Number(w.amount),
          total_accrued: inv?.total_roi_due || 0, // Accrued ROI from your ROI logic
          current_principal: inv?.amount || 0,
        };
      });

  } catch (error) {
    console.error("ADMIN DATA FETCH ERROR:", error);
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <WithdrawalAlert />

        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-black text-green-800 tracking-tight uppercase">
            Admin Control Panel
          </h1>
        </div>

        <div id="verification-queue" className="mt-10 scroll-mt-10">
          <div className="flex items-center justify-between mb-4 border-b pb-4">
            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">
              {query ? `Reviewing Payout for: ${query}` : 'Pending Payout Verification'}
            </h2>
            
            {query && (
              <Link href="/dashboard/admin" className="flex items-center gap-1 text-xs font-bold text-blue-600 uppercase">
                <XMarkIcon className="w-4 h-4" />
                Show All Pending
              </Link>
            )}
          </div>
          
          {/* InvestmentTable now receives the withdrawal details + principal + ROI */}
          <InvestmentTable 
            initialInvestments={displayData} 
            isAdmin={isAdmin} 
          />
        </div>
      </div>
    </main>
  );
}