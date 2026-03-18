'use client';

import { updateLoanStatus } from '@/app/lib/actions';
import { useState } from 'react';
import { CheckBadgeIcon } from '@heroicons/react/24/outline';

export default function VerifyGuarantorButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!confirm("Verify this guarantor and approve the document status?")) return;
    
    setLoading(true);
    // This updates the status in the DB and revalidates the page
    await updateLoanStatus(id, 'active');
    setLoading(false);
  };

  return (
    <button
      onClick={handleVerify}
      disabled={loading}
      className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
    >
      <CheckBadgeIcon className="h-4 w-4" />
      {loading ? '...' : 'Verify'}
    </button>
  );
}