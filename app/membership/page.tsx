'use client';

import { useState } from 'react';
import Link from 'next/link';
import MembershipForm from '@/app/ui/memberships/create-form'; // Assuming you have a MembershipForm component
import Breadcrumbs from '@/app/ui/memberships/breadcrumbs'; // Adjust the import based on your folder structure

export default function MembershipsPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <main className="p-6">
      {/* Page heading */}
      <h1 className="text-2xl font-bold text-green-700">Memberships</h1>
      <p className="text-green-600 mb-4">
        Manage cooperative memberships here. You can view existing members or create new ones.
      </p>

      {/* Button to toggle form */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition mb-6"
        >
          Register Membership
        </button>
      )}

      {/* Breadcrumbs */}
      {showForm && (
        <Breadcrumbs
          breadcrumbs={[
            { label: 'Memberships', href: '/membership' },
            { label: 'Register Membership', href: '/membership', active: true },
          ]}
        />
      )}

      {/* Membership form (only visible after button click) */}
      {showForm && (
        <section className="mt-6">
          <MembershipForm />
        </section>
      )}
    </main>
  );
}