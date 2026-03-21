'use client';

import { useState } from 'react';
// Import the specific guarantor action, not the loan status action
import { verifyGuarantorAction } from '@/app/lib/actions'; 
import { CheckBadgeIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

// Added 'status' to props so the button knows if it should look "Verified"
export default function VerifyGuarantorButton({ id, status }: { id: string, status?: string }) {
  const [loading, setLoading] = useState(false);

  // If the DB already says this specific guarantor is verified, show the badge
  if (status === 'verified') {
    return (
      <div className="flex items-center gap-1.5 text-green-600 font-black text-[10px] uppercase bg-green-50 px-3 py-2 rounded-lg border border-green-200 shadow-sm ml-auto">
        <CheckBadgeIcon className="h-4 w-4" /> 
        Verified
      </div>
    );
  }

  const handleVerify = async () => {
    if (!confirm("Verify this guarantor and approve the document status?")) return;
    
    setLoading(true);
    // Use the guarantor-specific action we created
    await verifyGuarantorAction(id);
    setLoading(false);
  };

  return (
    <button
      onClick={handleVerify}
      disabled={loading}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shadow-md disabled:opacity-50 ml-auto"
    >
      {loading ? (
        <ArrowPathIcon className="h-3 w-3 animate-spin" />
      ) : (
        <CheckBadgeIcon className="h-4 w-4" />
      )}
      {loading ? 'Verifying...' : 'Verify Now'}
    </button>
  );
}