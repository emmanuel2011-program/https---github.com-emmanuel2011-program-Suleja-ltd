import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';
import { PowerIcon } from '@heroicons/react/24/outline';
import { signOut } from '@/auth';

// 1. Properly define the User and Props
interface SideNavProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
}

// 2. Apply the interface to the component
export default function SideNav({ user }: SideNavProps) {
  // We extract the role, defaulting to 'investor' for safety
  const role = user?.role || 'investor';

  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2">
      <Link
        className="mb-2 flex h-20 items-end justify-start rounded-md bg-green-600 p-4 md:h-40"
        href="/"
      >
        <div className="w-32 text-white font-black uppercase tracking-tighter leading-none">
          Suleja HH <br /> Co-op
        </div>
      </Link>
      
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        {/* Pass the strictly typed role down */}
        <NavLinks role={role} />
        
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>
        
        <form
          action={async () => {
            'use server';
            await signOut();
          }}
        >
          <button className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-red-50 hover:text-red-600 md:flex-none md:justify-start md:p-2 md:px-3">
            <PowerIcon className="w-6" />
            <div className="hidden md:block">Sign Out</div>
          </button>
        </form>
      </div>
    </div>
  );
}