'use client';

import { useState } from 'react';
import Link from 'next/link';
import LoanForm from '@/app/ui/loans/create-form';
import Breadcrumbs from '@/app/ui/loans/breadcrumbs';

export default function LoansPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <main className="p-6">
      {/* Page heading */}
      <h1 className="text-2xl font-bold text-green-700">Loans</h1>
      <p className="text-green-600 mb-4">
        Manage cooperative loan services here. You can view loan records or apply for new loan applications.
      </p>

      {/* Button to toggle form */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition mb-6"
        >
          Apply for Loan
        </button>
      )}

      {/* Breadcrumbs */}
      {showForm && (
        <Breadcrumbs
          breadcrumbs={[
            { label: 'Loans', href: '/loans' },
            { label: 'Apply for Loan', href: '/loans', active: true },
          ]}
        />
      )}

      {/* Loan form (only visible after button click) */}
      {showForm && (
        <section className="mt-6">
          <LoanForm />
        </section>
      )}
    </main>
  );
}
