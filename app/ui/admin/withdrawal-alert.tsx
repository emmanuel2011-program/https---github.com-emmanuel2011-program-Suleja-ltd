import { BanknotesIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { sql } from '@vercel/postgres';

export default async function WithdrawalAlert() {
  // 1. Fetching count, total, and the specific email making the request
  const data = await sql`
    SELECT 
      COUNT(*) as count, 
      SUM(amount) as total,
      (SELECT member_email FROM investment_withdrawals WHERE status = 'pending' LIMIT 1) as target_email
    FROM investment_withdrawals 
    WHERE status = 'pending'
  `;

  const pendingCount = Number(data.rows[0].count) || 0;
  const totalValue = Number(data.rows[0].total) || 0;
  const targetEmail = data.rows[0].target_email;

  // Hide the alert if no one is waiting for a withdrawal
  if (pendingCount === 0 || !targetEmail) return null; 

  return (
    <div className="mb-8 overflow-hidden rounded-3xl border-2 border-red-100 bg-white shadow-sm transition-all hover:border-red-200">
      <div className="flex flex-col md:flex-row items-center justify-between p-6 gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <BanknotesIcon className="h-8 w-8 animate-bounce" />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Withdrawal Requests</h3>
            <p className="text-sm font-medium text-gray-500">
              There are <span className="text-red-600 font-bold">{pendingCount}</span> requests totaling 
              <span className="text-gray-900 font-bold ml-1 text-base">₦{totalValue.toLocaleString()}</span>
            </p>
          </div>
        </div>

        {/* This link directs the Admin to the filtered view of the specific investor */}
        <Link
          href={`/dashboard/admin?query=${encodeURIComponent(targetEmail)}#verification-queue`} 
          className="group flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-gray-800 active:scale-95 shadow-lg shadow-gray-200"
        >
          Review & Approve
          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
      
      {/* Visual background pulse */}
      <div className="h-1.5 w-full bg-red-50">
        <div className="h-full bg-red-600 animate-pulse" style={{ width: '100%' }}></div>
      </div>
    </div>
  );
}