import { fetchInvestments } from '@/app/lib/actions'; 
import { auth } from '@/auth'; 
import { WifiIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import InvestmentTable from '@/app/ui/investments/table'; 
import Search from '@/app/ui/search'; 

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  
  // 1. Get User Session
  const session = await auth();
  
  // FIX: Database uses 'user' for administrative access.
  // We check for 'user' and use toLowerCase() for safety.
  const userRole = (session?.user as any)?.role || '';
  const isAdmin = userRole.toLowerCase() === 'user';

  let safeInvestments: any[] = []; 
  let connectionError = false;

  try {
    const investments = await fetchInvestments(query);
    
    // 2. Clean and Round Data
    safeInvestments = (investments || []).map(inv => ({
      ...inv,
      amount: Math.round(Number(inv.amount)),
      monthly_interest: Math.round(Number(inv.monthly_interest)),
      status: inv.status || 'pending' 
    }));

  } catch (error) {
    console.error('Database connection error:', error);
    connectionError = true;
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
            Investment Portfolio
          </h1>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
            Suleja HH Co-op Management
          </p>
          {/* Visual indicator of the role the page is detecting */}
          <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${
            isAdmin ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}>
            Role: {isAdmin ? 'Administrator' : 'Investor'}
          </span>
        </div>

        {connectionError && (
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-lg border border-amber-100 animate-pulse self-start md:self-center">
            <WifiIcon className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-tighter">Connection Weak</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search by name, email, or status..." />
      </div>

      {connectionError && safeInvestments.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-center px-4">
           <ExclamationTriangleIcon className="h-12 w-12 text-gray-300 mb-2" />
           <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">
             Unable to load records
           </p>
           <p className="text-gray-400 text-sm mt-1">Please check your network and refresh the page.</p>
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