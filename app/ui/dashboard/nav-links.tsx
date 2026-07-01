'use client';

import {
  InformationCircleIcon, PhoneIcon, IdentificationIcon, UsersIcon, 
  HomeIcon, BanknotesIcon, UserGroupIcon, BriefcaseIcon, ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const links = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon, role: 'user' }, 
  { name: 'Membership', href: '/dashboard/membership', icon: IdentificationIcon, role: 'both' },
  { name: 'My Investments', href: '/dashboard/investments', icon: BanknotesIcon, role: 'both' },
  { name: 'Active Portfolio', href: '/dashboard/active-loans', icon: BriefcaseIcon, role: 'user' },
  { name: 'Manage Customers', href: '/dashboard/customer', icon: UsersIcon, role: 'user' },
  { name: 'All Guarantors', href: '/dashboard/guarantors', icon: UserGroupIcon, role: 'user' },
  { name: 'Admin Panel', href: '/dashboard/admin', icon: ShieldCheckIcon, role: 'user', showBadge: true },
  { name: 'Contacts', href: '/dashboard/contacts', icon: PhoneIcon, role: 'both' },
  { name: 'About', href: '/dashboard/about', icon: InformationCircleIcon, role: 'both' },
];

export default function NavLinks({ role, pendingCount = 0 }: { role: string, pendingCount?: number }) {
  const pathname = usePathname();
  const userRole = role?.toLowerCase(); 

  return (
    <div className="flex flex-row space-x-1 md:flex-col md:space-x-0 md:space-y-2 overflow-x-auto no-scrollbar">
      {links.map((link) => {
        const canSee = link.role === 'both' || userRole === 'user' || userRole === 'admin';
        if (!canSee) return null;

        const LinkIcon = link.icon;
        const isActive = pathname === link.href;
        
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'flex h-[48px] grow items-center justify-center gap-3 rounded-2xl p-3 text-sm font-bold transition-all md:flex-none md:justify-start md:p-2 md:px-3',
              isActive 
                ? 'bg-green-100 text-green-700 shadow-sm border-b-2 md:border-b-0 md:border-l-4 border-green-600' 
                : 'bg-gray-50 text-gray-600 hover:bg-green-50 hover:text-green-600'
            )}
          >
            <div className="relative">
              <LinkIcon className="w-6" />
              {link.showBadge && pendingCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[8px] font-black text-white animate-pulse">
                  {pendingCount}
                </span>
              )}
            </div>
            <p className="hidden md:block uppercase tracking-tight">{link.name}</p>
          </Link>
        );
      })}
    </div>
  );
}