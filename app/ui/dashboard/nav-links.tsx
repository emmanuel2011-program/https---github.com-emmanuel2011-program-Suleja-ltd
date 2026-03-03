'use client';

import {
  InformationCircleIcon, PhoneIcon, IdentificationIcon, UsersIcon, HomeIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const links = [
  { name: 'About', href: '/dashboard/about', icon: InformationCircleIcon },
  { name: 'Contacts', href: '/dashboard/contacts', icon: PhoneIcon },
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  { name: 'Membership', href: '/dashboard/membership', icon: IdentificationIcon },
  { name: 'Customers', href: '/dashboard/customer', icon: UsersIcon },
];

export default function NavLinks() {
  const pathname = usePathname();
  
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              /* CHANGED: h-[48px] -> h-[38px] (shorter) */
              /* CHANGED: p-3 -> p-2 (less padding) */
              /* CHANGED: text-sm -> text-xs (smaller font) */
              'flex h-[38px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-2 text-xs font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:px-3',
              {
                'bg-sky-100 text-blue-600': pathname === link.href,
              },
            )}
          >
            {/* CHANGED: w-6 -> w-5 (smaller icon) */}
            <LinkIcon className="w-5" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}