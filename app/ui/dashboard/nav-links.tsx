'use client';

import {
  InformationCircleIcon, 
  PhoneIcon, 
  IdentificationIcon, 
  UsersIcon, 
  HomeIcon,
  BanknotesIcon,
  UserGroupIcon,
  // ADD THIS ICON:
  BriefcaseIcon 
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const links = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  { name: 'Membership', href: '/dashboard/membership', icon: IdentificationIcon },
  { name: 'Investments', href: '/dashboard/investments', icon: BanknotesIcon },
  // THIS IS YOUR NEW LINK:
  { name: 'Active Portfolio', href: '/dashboard/active-loans', icon: BriefcaseIcon },
  { name: 'Guarantors', href: '/dashboard/guarantors', icon: UserGroupIcon }, 
  { name: 'Customers', href: '/dashboard/customer', icon: UsersIcon },
  { name: 'Contacts', href: '/dashboard/contacts', icon: PhoneIcon },
  { name: 'About', href: '/dashboard/about', icon: InformationCircleIcon },
];

export default function NavLinks() {
  const pathname = usePathname();
  
  return (
    <div className="flex grow flex-row justify-start space-x-2 md:flex-col md:space-x-0 md:space-y-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'flex h-[48px] min-w-[75px] flex-shrink-0 flex-col items-center justify-center gap-1 rounded-md bg-gray-50 p-2 text-[10px] font-medium hover:bg-sky-100 hover:text-blue-600 md:h-[48px] md:min-w-0 md:flex-row md:justify-start md:gap-3 md:px-3 md:text-sm',
              {
                'bg-sky-100 text-blue-600': pathname === link.href,
              },
            )}
          >
            <LinkIcon className="w-5 md:w-6" />
            <p className="whitespace-nowrap">{link.name}</p>
          </Link>
        );
      })}
    </div>
  );
}