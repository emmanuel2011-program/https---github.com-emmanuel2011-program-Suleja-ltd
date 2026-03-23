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
  { name: 'Home', href: '/dashboard', icon: HomeIcon, role: 'both' },
  { name: 'Membership', href: '/dashboard/membership', icon: IdentificationIcon, role: 'investor' },
  
  // CHANGE THIS LINE: Change 'investor' to 'both'
  { name: 'My Investments', href: '/dashboard/investments', icon: BanknotesIcon, role: 'both' },
  
  { name: 'Active Portfolio', href: '/dashboard/active-loans', icon: BriefcaseIcon, role: 'investor' },
  
  // Admin Only Links
  { name: 'Manage Customers', href: '/dashboard/customer', icon: UsersIcon, role: 'admin' },
  { name: 'All Guarantors', href: '/dashboard/guarantors', icon: UserGroupIcon, role: 'admin' },
  { name: 'Admin Panel', href: '/dashboard/admin', icon: ShieldCheckIcon, role: 'admin' },

  { name: 'Contacts', href: '/dashboard/contacts', icon: PhoneIcon, role: 'both' },
  { name: 'About', href: '/dashboard/about', icon: InformationCircleIcon, role: 'both' },
];
export default function NavLinks({ user }: { user: any }) {
  const pathname = usePathname();
  const userRole = user?.role || 'investor';

  return (
    /* FIXED: 
       - Changed 'flex-row' to 'flex-col'
       - Changed 'space-x-2' to 'space-y-2'
       - Removed 'overflow-x-auto' 
    */
    <div className="flex flex-col space-y-2">
      {links.map((link) => {
        const canSee = link.role === 'both' || link.role === userRole;
        if (!canSee) return null;

        const LinkIcon = link.icon;
        
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              // FIXED: Removed min-w-[75px] and flex-shrink-0
              'flex h-[48px] w-full items-center justify-start gap-3 rounded-md bg-gray-50 px-3 py-2 text-sm font-medium transition-all hover:bg-green-100 hover:text-green-700',
              {
                'bg-green-100 text-green-700 border-l-4 border-green-600': pathname === link.href,
              },
            )}
          >
            <LinkIcon className="w-6" />
            <p className="block">{link.name}</p>
          </Link>
        );
      })}
    </div>
  );
}