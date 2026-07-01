'use client';

import { useState } from 'react';
import MembershipForm from '@/app/ui/memberships/create-form';
import InvestmentForm from '@/app/ui/memberships/investment-form'; // Ensure this matches your filename
import Breadcrumbs from '@/app/ui/memberships/breadcrumbs';
import { UserPlusIcon, BanknotesIcon, ArrowLeftIcon, ChartBarIcon } from '@heroicons/react/24/outline';

export default function MembershipsPage() {
  const [formType, setFormType] = useState<'none' | 'membership' | 'investment'>('none');

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Sforte Financial Hub</h1>
          <p className="text-gray-500 font-medium">
            Register cooperative members and manage flexible ROI investments.
          </p>
        </div>
        
        {/* Back Button - Only shows when a form is open */}
        {formType !== 'none' && (
          <button 
            onClick={() => setFormType('none')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all w-fit"
          >
            <ArrowLeftIcon className="h-4 w-4" /> Exit to Directory
          </button>
        )}
      </div>

      {/* Action Buttons: Only show if no form is active */}
      {formType === 'none' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Member Registration Card */}
          <button
            onClick={() => setFormType('membership')}
            className="group flex flex-col p-8 bg-white border-2 border-gray-100 rounded-3xl hover:border-green-500 hover:shadow-xl hover:shadow-green-50/50 transition-all text-left"
          >
            <div className="bg-green-100 p-3 rounded-2xl w-fit mb-4 group-hover:bg-green-600 transition-colors">
              <UserPlusIcon className="h-8 w-8 text-green-600 group-hover:text-white" />
            </div>
            <h3 className="text-xl font-black text-gray-900">Register New Member</h3>
            <p className="text-gray-500 mt-2 text-sm">Add a new person to the Sforte Cooperative directory.</p>
          </button>

          {/* Flexible Investment Card */}
          <button
            onClick={() => setFormType('investment')}
            className="group flex flex-col p-8 bg-white border-2 border-gray-100 rounded-3xl hover:border-blue-600 hover:shadow-xl hover:shadow-blue-50/50 transition-all text-left"
          >
            <div className="bg-blue-100 p-3 rounded-2xl w-fit mb-4 group-hover:bg-blue-600 transition-colors">
              <ChartBarIcon className="h-8 w-8 text-blue-600 group-hover:text-white" />
            </div>
            <h3 className="text-xl font-black text-gray-900">New Investment</h3>
            <p className="text-gray-500 mt-2 text-sm">Create an investment with 6%, 7%, or 8% ROI options.</p>
          </button>
        </div>
      )}

      {/* Conditional Form Rendering */}
      <section className="mt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {formType === 'membership' && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-green-600 p-4 text-white font-black text-xs uppercase tracking-widest">Membership Registration</div>
            <MembershipForm />
          </div>
        )}
        
        {formType === 'investment' && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-blue-600 p-4 text-white font-black text-xs uppercase tracking-widest">Flexible ROI Investment Setup</div>
            {/* The InvestmentForm will now handle the 6%, 7%, 8% selection logic inside it */}
            <InvestmentForm />
          </div>
        )}
      </section>
    </main>
  );
}