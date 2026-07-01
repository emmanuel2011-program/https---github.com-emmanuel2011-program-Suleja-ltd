import { sql } from '@vercel/postgres';
import { BanknotesIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { approveWithdrawal } from '@/app/lib/actions';

export default async function WithdrawalsPage() {
  // Fetch all pending withdrawal requests
  const { rows: requests } = await sql`
    SELECT w.*, m.first_name, m.surname 
    FROM investment_withdrawals w
    JOIN memberships m ON w.member_id = m.id
    WHERE w.status = 'pending'
    ORDER BY w.request_date DESC
  `;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-black flex items-center gap-2 mb-6">
        <BanknotesIcon className="h-8 w-8 text-red-600" />
        Pending Payouts
      </h1>

      <div className="grid gap-4">
        {requests.map((req) => (
          <div key={req.id} className="bg-white p-6 rounded-xl shadow-sm border flex justify-between items-center">
            <div>
              <p className="font-black text-lg">{req.first_name} {req.surname}</p>
              <p className="text-sm text-gray-500">Bank: <strong>{req.bank_name}</strong> | Acct: <strong>{req.account_number}</strong></p>
              <p className="text-red-600 font-bold mt-1">Amount: ₦{Number(req.amount).toLocaleString()}</p>
            </div>
            
            <form action={async () => {
              'use server';
              await approveWithdrawal(req.id);
            }}>
              <button className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-green-700">
                <CheckCircleIcon className="h-5 w-5" />
                Confirm Paid
              </button>
            </form>
          </div>
        ))}

        {requests.length === 0 && (
          <p className="text-center py-10 text-gray-400 font-medium">No pending withdrawal requests.</p>
        )}
      </div>
    </div>
  );
}