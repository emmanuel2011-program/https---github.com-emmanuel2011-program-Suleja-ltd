'use client';

import { CheckIcon } from '@heroicons/react/24/outline';
import { approveInvestment } from '@/app/lib/actions';
import { toast } from 'sonner';
import { useState } from 'react';

export function ApproveButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  async function handleApprove() {
    if (!confirm('Confirm receipt verified and activate investment?')) return;
    
    setLoading(true);
    const result = await approveInvestment(id);
    setLoading(false);

    if (result.success) {
      toast.success('Investment activated!');
    } else {
      toast.error('Error activating investment');
    }
  }

  return (
    <button
      onClick={handleApprove}
      disabled={loading}
      className="flex items-center gap-1 rounded-md bg-green-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-green-700 disabled:bg-gray-300 transition-colors"
    >
      <CheckIcon className="h-3 w-3" />
      {loading ? '...' : 'Confirm'}
    </button>
  );
}