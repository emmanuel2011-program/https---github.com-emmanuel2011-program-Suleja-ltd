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
  
  // 1. UPDATED ROLE CHECK
  // Your database/sidenav uses 'user' for admins. 
  // We must match that exactly.
  const rawRole = (session?.user as any)?.role || '';
  const isAdmin = rawRole.toLowerCase() === 'user'; // CHANGED THIS LINE

  // 2. SECURITY REDIRECT
  if (!isAdmin) {
    redirect('/dashboard');
  }

  const rawInvestments = await fetchAllInvestments();

  // 3. CLEAN DATA
  const investments = (rawInvestments || []).map((inv: any) => ({
    ...inv,
    amount: Math.round(Number(inv.amount)),
    monthly_interest: Math.round(Number(inv.monthly_interest)),
    status: inv.status || 'pending' 
  }));

  const totalAmount = investments.reduce((acc, inv) => acc + inv.amount, 0);

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <WithdrawalAlert />

        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-green-800 tracking-tight uppercase">
              Admin Control Panel
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Logged in as: <span className="font-bold text-green-700">{rawRole}</span>
            </p>
          </div>
        </div>

        {/* ... Stats Grid ... */}

        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 uppercase tracking-tight text-gray-900">
              Investment Verification Queue
            </h2>
          </div>
          
          {/* Now isAdmin will be TRUE because rawRole is "user" */}
          <InvestmentTable 
            initialInvestments={investments} 
            isAdmin={isAdmin} 
          />
        </div>
      </div>
    </main>
  );
}