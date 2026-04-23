'use client';

import React, { useState } from 'react';
import { 
  ArrowUpCircleIcon, 
  XMarkIcon, 
  BanknotesIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { ApproveButton } from '@/app/ui/investments/buttons'; 
import WithdrawalForm from '@/app/ui/investments/withdrawal-form';
import { approveWithdrawal, declineWithdrawal } from '@/app/lib/actions';

export default function InvestmentTable({ initialInvestments, isAdmin }: { initialInvestments: any[], isAdmin: boolean }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInv, setSelectedInv] = useState<any>(null);

  const investments = Array.isArray(initialInvestments) ? initialInvestments : [];

  const openWithdrawal = (inv: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedInv(inv);
    setIsModalOpen(true);
  };

  // Logic for Admin Actions (Confirm/Cancel)
  const handleAdminAction = async (id: string, type: 'approve' | 'decline') => {
    const confirmMsg = type === 'approve' ? "Confirm this withdrawal payout?" : "Decline this withdrawal request?";
    if (!window.confirm(confirmMsg)) return;

    const result = type === 'approve' 
      ? await approveWithdrawal(id) 
      : await declineWithdrawal(id);

    if (result.success) {
      alert(result.message);
    } else {
      alert("Error: " + result.message);
    }
  };

  return (
    <div className="w-full pb-32 md:pb-10"> 
      <div className="bg-white rounded-xl shadow-md border border-gray-200">
        <div className="overflow-x-auto scrollbar-hide rounded-xl"> 
          <table className="min-w-[950px] md:min-w-full w-full text-gray-900 border-collapse">
            <thead className="bg-gray-100 border-b border-gray-200 text-left text-[10px] md:text-[11px] font-black uppercase tracking-widest text-gray-700">
              <tr>
                <th className="px-4 md:px-6 py-5">Customer & Start</th>
                <th className="px-4 md:px-6 py-5">Principal / Bal</th>
                <th className="px-4 md:px-6 py-5 text-green-700">Monthly ROI</th>
                <th className="hidden sm:table-cell px-6 py-5 text-blue-700">Request Amount</th>
                <th className="px-4 md:px-6 py-5 text-center">Cycle Status</th>
                <th className="px-4 md:px-6 py-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {investments.map((inv) => {
                const isActive = inv.status?.toLowerCase() === 'active';
                const isPendingWithdrawal = inv.withdrawal_id; // Detects if this is a withdrawal review row

                return (
                  <tr key={inv.withdrawal_id || inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 md:px-6 py-4">
                      <p className="font-bold text-gray-900 text-xs md:text-sm uppercase">{inv.first_name} {inv.surname}</p>
                      <p className="text-[9px] text-gray-400 mt-1 uppercase">Start: {new Date(inv.created_at).toLocaleDateString('en-GB')}</p>
                    </td>
                    
                    <td className="px-4 md:px-6 py-4">
                      <p className="font-black text-gray-900 text-sm md:text-lg">
                        ₦{(inv.principal_balance || inv.total_due || 0).toLocaleString()}
                      </p>
                    </td>

                    <td className="px-4 md:px-6 py-4 bg-green-50/30">
                      <p className="text-sm font-black text-green-700">₦{(inv.accrued_roi || inv.yield_in_naira || 0).toLocaleString()}</p>
                    </td>

                    <td className="hidden sm:table-cell px-6 py-4">
                      {isPendingWithdrawal ? (
                        <p className="text-sm font-black text-red-600 bg-red-50 px-2 py-1 rounded inline-block">
                          ₦{inv.requested_amount.toLocaleString()}
                        </p>
                      ) : (
                        <p className="text-xs font-bold text-blue-700">₦{Math.round(inv.total_accrued || 0).toLocaleString()}</p>
                      )}
                    </td>

                    <td className="px-4 md:px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${
                        isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {isPendingWithdrawal ? 'WAITING APPROVAL' : `Month ${inv.cycle}`}
                      </span>
                    </td>

                    <td className="px-4 md:px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        {isPendingWithdrawal ? (
                          <>
                            {/* CONFIRM BUTTON */}
                            <button 
                              onClick={() => handleAdminAction(inv.withdrawal_id, 'approve')}
                              className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-all active:scale-95 flex items-center gap-1 text-[10px] font-black uppercase shadow-sm"
                            >
                              <CheckCircleIcon className="h-4 w-4" /> Confirm
                            </button>
                            
                            {/* CANCEL BUTTON */}
                            <button 
                              onClick={() => handleAdminAction(inv.withdrawal_id, 'decline')}
                              className="bg-white border-2 border-red-100 text-red-600 p-2 rounded-lg hover:bg-red-50 transition-all active:scale-95 flex items-center gap-1 text-[10px] font-black uppercase shadow-sm"
                            >
                              <XMarkIcon className="h-4 w-4" /> Cancel
                            </button>
                          </>
                        ) : (
                          // Default Table Buttons
                          <>
                            {isActive ? (
                              <button 
                                onClick={(e) => openWithdrawal(inv, e)}
                                className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-[10px] font-black hover:bg-red-600 hover:text-white uppercase flex items-center gap-1 border border-red-100 transition-all"
                              >
                                <ArrowUpCircleIcon className="h-3 w-3" /> Withdraw
                              </button>
                            ) : (
                              isAdmin && <ApproveButton id={inv.id} />
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL (unchanged) */}
      {isModalOpen && selectedInv && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <XMarkIcon className="h-6 w-6" />
            </button>
            <WithdrawalForm 
              investmentId={selectedInv.id} 
              email={selectedInv.member_email} 
              currentBalance={selectedInv.total_due} 
            />
          </div>
        </div>
      )}
    </div>
  );
}