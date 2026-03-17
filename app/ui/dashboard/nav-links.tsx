'use client';

import {
  InformationCircleIcon, 
  PhoneIcon, 
  IdentificationIcon, 
  UsersIcon, 
  HomeIcon,
  BanknotesIcon 
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const links = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  { name: 'Membership', href: '/dashboard/membership', icon: IdentificationIcon },
  { name: 'Investments', href: '/dashboard/investments', icon: BanknotesIcon },
  { name: 'Customers', href: '/dashboard/customer', icon: UsersIcon },
  { name: 'Contacts', href: '/dashboard/contacts', icon: PhoneIcon },
  { name: 'About', href: '/dashboard/about', icon: InformationCircleIcon },
];

export default function NavLinks() {
  const pathname = usePathname();
  
  return (
    <>
      {/* On Mobile: use 'flex-row overflow-x-auto' so users can swipe 
         On Desktop: 'md:flex-col' keeps them in a list 
      */}
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2 overflow-x-auto pb-2 md:pb-0">
        {links.map((link) => {
          const LinkIcon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={clsx(
                'flex h-[38px] min-w-[80px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-2 text-[10px] font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:px-3 md:text-xs',
                {
                  'bg-sky-100 text-blue-600': pathname === link.href,
                },
              )}
            >
              <LinkIcon className="w-5 flex-shrink-0" />
              {/* On very small screens, the text is often what breaks the layout */}
              <p className="hidden md:block">{link.name}</p>
              
              {/* Mobile-only text label (Optional: remove 'hidden' if you want tiny text below icons) */}
              <p className="block md:hidden text-[9px] whitespace-nowrap">{link.name}</p>
            </Link>
          );
        })}
      </div>
    </>
  );
}