import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';
import CooperativeLogo from '@/app/ui/cooperative-logo';
import { PowerIcon } from '@heroicons/react/24/outline';
import { signOut } from '@/auth';

// 1. Define what 'user' looks like to stop the red lines
interface SideNavProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
}

export default function SideNav({ user }: SideNavProps) {
  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2">
      <Link
        className="mb-2 flex h-20 items-center justify-start rounded-md bg-green-600 p-4 md:h-28"
        href="/"
      >
        <div className="text-white">
          <CooperativeLogo isDashboard={true} />
        </div>
      </Link>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        {/* 2. Pass the user down to NavLinks */}
        <NavLinks user={user} />
        
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>
        
        <form 
          action={async () => {
            'use server';
            await signOut({ redirectTo: '/' });
          }}
        >
          <button className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-green-100 hover:text-green-600 md:flex-none md:justify-start md:p-2 md:px-3">
            <PowerIcon className="w-6" />
            <div className="hidden md:block">Sign Out</div>
          </button>
        </form>
      </div>
    </div>
  );
}