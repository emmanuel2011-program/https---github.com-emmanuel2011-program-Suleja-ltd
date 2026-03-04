'use client';

import { useState } from 'react';
import CooperativeLogo from '@/app/ui/cooperative-logo';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Bars3Icon, 
  XMarkIcon, 
  ArrowRightOnRectangleIcon, 
  ArrowLeftOnRectangleIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import { signOut } from 'next-auth/react';
import WeatherSnippet from '@/app/ui/weather-snippet'; // Import the new component

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + '/');

  return (
    <Link
      href={href}
      className={`block px-3 py-2 rounded-md transition-colors font-medium ${
        isActive 
          ? 'bg-green-600 text-white shadow-sm' 
          : 'text-green-800 hover:bg-green-100'
      }`}
    >
      {children}
    </Link>
  );
}

export default function Header({ session, pendingCount = 0 }: { session: any; pendingCount?: number }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  
  const isAdmin = session?.user?.email === 'admin@shhmcsoc.me' || session?.user?.email === 'info@shhmcsoc.me';

  return (
    <header className="bg-green-50 shadow-sm px-6 py-4 sticky top-0 z-50 border-b border-green-100">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo & Weather Section */}
        <div className="flex items-center gap-4">
          <Link href="/" onClick={() => setMenuOpen(false)}>
            <CooperativeLogo />
          </Link>
          <div className="hidden sm:block border-l border-green-200 pl-3">
            <span className="font-bold text-sm text-green-700 block leading-tight">SulejaHH</span>
            <span className="text-[10px] text-green-600 uppercase tracking-widest">Reg: 19454</span>
          </div>
          
          {/* WEATHER ADDED HERE */}
          <div className="hidden lg:block">
            <WeatherSnippet />
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2 text-sm">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/membership">Memberships</NavLink>
          <NavLink href="/loans">Loans</NavLink>
          <NavLink href="/contact">Contact</NavLink>

          {session && <NavLink href="/dashboard">Dashboard</NavLink>}

          {isAdmin && (
            <Link 
              href="/dashboard/loans" 
              className={`relative p-2 rounded-full transition-colors ${
                pathname.includes('/dashboard/loans') ? 'bg-green-600 text-white' : 'text-green-700 hover:bg-green-200'
              }`}
            >
              <EnvelopeIcon className="h-6 w-6" />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-green-50 animate-bounce">
                  {pendingCount}
                </span>
              )}
            </Link>
          )}
          
          <div className="ml-4 border-l pl-4 border-green-200">
            {session ? (
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-red-600 hover:bg-red-600 hover:text-white transition-all text-xs font-bold border border-red-100"
              >
                <span>Logout</span>
                <ArrowLeftOnRectangleIcon className="h-4 w-4" />
              </button>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-full bg-green-700 px-5 py-2 text-white hover:bg-green-800 shadow-md transition-all text-xs font-bold"
              >
                <span>Admin Login</span>
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
              </Link>
            )}
          </div>
        </nav>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-3 md:hidden">
          <div className="scale-90"><WeatherSnippet /></div>
          <button
            className="p-2 text-green-700 hover:bg-green-100 rounded-lg"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu (same as yours) */}
      {/* ... */}
    </header>
  );
}