import { fetchInvestments } from '@/app/lib/actions';
import { BanknotesIcon, EyeIcon } from '@heroicons/react/24/outline';
import { ApproveButton } from '@/app/ui/investments/buttons'; 

export default async function Page() {
  const investments = await fetchInvestments();

  return (
    <div className="w-full p-4 md:p-6 bg-gray-50/50 min-h-screen">
      <div className="flex w-full items-center justify-between mb-8">
        <h1 className="text-xl md:text-2xl font-black text-blue-900 flex items-center gap-2">
          <BanknotesIcon className="h-8 w-8 text-blue-600" />
          Investment Manager
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto"> 
          <table className="min-w-[900px] w-full text-gray-900 border-collapse">
            <thead className="bg-gray-100 border-b border-gray-200 text-left text-[11px] font-black uppercase tracking-widest text-gray-700">
              <tr>
                <th className="px-6 py-5">Customer Details</th>
                <th className="px-6 py-5">Investment Amount</th>
                <th className="px-6 py-5">7% ROI (Monthly)</th>
                <th className="px-6 py-5">Duration</th>
                <th className="px-6 py-5 text-center">Receipt</th>
                <th className="px-6 py-5 text-center">Status & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {investments.map((inv) => (
                <tr key={inv.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900 text-base">{inv.first_name} {inv.surname}</p>
                    <p className="text-xs text-blue-600 font-medium">{inv.member_email}</p>
                  </td>
                  <td className="px-6 py-4 font-black text-gray-900 text-lg">
                    ₦{Number(inv.amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-green-700 font-bold text-md">
                    +₦{Number(inv.monthly_interest).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {inv.duration}
                    </span>
                  </td>
                  
                  {/* Receipt Column */}
                  <td className="px-6 py-4 text-center">
                    {inv.receipt_url ? (
                      <a 
                        href={inv.receipt_url} 
                        target="_blank" 
                        className="inline-flex items-center gap-1.5 text-blue-700 hover:text-blue-900 font-black text-sm underline decoration-2"
                      >
                        <EyeIcon className="h-5 w-5" /> View Proof
                      </a>
                    ) : (
                      <span className="text-red-400 text-xs font-bold italic">No Receipt</span>
                    )}
                  </td>

                  {/* Status & Confirmation Button */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center gap-2">
                      <span className={`inline-block px-3 py-1 rounded-md text-[10px] font-black uppercase shadow-sm ${
                        inv.status === 'active' 
                          ? 'bg-green-600 text-white' 
                          : 'bg-amber-400 text-amber-900'
                      }`}>
                        {inv.status || 'pending'}
                      </span>
                      
                      {/* THIS IS THE MISSING PART: Show the button if not active */}
                      {inv.status?.toString().toLowerCase() !== 'active' && (
                        <div className="mt-2">
                            <ApproveButton id={inv.id} />
                        </div>
            )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {investments.length === 0 && (
          <div className="p-24 text-center">
            <p className="text-gray-500 font-bold text-lg">No investment records found.</p>
            <p className="text-gray-400 text-sm">New investments will appear here once members submit the form.</p>
          </div>
        )}
      </div>
    </div>
  );
}