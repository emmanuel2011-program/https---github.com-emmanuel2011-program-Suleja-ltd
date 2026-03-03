'use client';

import { useState } from 'react';
import CooperativeLogo from '@/app/ui/cooperative-logo';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Bars3Icon, 
  XMarkIcon, 
  ArrowRightOnRectangleIcon, 
  ArrowLeftOnRectangleIcon 
} from '@heroicons/react/24/outline';
import { signOut } from 'next-auth/react'; // Import for client-side logout

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + '/');

  return (
    <Link
      href={href}
      className={`block px-3 py-2 rounded-md transition-colors ${
        isActive ? 'bg-green-600 text-white' : 'text-green-700 hover:bg-green-100 hover:text-green-900'
      }`}
    >
      {children}
    </Link>
  );
}

// Notice we added { session } as a prop here
export default function Header({ session }: { session: any }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-green-50 shadow px-6 py-4 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CooperativeLogo />
          <span className="font-bold text-lg text-green-700">Reg:19454</span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/about">About</NavLink>
          <NavLink href="/membership">Memberships</NavLink>
          <NavLink href="/loans">Loans</NavLink>
          <NavLink href="/contact">Contact</NavLink>
          
          {/* AUTH TOGGLE (Desktop) */}
          {session ? (
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="ml-4 flex items-center gap-2 rounded-full bg-red-600 px-5 py-2 text-white hover:bg-red-700 shadow-sm transition-all active:scale-95"
            >
              <span>Log out</span>
              <ArrowLeftOnRectangleIcon className="h-4 w-4" />
            </button>
          ) : (
            <Link
              href="/login"
              className="ml-4 flex items-center gap-2 rounded-full bg-green-700 px-5 py-2 text-white hover:bg-green-800 shadow-sm transition-all active:scale-95"
            >
              <span>Sign in</span>
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
            </Link>
          )}
        </nav>

        {/* Hamburger button (visible on small screens) */}
        <button
          className="md:hidden p-2 text-green-700"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile nav (toggle open/closed) */}
      {menuOpen && (
        <nav className="mt-4 flex flex-col gap-2 md:hidden text-sm font-medium border-t border-green-100 pt-4">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/about">About</NavLink>
          <NavLink href="/membership">Memberships</NavLink>
          <NavLink href="/loans">Loans</NavLink>
          <NavLink href="/contact">Contact</NavLink>
          
          {/* AUTH TOGGLE (Mobile) */}
          {session ? (
            <button
              onClick={() => signOut({ callbackUrl: '/', redirect: true })}
              className="mt-2 flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-3 text-white font-bold shadow-md"
            >
              <span>Log out</span>
              <ArrowLeftOnRectangleIcon className="h-5 w-5" />
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 rounded-md bg-green-700 px-4 py-3 text-white font-bold shadow-md"
            >
              <span>Sign in</span>
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}