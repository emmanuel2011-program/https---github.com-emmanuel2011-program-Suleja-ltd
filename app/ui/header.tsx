'use client';

import { useState } from 'react';
import CooperativeLogo from '@/app/ui/cooperative-logo';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + '/');

  return (
    <Link
      href={href}
      className={`block px-2 py-1 rounded ${
        isActive ? 'bg-green-600 text-white' : 'text-green-700 hover:text-green-900'
      }`}
    >
      {children}
    </Link>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-green-50 shadow px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CooperativeLogo />
          <span className="font-bold text-lg text-green-700">Suleja HH Cooperative</span>
        </div>

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

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-6 text-sm font-medium">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/about">About</NavLink>
          <NavLink href="/membership">Memberships</NavLink>
          <NavLink href="/loans">Loans</NavLink>
          <NavLink href="/contact">Contact</NavLink>
        </nav>
      </div>

      {/* Mobile nav (toggle open/closed) */}
      {menuOpen && (
        <nav className="mt-4 flex flex-col gap-2 md:hidden text-sm font-medium">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/about">About</NavLink>
          <NavLink href="/membership">Memberships</NavLink>
          <NavLink href="/loans">Loans</NavLink>
          <NavLink href="/contact">Contact</NavLink>
        </nav>
      )}
    </header>
  );
}
