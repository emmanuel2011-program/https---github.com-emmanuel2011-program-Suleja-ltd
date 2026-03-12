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
import WeatherSnippet from '@/app/ui/weather-snippet';

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
  
  const isAdmin = session?.user?.email?.toLowerCase() === 'admin@shhmcsoc.me' || 
                  session?.user?.email?.toLowerCase() === 'info@shhmcsoc.me';

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
          
          <div className="hidden lg:block">
            <WeatherSnippet />
          </div>
        </div>

        {/* Desktop Navigation (Hidden on Mobile) */}
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

        {/* Mobile View Items (Always visible on small screens) */}
        <div className="flex items-center gap-3 md:hidden">
          {/* Mobile Weather */}
          <div className="scale-75 sm:scale-90 origin-right">
            <WeatherSnippet />
          </div>
          
          {/* MOBILE ENVELOPE - Added here for visibility on small screens */}
          {isAdmin && (
            <Link 
              href="/dashboard/loans" 
              className={`relative p-2 rounded-lg transition-colors border ${
                pathname.includes('/dashboard/loans') 
                  ? 'bg-green-600 text-white border-green-600 shadow-sm' 
                  : 'text-green-700 bg-white border-green-100'
              }`}
            >
              <EnvelopeIcon className="h-6 w-6" />
              {pendingCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm">
                  {pendingCount}
                </span>
              )}
            </Link>
          )}

          {/* Hamburger Toggle */}
          <button
            className="p-2 text-green-700 hover:bg-green-100 rounded-lg border border-green-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <nav className="mt-4 flex flex-col gap-1 md:hidden border-t border-green-100 pt-4 animate-in slide-in-from-top duration-200">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/membership">Memberships</NavLink>
          <NavLink href="/loans">Loans</NavLink>
          <NavLink href="/contact">Contact</NavLink>

          {session && <NavLink href="/dashboard">Dashboard</NavLink>}

          {isAdmin && (
            <NavLink href="/dashboard/loans">
              <div className="flex items-center justify-between w-full">
                <span>Loan Applications</span>
                {pendingCount > 0 && (
                  <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {pendingCount}
                  </span>
                )}
              </div>
            </NavLink>
          )}

          <div className="pt-4 mt-2 border-t border-green-100">
            {session ? (
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full flex items-center justify-between rounded-md bg-red-50 px-4 py-3 text-red-600 font-bold text-sm border border-red-100"
              >
                <span>Logout</span>
                <ArrowLeftOnRectangleIcon className="h-5 w-5" />
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="w-full flex items-center justify-between rounded-md bg-green-700 px-4 py-3 text-white font-bold text-sm shadow-md"
              >
                <span>Admin Login</span>
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}