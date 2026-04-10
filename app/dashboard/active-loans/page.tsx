// 1. REMOVE 'use client' from the very top
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

  // Define the server action to handle the update
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
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Active Loan Portfolio</h1>
          <p className="text-sm text-gray-500">Manage repayments and monitor loan balances.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <ExportActiveLoans data={loans} />
          <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
            <BanknotesIcon className="h-5 w-5" />
            {loans.length} Active
          </div>
        </div>
      </div>

      <div className="mb-6 max-w-md">
        <Search placeholder="Search by Applicant TIN..." />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left">
            <thead className="bg-gray-50 uppercase text-[10px] font-black text-gray-500 tracking-widest">
              <tr>
                <th className="px-4 py-4">Applicant</th>
                <th className="px-4 py-4">Total Due</th>
                <th className="px-4 py-4 text-red-600">Balance Owed</th>
                <th className="px-4 py-4">Payment History</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4 bg-green-50 text-green-700 text-center">Update Repayment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loans.map((loan) => {
                const principal = Number(loan.loan_amount || 0);
                const interestRate = parseFloat(String(loan.interest || '15').replace('%', '')) / 100;
                const totalDue = principal + (principal * interestRate);
                const paidSoFar = Number(loan.amount_paid || 0);
                const remainingBalance = totalDue - paidSoFar;
                const isFullyPaid = remainingBalance <= 0.01;

                return (
                  <tr key={loan.id} className="hover:bg-gray-50 transition-colors text-sm">
                    <td className="px-4 py-4">
                      <p className="font-bold text-gray-900 uppercase leading-none">
                        {loan.first_name} {loan.surname}
                      </p>
                      <div className="flex flex-col gap-1 mt-2">
                        <p className="text-[10px] font-mono text-gray-400">TIN: {loan.tin || 'N/A'}</p>
                        {/* THE DATE FIELD */}
                        <p className="text-[11px] font-bold text-blue-600 flex items-center gap-1">
                          <ClockIcon className="h-3 w-3" />
                          Applied: {loan.request_date ? new Date(loan.request_date).toLocaleDateString('en-GB') : 'N/A'}
                        </p>
                      </div>
                    </td>

                    <td className="px-4 py-4 font-medium text-gray-600">
                      ₦{totalDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>

                    <td className="px-4 py-4 text-red-600 font-black">
                      ₦{Math.max(0, remainingBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        <p className="text-[11px] font-bold text-green-700">Paid: ₦{paidSoFar.toLocaleString()}</p>
                        <p className="text-[10px] flex items-center gap-1 text-gray-400">
                          <CalendarDaysIcon className="h-3 w-3" />
                          Last Pay: {loan.last_payment_date 
                            ? new Date(loan.last_payment_date).toLocaleDateString('en-GB') 
                            : 'No history'}
                        </p>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-center">
                      {isFullyPaid ? (
                         <span className="px-2 py-1 rounded-full text-[10px] font-black bg-blue-100 text-blue-700 uppercase">Settled</span>
                      ) : (
                         <span className="px-2 py-1 rounded-full text-[10px] font-black bg-green-100 text-green-700 uppercase">Active</span>
                      )}
                    </td>

                    <td className="px-4 py-4 bg-green-50/30">
                      {!isFullyPaid && (
                        <form 
                          action={handleUpdate.bind(null, loan.id)} 
                          className="flex items-center justify-center gap-2"
                        >
                          <input 
                            name="amount" 
                            type="number" 
                            step="0.01" 
                            placeholder="Amt"
                            className="w-20 px-2 py-1 border border-green-200 rounded text-xs text-gray-900"
                            required 
                          />
                          <button type="submit" className="bg-green-700 text-white px-3 py-1 rounded text-[10px] font-black uppercase hover:bg-green-800 transition-colors">
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