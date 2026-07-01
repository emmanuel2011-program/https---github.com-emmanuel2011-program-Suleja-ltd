import { fetchActiveLoans, updateLoanPayment } from '@/app/lib/actions';
import ExportActiveLoans from '@/app/ui/loans/export-button'; 
import { BanknotesIcon, CalendarDaysIcon, ClockIcon } from '@heroicons/react/24/outline';
import Search from '@/app/ui/search'; 
import { revalidatePath } from 'next/cache';

export default async function Page(props: {
  searchParams?: Promise<{ query?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const loans = await fetchActiveLoans(query);

  async function handleUpdate(loanId: string, formData: FormData) {
    'use server';
    const amountStr = formData.get('amount') as string;
    const amount = parseFloat(amountStr);
    
    if (!isNaN(amount) && amount > 0) {
      await updateLoanPayment(loanId, amount);
      revalidatePath('/dashboard/active-loans');
    }
  }

  return (
    <div className="w-full px-2 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-tight">Active Loan Portfolio</h1>
          <p className="text-xs md:text-sm text-gray-500">Repayments grow with interest every 30 days.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <ExportActiveLoans data={loans} />
          <div className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold flex items-center gap-2">
            <BanknotesIcon className="h-4 w-4 md:h-5 md:w-5" />
            {loans.length} Active
          </div>
        </div>
      </div>

      <div className="mb-6 w-full max-w-md">
        <Search placeholder="Search by Applicant TIN..." />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="min-w-[850px] md:min-w-full divide-y divide-gray-200 text-left">
            <thead className="bg-gray-50 uppercase text-[9px] md:text-[10px] font-black text-gray-500 tracking-widest">
              <tr>
                <th className="px-4 py-4">Applicant & Applied Date</th>
                <th className="px-4 py-4">Original Loan</th>
                <th className="px-4 py-4 text-red-600">Total Accrued Owed</th>
                <th className="px-4 py-4">Repayment History</th>
                <th className="px-4 py-4 text-center">Cycle</th>
                <th className="px-4 py-4 bg-green-50 text-green-700 text-center">Update Repayment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loans.map((loan) => {
                // Ensure date parsing is robust for local/remote
                const requestDateObj = new Date(loan.request_date);
                const appliedDate = loan.request_date ? requestDateObj.toLocaleDateString('en-GB') : 'N/A';
                
                const today = new Date();
                const diffTime = Math.max(0, today.getTime() - requestDateObj.getTime());
                const diffDays = diffTime / (1000 * 60 * 60 * 24);
                const monthsElapsed = Math.ceil(diffDays / 30) || 1;

                const principal = parseFloat(loan.loan_amount) || 0;
                const monthlyInterestRate = parseFloat(String(loan.interest || '0').replace('%', ''));
                const totalInterestAccrued = (principal * (monthlyInterestRate / 100)) * monthsElapsed;
                const totalDebt = principal + totalInterestAccrued;
                
                const paidSoFar = Number(loan.amount_paid || 0);
                const remainingBalance = totalDebt - paidSoFar;
                const isFullyPaid = remainingBalance <= 0.99;

                return (
                  <tr key={loan.id} className="hover:bg-gray-50 transition-colors text-xs md:text-sm">
                    <td className="px-4 py-4">
                      <p className="font-bold text-gray-900 uppercase leading-tight">
                        {loan.first_name} {loan.surname}
                      </p>
                      <div className="flex flex-col gap-0.5 mt-1">
                        <p className="text-[9px] font-mono text-gray-400">TIN: {loan.tin || 'N/A'}</p>
                        <div className="flex items-center gap-1 text-[9px] font-bold text-blue-600 uppercase">
                          <CalendarDaysIcon className="h-3 w-3" />
                          Applied: {appliedDate}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-gray-600">
                      ₦{principal.toLocaleString()}
                      <p className="text-[9px] text-gray-400">Rate: {monthlyInterestRate}% / mo</p>
                    </td>

                    <td className="px-4 py-4 text-red-600 font-black">
                      ₦{Math.max(0, remainingBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      <div className="flex items-center gap-1 text-[9px] text-red-400 font-bold uppercase">
                         <ClockIcon className="h-3 w-3" />
                         +{monthsElapsed} Months Interest
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        <p className="text-[10px] md:text-[11px] font-bold text-green-700">Paid: ₦{paidSoFar.toLocaleString()}</p>
                        <p className="text-[9px] text-gray-400">
                          Last: {loan.last_payment_date ? new Date(loan.last_payment_date).toLocaleDateString('en-GB') : 'None'}
                        </p>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-center">
                       <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${
                         isFullyPaid ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                       }`}>
                         {isFullyPaid ? 'Settled' : `C-${monthsElapsed}`}
                       </span>
                    </td>

                    <td className="px-4 py-4 bg-green-50/20">
                      {!isFullyPaid && (
                        <form action={handleUpdate.bind(null, loan.id)} className="flex items-center justify-center gap-1">
                          <input 
                            name="amount" 
                            type="number" 
                            step="0.01" 
                            placeholder="Amt"
                            className="w-16 md:w-20 px-1.5 py-1 border border-green-200 rounded text-[10px]"
                            required 
                          />
                          <button type="submit" className="bg-green-700 text-white px-2 py-1 rounded text-[9px] font-black uppercase shadow-sm">
                            Add
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}