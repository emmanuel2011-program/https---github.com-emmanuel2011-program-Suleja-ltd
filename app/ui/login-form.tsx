'use client';

import { lusitana } from '@/app/ui/fonts';
import {
  AtSymbolIcon,
  KeyIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from '@/app/ui/button';
import { useActionState } from 'react';
import { authenticate } from '@/app/lib/actions';
import { useSearchParams } from 'next/navigation';
import clsx from 'clsx'; // Useful for toggling classes

export default function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  
  // Check if this is an investor login
  const isInvestor = searchParams.get('role') === 'investor';

  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-3">
      {/* Dynamic styling: Changes from gray/blue to green if investor */}
      <div className={clsx(
        "flex-1 rounded-lg px-6 pb-4 pt-8 border-t-4 shadow-md transition-colors",
        {
          'bg-green-50 border-green-600': isInvestor,
          'bg-gray-50 border-blue-600': !isInvestor,
        }
      )}>
        <h1 className={`${lusitana.className} mb-3 text-2xl font-bold ${isInvestor ? 'text-green-800' : 'text-gray-900'}`}>
          {isInvestor ? 'Investor Portal Login' : 'Admin Login'}
        </h1>
        <p className="text-xs text-gray-500 mb-4 italic">
          Please log in to continue to your dashboard.
        </p>
        
        <div className="w-full">
          <div>
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="email"
            >
              Email
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500 focus:ring-2 focus:ring-green-500"
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email address"
                required
              />
              <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500 focus:ring-2 focus:ring-green-500"
                id="password"
                type="password"
                name="password"
                placeholder="Enter password"
                required
                minLength={6}
              />
              <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-green-600" />
            </div>
          </div>
        </div>
        
        <input type="hidden" name="redirectTo" value={callbackUrl} />
        
        {/* Dynamic Button Color */}
        <Button 
          className={clsx(
            "mt-4 w-full transition-colors",
            isInvestor ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
          )} 
          aria-disabled={isPending}
        >
          Log in <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
        </Button>

        <div
          className="flex h-8 items-end space-x-1"
          aria-live="polite"
          aria-atomic="true"
        >
          {errorMessage && (
            <>
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-500">{errorMessage}</p>
            </>
          )}
        </div>
      </div>
    </form>
  );
}