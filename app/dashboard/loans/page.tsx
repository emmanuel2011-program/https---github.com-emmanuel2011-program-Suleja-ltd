import { sql } from '@vercel/postgres';
import { updateLoanStatus } from '@/app/lib/actions';
import { 
  CheckIcon, 
  XMarkIcon, 
  EyeIcon,
  BanknotesIcon 
} from '@heroicons/react/24/outline';

async function getPendingLoans() {
  const { rows } = await sql`
    SELECT * FROM loan_applications 
    WHERE status = 'pending' 
    ORDER BY request_date DESC`;
  return rows;
}

export default async function AdminLoansPage() {
  const loans = await getPendingLoans();

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Loan Approval Queue</h1>
        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
          {loans.length} Pending
        </div>
      </div>

      <div className="grid gap-6">
        {loans.map((loan) => (
          <div key={loan.id} className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              
              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-bold text-gray-900">{loan.first_name} {loan.surname}</h2>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    Ref: {loan.id.toString().slice(0, 8)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-4">{loan.email} • {loan.mobile_phone}</p>
                
                <div className="flex gap-4 items-center">
                  <div className="flex items-center text-green-700 font-semibold">
                    <BanknotesIcon className="h-5 w-5 mr-1" />
                    ₦{Number(loan.loan_amount).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    Duration: {loan.duration}
                  </div>
                </div>
              </div>

              {/* Document Links */}
              <div className="flex items-center gap-3 border-l border-r px-6">
                {loan.passport_url && (
                  <a href={loan.passport_url} target="_blank" className="flex flex-col items-center text-xs text-blue-600 hover:underline">
                    <EyeIcon className="h-5 w-5" /> Passport
                  </a>
                )}
                {loan.id_card_url && (
                  <a href={loan.id_card_url} target="_blank" className="flex flex-col items-center text-xs text-blue-600 hover:underline">
                    <EyeIcon className="h-5 w-5" /> ID Card
                  </a>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <form action={async () => {
                  'use server';
                  await updateLoanStatus(loan.id, 'approved', loan.email, loan.first_name);
                }}>
                  <button className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                    <CheckIcon className="h-4 w-4" /> Approve
                  </button>
                </form>

                <form action={async () => {
                  'use server';
                  await updateLoanStatus(loan.id, 'rejected', loan.email, loan.first_name);
                }}>
                  <button className="flex items-center gap-1 bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors">
                    <XMarkIcon className="h-4 w-4" /> Reject
                  </button>
                </form>
              </div>

            </div>
            
            {/* Purpose Tag */}
            <div className="mt-4 pt-4 border-t text-sm text-gray-600 italic">
              "Reason: {loan.purpose_of_loan}"
            </div>
          </div>
        ))}

        {loans.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed">
            <p className="text-gray-500">Your inbox is clear! No pending applications.</p>
          </div>
        )}
      </div>
    </div>
  );
}