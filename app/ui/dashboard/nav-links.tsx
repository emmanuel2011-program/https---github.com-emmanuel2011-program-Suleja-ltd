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
  // Changed Home to 'admin' so Investors land straight on Membership/Investments
  { name: 'Home', href: '/dashboard', icon: HomeIcon, role: 'admin' },
  { name: 'Membership', href: '/dashboard/membership', icon: IdentificationIcon, role: 'both' },
  { name: 'My Investments', href: '/dashboard/investments', icon: BanknotesIcon, role: 'both' },
  
  // Changed Active Portfolio to 'admin' (assuming this is the loan management side)
  { name: 'Active Portfolio', href: '/dashboard/active-loans', icon: BriefcaseIcon, role: 'admin' },
  
  // Admin Only Links
  { name: 'Manage Customers', href: '/dashboard/customer', icon: UsersIcon, role: 'admin' },
  { name: 'All Guarantors', href: '/dashboard/guarantors', icon: UserGroupIcon, role: 'admin' },
  { name: 'Admin Panel', href: '/dashboard/admin', icon: ShieldCheckIcon, role: 'admin' },

  { name: 'Contacts', href: '/dashboard/contacts', icon: PhoneIcon, role: 'both' },
  { name: 'About', href: '/dashboard/about', icon: InformationCircleIcon, role: 'both' },
];

export default function NavLinks({ role }: { role: string }) { // Change { user: any } to { role: string }
  const pathname = usePathname();
  
  // You no longer need to calculate userRole here because SideNav did it for you!
  const userRole = role; 

  return (
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
