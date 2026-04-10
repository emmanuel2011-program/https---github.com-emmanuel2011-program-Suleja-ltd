import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { 
  UserGroupIcon, 
  CurrencyDollarIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline';
import { fetchAllInvestments } from '@/app/lib/actions';
import InvestmentTable from '@/app/ui/investments/table'; 
import WithdrawalAlert from '@/app/ui/admin/withdrawal-alert';

export default async function AdminPage() {
  const session = await auth();
  
  // 1. ROLE CHECK
  const rawRole = (session?.user as any)?.role || '';
  const isAdmin = rawRole.toLowerCase() === 'user'; 

  // 2. SECURITY REDIRECT
  if (!isAdmin) {
    redirect('/dashboard');
  }

  // 3. FETCH DATA WITH FALLBACK
  const rawInvestments = await fetchAllInvestments();

  // Guard against QueryResult vs Array type mismatch
  const dataArray = Array.isArray(rawInvestments) 
    ? rawInvestments 
    : (rawInvestments as any)?.rows || [];

  // 4. CLEAN DATA
  const investments = dataArray.map((inv: any) => ({
    ...inv,
    amount: Math.round(Number(inv.amount)),
    monthly_interest: Math.round(Number(inv.monthly_interest)),
    status: inv.status || 'pending' 
  }));

  // FIX: Explicitly type 'acc' as number to satisfy TypeScript build
  const totalAmount = investments.reduce((acc: number, inv: any) => acc + inv.amount, 0);

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <WithdrawalAlert />

        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-green-800 tracking-tight uppercase">
              Admin Control Panel
            </h1>
            <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-widest">
              Logged in as: <span className="text-green-700">{rawRole}</span>
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10">
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Portfolio</p>
                <p className="text-2xl font-black text-gray-900">₦{totalAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <UserGroupIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Members</p>
                <p className="text-2xl font-black text-gray-900">{investments.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">
              Investment Verification Queue
            </h2>
          </div>
          
          <InvestmentTable 
            initialInvestments={investments} 
            isAdmin={isAdmin} 
          />
        </div>
      </div>
    </main>
  );
}