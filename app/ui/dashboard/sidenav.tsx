import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';
import { PowerIcon } from '@heroicons/react/24/outline';
import { signOut } from '@/auth';
import { sql } from '@vercel/postgres';
import clsx from 'clsx';

export default async function SideNav({ user }: { user?: any }) {
  const role = user?.role?.toLowerCase() || 'investor';
  
  let pendingWithdrawals = 0;
  if (role === 'user' || role === 'admin') {
    const data = await sql`SELECT COUNT(*) FROM investment_withdrawals WHERE status = 'pending'`;
    pendingWithdrawals = Number(data.rows[0].count) || 0;
  }

  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2">
      <Link
        className="mb-2 flex h-20 items-end justify-start rounded-3xl bg-green-700 p-4 md:h-40 shadow-lg shadow-green-100"
        href={role === 'investor' ? "/dashboard/investments" : "/dashboard"}
      >
        <div className="w-32 text-white font-black uppercase tracking-tighter leading-none text-xl md:text-2xl">
          Suleja HH <br /> <span className="text-green-300">Co-op</span>
        </div>
      </Link>
      
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks role={role} pendingCount={pendingWithdrawals} />
        
        <div className="hidden h-auto w-full grow rounded-3xl bg-gray-50/50 md:block relative">
          <div className="absolute bottom-4 left-4">
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none mb-1">User Role</p>
            <span className={clsx(
              "inline-block px-2 py-1 rounded-lg text-[10px] font-black uppercase",
              role === 'investor' ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
            )}>
              {role}
            </span>
          </div>
        </div>
        
        <form action={async () => { 'use server'; await signOut(); }}>
          <button className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-2xl bg-gray-50 p-3 text-sm font-bold text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all md:flex-none md:justify-start md:p-2 md:px-3">
            <PowerIcon className="w-6" />
            <div className="hidden md:block uppercase tracking-tight">Sign Out</div>
          </button>
        </form>
      </div>
    </div>
  );
}