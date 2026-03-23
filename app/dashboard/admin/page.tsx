// app/dashboard/admin/page.tsx
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { 
  UserGroupIcon, 
  CurrencyDollarIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline';
import { fetchAllInvestments } from '@/app/lib/actions'; // You'll need to create this
import InvestmentTable from '@/app/ui/investments/table'; 

export default async function AdminPage() {
  const session = await auth();

  // Server-side security check
  if ((session?.user as any)?.role !== 'admin') {
    redirect('/dashboard');
  }

  // FETCH REAL DATA
  const investments = await fetchAllInvestments();
  
  // Calculate stats dynamically
  const totalAmount = investments.reduce((acc, inv) => acc + Number(inv.amount), 0);
  const pendingCount = investments.filter(inv => inv.status !== 'active').length;

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-green-800 tracking-tight">
              Admin Control Panel
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              System overview for <span className="font-medium text-green-700">{session?.user?.email}</span>
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-green-100 flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl text-green-700">
              <UserGroupIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Investors</p>
              <p className="text-2xl font-black text-gray-900">{investments.length}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-green-100 flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl text-blue-700">
              <CurrencyDollarIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Capital</p>
              <p className="text-2xl font-black text-gray-900">₦{(totalAmount / 1000000).toFixed(1)}M</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-green-100 flex items-center gap-4 sm:col-span-2 lg:col-span-1">
            <div className="p-3 bg-yellow-100 rounded-xl text-yellow-700">
              <ClockIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Pending Approvals</p>
              <p className="text-2xl font-black text-gray-900">{pendingCount}</p>
            </div>
          </div>
        </div>

        {/* Real Investment Table */}
        <div className="mt-10">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Investment Verification Queue</h2>
          {/* We pass the real data into your table component here */}
          <InvestmentTable initialInvestments={investments} />
        </div>

      </div>
    </main>
  );
}