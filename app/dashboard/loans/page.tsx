'use client';

import { useState, useEffect } from 'react';
import { updateLoanStatus, getPendingLoansAction } from '@/app/lib/actions';
import { toast } from 'sonner';
import { 
  CheckIcon, 
  XMarkIcon, 
  EyeIcon,
  BanknotesIcon,
  InboxIcon,
  EnvelopeIcon 
} from '@heroicons/react/24/outline';

export default function AdminLoansPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLoans() {
      try {
        const data = await getPendingLoansAction();
        setLoans(data || []);
      } catch (error) {
        toast.error("Failed to load loans");
      } finally {
        setLoading(false);
      }
    }
    loadLoans();
  }, []);

  const handleStatusUpdate = async (loan: any, status: 'approved' | 'rejected') => {
    const promise = updateLoanStatus(loan.id, status, loan.email, loan.first_name);

    toast.promise(promise, {
      loading: `Processing ${status}...`,
      success: () => {
        setLoans((prev) => prev.filter((l) => l.id !== loan.id));
        return `Loan for ${loan.first_name} has been ${status}!`;
      },
      error: (err) => `Error: ${err.message || 'Update failed'}`,
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse">
        <InboxIcon className="h-12 w-12 text-gray-300" />
        <p className="mt-4 text-gray-500 font-medium">Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="w-full px-2 md:px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Loan Approval Queue</h1>
        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
          {loans.length} Pending
        </div>
      </div>

      <div className="grid gap-6">
        {loans.map((loan) => (
          <div key={loan.id} className="bg-white border rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              
              {/* 1. User Info Section */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-bold text-gray-900">{loan.first_name} {loan.surname}</h2>
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded uppercase">
                    Ref: {loan.id?.toString().slice(0, 8)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-4">{loan.email}</p>
                
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center text-green-700 font-bold">
                    <BanknotesIcon className="h-5 w-5 mr-1 flex-shrink-0" />
                    ₦{Number(loan.loan_amount || 0).toLocaleString()}
                  </div>
                  <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded font-medium">
                    {loan.duration}
                  </div>
                </div>
              </div>

              {/* 2. Document & Verification (Yahoo Envelope Fix) */}
              <div className="flex items-center justify-around md:justify-center gap-4 md:gap-8 border-t border-b md:border-t-0 md:border-b-0 md:border-l md:border-r py-4 md:py-0 md:px-8">
                <a 
                  href={`https://mail.yahoo.com/d/search/keyword=${encodeURIComponent(loan.email)}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex flex-col items-center gap-1 group shrink-0"
                >
                  <div className="p-3 bg-blue-600 rounded-full text-white shadow-sm group-hover:bg-blue-700 transition-all flex items-center justify-center">
                    <EnvelopeIcon className="h-5 w-5 flex-shrink-0" strokeWidth={2.5} />
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 uppercase">Inbox</span>
                </a>

                {loan.passport_url && (
                  <a href={loan.passport_url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 group shrink-0">
                    <div className="p-3 bg-gray-100 rounded-full text-gray-600 group-hover:bg-green-100 group-hover:text-green-700 transition-all flex items-center justify-center">
                      <EyeIcon className="h-5 w-5 flex-shrink-0" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Passport</span>
                  </a>
                )}
                
                {loan.id_card_url && (
                  <a href={loan.id_card_url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 group shrink-0">
                    <div className="p-3 bg-gray-100 rounded-full text-gray-600 group-hover:bg-green-100 group-hover:text-green-700 transition-all flex items-center justify-center">
                      <EyeIcon className="h-5 w-5 flex-shrink-0" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase">ID Card</span>
                  </a>
                )}
              </div>

              {/* 3. Action Buttons */}
              <div className="flex flex-row md:flex-col justify-center gap-2">
                <button 
                  onClick={() => handleStatusUpdate(loan, 'approved')}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-600 text-white px-5 py-3 md:py-2 rounded-lg hover:bg-green-700 transition-all font-bold shadow-md"
                >
                  <CheckIcon className="h-5 w-5 flex-shrink-0" /> 
                  <span className="text-sm">Approve</span>
                </button>

                <button 
                  onClick={() => handleStatusUpdate(loan, 'rejected')}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border-2 border-red-100 text-red-600 px-5 py-3 md:py-2 rounded-lg hover:bg-red-50 transition-all font-bold"
                >
                  <XMarkIcon className="h-5 w-5 flex-shrink-0" /> 
                  <span className="text-sm">Reject</span>
                </button>
              </div>

            </div>
            
            <div className="mt-4 pt-4 border-t text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border-l-4 border-l-green-500">
              <span className="font-bold text-gray-800 uppercase text-[10px] block mb-1">Purpose of Loan:</span>
              "{loan.purpose_of_loan}"
            </div>
          </div>
        ))}

        {loans.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed">
            <InboxIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No pending applications at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}