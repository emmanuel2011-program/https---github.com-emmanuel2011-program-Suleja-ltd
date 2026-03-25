import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';
import { PowerIcon } from '@heroicons/react/24/outline';
import { signOut } from '@/auth';
import { sql } from '@vercel/postgres'; // Import SQL to check for alerts

interface SideNavProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
}

export default async function SideNav({ user }: SideNavProps) {
  const role = user?.role || 'investor';
  
  // 1. Fetch pending withdrawal count ONLY for Admins
  let pendingWithdrawals = 0;
  if (role === 'admin') {
    const data = await sql`SELECT COUNT(*) FROM investment_withdrawals WHERE status = 'pending'`;
    pendingWithdrawals = Number(data.rows[0].count) || 0;
  }

  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2">
      <Link
        className="mb-2 flex h-20 items-end justify-start rounded-3xl bg-green-700 p-4 md:h-40 shadow-lg shadow-green-100"
        href="/dashboard"
      >
        <div className="w-32 text-white font-black uppercase tracking-tighter leading-none text-xl">
          Suleja HH <br /> <span className="text-green-300">Co-op</span>
        </div>
      </Link>
      
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        {/* 2. Pass role AND pending count to NavLinks */}
        <NavLinks role={role} pendingCount={pendingWithdrawals} />
        
        <div className="hidden h-auto w-full grow rounded-3xl bg-gray-50/50 md:block">
          {/* 3. Small Profile Summary at the bottom of the empty space */}
          <div className="mt-auto p-4 hidden md:block">
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Logged in as</p>
            <p className="text-xs font-bold text-gray-700 truncate">{user?.name || 'User'}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-green-100 text-[9px] font-black text-green-700 uppercase">
              {role}
            </span>
          </div>
        </div>
        
        <form
          action={async () => {
            'use server';
            await signOut();
          }}
        >
          <button className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-2xl bg-gray-50 p-3 text-sm font-bold text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all md:flex-none md:justify-start md:p-2 md:px-3">
            <PowerIcon className="w-6" />
            <div className="hidden md:block uppercase tracking-tight">Sign Out</div>
          </button>
        </form>
      </div>
    </div>
  );
}