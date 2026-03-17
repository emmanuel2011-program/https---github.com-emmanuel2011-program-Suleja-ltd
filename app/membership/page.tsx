'use client';

import { useState } from 'react';
import MembershipForm from '@/app/ui/memberships/create-form';
import InvestmentForm from '@/app/ui/memberships/investment-form'; // New component
import Breadcrumbs from '@/app/ui/memberships/breadcrumbs';
import { UserPlusIcon, BanknotesIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function MembershipsPage() {
  const [formType, setFormType] = useState<'none' | 'membership' | 'investment'>('none');

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold text-green-700">Memberships & Investments</h1>
      <p className="text-green-600 mb-6">
        Manage cooperative members and financial investments in one place.
      </p>

      {/* Action Buttons: Only show if no form is active */}
      {formType === 'none' && (
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setFormType('membership')}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition shadow-md"
          >
            <UserPlusIcon className="h-5 w-5" />
            Register New Member
          </button>

          <button
            onClick={() => setFormType('investment')}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-md"
          >
            <BanknotesIcon className="h-5 w-5" />
            New Investment (7% Monthly)
          </button>
        </div>
      )}

      {/* Breadcrumbs & Back Button */}
      {formType !== 'none' && (
        <div className="flex items-center justify-between mb-6">
          <Breadcrumbs
            breadcrumbs={[
              { label: 'Directory', href: '/membership' },
              { 
                label: formType === 'membership' ? 'Register Member' : 'New Investment', 
                href: '/membership', 
                active: true 
              },
            ]}
          />
          <button 
            onClick={() => setFormType('none')}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
          >
            <ArrowLeftIcon className="h-4 w-4" /> Back to Directory
          </button>
        </div>
      )}

      {/* Conditional Form Rendering */}
      <section className="mt-6">
        {formType === 'membership' && <MembershipForm />}
        {formType === 'investment' && <InvestmentForm />}
      </section>
    </main>
  );
}