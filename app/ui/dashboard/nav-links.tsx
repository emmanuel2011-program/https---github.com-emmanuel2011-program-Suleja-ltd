'use client';

import {
  InformationCircleIcon, 
  PhoneIcon, 
  IdentificationIcon, 
  UsersIcon, 
  HomeIcon,
  BanknotesIcon,
  UserGroupIcon,
  BriefcaseIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const links = [
  // CHANGED 'admin' to 'user' across all administrative links
  { name: 'Home', href: '/dashboard', icon: HomeIcon, role: 'user' }, 
  { name: 'Membership', href: '/dashboard/membership', icon: IdentificationIcon, role: 'both' },
  { 
    name: 'My Investments', 
    href: '/dashboard/investments', 
    icon: BanknotesIcon, 
    role: 'both',
    showBadge: true 
  },
  { name: 'Active Portfolio', href: '/dashboard/active-loans', icon: BriefcaseIcon, role: 'user' },
  { name: 'Manage Customers', href: '/dashboard/customer', icon: UsersIcon, role: 'user' },
  { name: 'All Guarantors', href: '/dashboard/guarantors', icon: UserGroupIcon, role: 'user' },
  { name: 'Admin Panel', href: '/dashboard/admin', icon: ShieldCheckIcon, role: 'user' },
  { name: 'Contacts', href: '/dashboard/contacts', icon: PhoneIcon, role: 'both' },
  { name: 'About', href: '/dashboard/about', icon: InformationCircleIcon, role: 'both' },
];

export default function NavLinks({ 
  role, 
  pendingCount = 0 
}: { 
  role: string, 
  pendingCount?: number 
}) {
  const pathname = usePathname();
  // Ensure we are working with lowercase for safety
  const userRole = role?.toLowerCase(); 

  return (
    <div className="flex flex-col space-y-2">
      {links.map((link) => {
        // Now 'user' (from session) will match 'user' (in links array)
        const canSee = link.role === 'both' || link.role === userRole;
        if (!canSee) return null;

        const LinkIcon = link.icon;
        
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'flex h-[48px] w-full items-center justify-start gap-3 rounded-md bg-gray-50 px-3 py-2 text-sm font-medium transition-all hover:bg-green-100 hover:text-green-700',
              {
                'bg-green-100 text-green-700 border-l-4 border-green-600': pathname === link.href,
              },
            )}
          >
            <LinkIcon className="w-6" />
            <p className="block flex-1">{link.name}</p>

            {/* Updated badge logic to check for 'user' role */}
            {link.showBadge && userRole === 'user' && pendingCount > 0 && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-[10px] font-black text-white animate-pulse shadow-sm">
                {pendingCount}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}