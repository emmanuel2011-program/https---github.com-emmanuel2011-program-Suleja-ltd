import { fetchGuarantors } from '@/app/lib/actions';
import VerifyGuarantorButton from '@/app/ui/loans/verify-button';
import { EyeIcon, DocumentMagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default async function Page() {
  const guarantors = await fetchGuarantors();

  return (
    <div className="w-full px-4 md:px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Guarantor Verification</h1>
        <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">
          {guarantors.length} Total Applications
        </span>
      </div>
      
      {/* Mobile View: Card Layout */}
      <div className="md:hidden space-y-4">
        {guarantors.map((g) => (
          <div key={g.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-md">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-black">Applicant & Amount</p>
                <p className="text-sm font-bold text-gray-900">{g.first_name} {g.surname}</p>
                {/* NEW: Displays the loan amount */}
                <p className="text-sm font-black text-green-600">₦{Number(g.loan_amount).toLocaleString()}</p>
              </div>
              {/* UPDATED: Pass the status to the button */}
              <VerifyGuarantorButton id={g.id} status={g.status} />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4 bg-gray-50 p-3 rounded-lg">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Guarantor</p>
                <p className="text-sm font-bold text-gray-800">{g.guarantor_name}</p>
                <p className="text-[10px] text-blue-600 font-medium">{g.guarantor_relationship}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Contact</p>
                <p className="text-sm text-gray-800">{g.guarantor_phone}</p>
              </div>
            </div>

            <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
              <a 
                href={g.guarantor_passport_url} 
                target="_blank" 
                className="flex-1 flex items-center justify-center gap-2 text-[11px] font-bold py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <EyeIcon className="h-3 w-3" /> Passport
              </a>
              <a 
                href={g.guarantor_id_url} 
                target="_blank" 
                className="flex-1 flex items-center justify-center gap-2 text-[11px] font-bold py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <DocumentMagnifyingGlassIcon className="h-3 w-3" /> ID Card
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View: Table Layout */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-50 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">Applicant & Loan</th>
              <th className="px-6 py-4">Guarantor Info</th>
              <th className="px-6 py-4 text-center">Documents</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {guarantors.map((g) => (
              <tr key={g.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-gray-900">{g.first_name} {g.surname}</p>
                  {/* NEW: Displays the loan amount */}
                  <p className="text-sm font-black text-green-600">₦{Number(g.loan_amount).toLocaleString()}</p>
                  <p className="text-[10px] text-gray-400 font-medium italic">Applied: {new Date(g.request_date).toLocaleDateString()}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-900 font-bold">{g.guarantor_name}</span>
                    <div className="items-center gap-2 flex">
                      <span className="text-[11px] text-gray-500">{g.guarantor_phone}</span>
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold uppercase">
                        {g.guarantor_relationship}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    <a 
                      href={g.guarantor_passport_url} 
                      target="_blank" 
                      title="View Passport"
                      className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </a>
                    <a 
                      href={g.guarantor_id_url} 
                      target="_blank" 
                      title="View ID Card"
                      className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                    >
                      <DocumentMagnifyingGlassIcon className="h-4 w-4" />
                    </a>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  {/* UPDATED: Passing the status column so the button knows to turn into a badge */}
                  <VerifyGuarantorButton id={g.id} status={g.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {guarantors.length === 0 && (
          <div className="text-center py-20 bg-gray-50">
            <p className="text-gray-400 font-medium">No pending guarantor verifications found.</p>
          </div>
        )}
      </div>
    </div>
  );
}