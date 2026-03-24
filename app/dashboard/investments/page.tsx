import { fetchInvestments } from '@/app/lib/actions';
import { BanknotesIcon, WifiIcon } from '@heroicons/react/24/outline';
import InvestmentTable from '@/app/ui/investments/investment-table';

export default async function Page() {
  // 1. Define it here with 'let' and a Type so the whole function can see it
  let safeInvestments: any[] = []; 
  let connectionError = false;

  try {
    const investments = await fetchInvestments();
    // 2. Assign the value here (No 'const' here!)
    safeInvestments = investments || [];
  } catch (error) {
    console.error('Database connection timed out:', error);
    connectionError = true;
  }

  return (
    <div>
      {/* 3. Now this component can see it without squiggles! */}
      <InvestmentTable initialInvestments={safeInvestments} />
    </div>
  );
}