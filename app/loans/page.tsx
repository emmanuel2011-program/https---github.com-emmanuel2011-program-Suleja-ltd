'use client';

import { useState } from 'react';
import Link from 'next/link';
import LoanForm from '@/app/ui/loans/create-form';
import GuarantorForm from '@/app/ui/loans/guarantor-form'; // Assuming this is your guarantor component
import Breadcrumbs from '@/app/ui/loans/breadcrumbs';
import { DocumentPlusIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function LoansPage() {
  const [activeForm, setActiveForm] = useState<'none' | 'loan' | 'both'>('none');

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      {/* Page heading */}
      <h1 className="text-2xl font-bold text-green-700">Loan Services</h1>
      <p className="text-green-600 mb-6">
        Manage our loan services here. You can view loan records, apply for new loans, or register as a guarantor.
      </p>

      {/* Action Buttons */}
      {activeForm === 'none' && (
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setActiveForm('loan')}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-md"
          >
            <DocumentPlusIcon className="h-5 w-5" />
            Apply for Loan
          </button>
          
          <button
            onClick={() => setActiveForm('both')}
            className="inline-flex items-center gap-2 bg-blue-700 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-800 transition shadow-md"
          >
            <ShieldCheckIcon className="h-5 w-5" />
            Open Full Portal (Loan & Guarantor)
          </button>
        </div>
      )}

      {/* Breadcrumbs */}
      {activeForm !== 'none' && (
        <div className="flex justify-between items-center mb-6">
          <Breadcrumbs
            breadcrumbs={[
              { label: 'Loans', href: '/loans' },
              { label: 'Application Portal', href: '/loans', active: true },
            ]}
          />
          <button 
            onClick={() => setActiveForm('none')}
            className="text-sm font-bold text-gray-400 hover:text-red-500 transition"
          >
            Close Portal
          </button>
        </div>
      )}

      {/* Form Section */}
      {activeForm !== 'none' && (
        <section className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Main Loan Form - Takes 2 columns if both are showing */}
            <div className={`${activeForm === 'both' ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="bg-green-600 p-3 rounded-t-xl text-white font-bold text-center text-sm uppercase tracking-widest">
                  Applicant Form
                </div>
                <div className="p-2">
                  <LoanForm members={[]} />
                </div>
              </div>
            </div>

            {/* Guarantor Form - Takes 1 column and sits adjacent */}
            {activeForm === 'both' && (
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="bg-blue-800 p-3 rounded-t-xl text-white font-bold text-center text-sm uppercase tracking-widest">
                    Guarantor Form
                  </div>
                  <div className="p-6">
                    {/* If you have a separate GuarantorForm component, use it here */}
                    <GuarantorForm /> 
                    
                    {/* Simple fallback UI if component isn't ready */}
                    {!GuarantorForm && (
                        <div className="text-center py-10">
                            <ShieldCheckIcon className="h-12 w-12 text-blue-200 mx-auto mb-2" />
                            <p className="text-xs text-gray-400">Guarantor module loading...</p>
                        </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}