import { fetchInvestments } from '@/app/lib/actions';
import { BanknotesIcon } from '@heroicons/react/24/outline';
import InvestmentTable from '@/app/ui/investments/investment-table';

// 1. Must be 'export default'
// 2. Must be 'async' since it's a Server Component fetching data
export default async function Page() {
  // Fetch data safely
  const investments = await fetchInvestments();

  // Handle null/undefined data to prevent the .map error
  const safeInvestments = investments || [];

  return (
    <div className="w-full p-4 md:p-6 bg-gray-50/50 min-h-screen">
      <div className="flex w-full items-center justify-between mb-8">
        <h1 className="text-xl md:text-2xl font-black text-blue-900 flex items-center gap-2">
          <BanknotesIcon className="h-8 w-8 text-blue-600" />
          Investment Manager
        </h1>
      </div>

      {/* This is the Client Component we created in the last step.
         Make sure the file path below matches where you saved it!
      */}
      <InvestmentTable initialInvestments={safeInvestments} />
    </div>
  );
}