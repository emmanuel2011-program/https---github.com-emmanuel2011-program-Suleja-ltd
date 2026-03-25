'use client';

import React, { useState } from 'react';
import { EyeIcon, ArrowUpCircleIcon, XMarkIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { ApproveButton } from '@/app/ui/investments/buttons'; 
import WithdrawalForm from '@/app/ui/investments/withdrawal-form';

export default function InvestmentTable({ 
  initialInvestments, 
  isAdmin 
}: { 
  initialInvestments: any[], 
  isAdmin: boolean 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInv, setSelectedInv] = useState<any>(null);

  const openWithdrawal = (inv: any) => {
    setSelectedInv(inv);
    setIsModalOpen(true);
  };

  return (
    <>
      {/* DEBUG INDICATOR - Remove this once fixed */}
      <div className={`mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isAdmin ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        <ShieldCheckIcon className="h-4 w-4" />
        Logged as: {isAdmin ? 'Administrator (Full Access)' : 'Member (View Only)'}
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto"> 
          <table className="min-w-[900px] w-full text-gray-900 border-collapse">
            <thead className="bg-gray-100 border-b border-gray-200 text-left text-[11px] font-black uppercase tracking-widest text-gray-700">
              <tr>
                <th className="px-6 py-5">Customer Details</th>
                <th className="px-6 py-5">Investment Amount</th>
                <th className="px-6 py-5">7% ROI (Monthly)</th>
                <th className="px-6 py-5">Duration</th>
                <th className="px-6 py-5 text-center">Receipt</th>
                <th className="px-6 py-5 text-center">Status & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {initialInvestments.map((inv) => {
                // 1. NORMALIZE STATUS
                const rawStatus = inv.status?.toString().toLowerCase() || 'pending';
                const isActive = rawStatus === 'active';

                return (
                  <tr key={inv.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 text-base">{inv.first_name} {inv.surname}</p>
                      <p className="text-xs text-blue-600 font-medium">{inv.member_email}</p>
                    </td>
                    <td className="px-6 py-4 font-black text-gray-900 text-lg">
                      ₦{Math.round(Number(inv.amount)).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-green-700 font-bold text-md">
                      +₦{Math.round(Number(inv.monthly_interest)).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {inv.duration}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      {inv.receipt_url ? (
                        <a href={inv.receipt_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-blue-700 font-black text-sm underline">
                          <EyeIcon className="h-5 w-5" /> View Proof
                        </a>
                      ) : (
                        <span className="text-red-400 text-xs font-bold italic">No Receipt</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center gap-2">
                        {/* Status Badge */}
                        <span className={`inline-block px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-tight ${
                          isActive ? 'bg-green-600 text-white' : 'bg-amber-400 text-amber-900'
                        }`}>
                          {rawStatus}
                        </span>
                        
                        {/* THE FIX: Explicitly check isAdmin passed from props */}
                        {!isActive ? (
                          isAdmin === true ? (
                            <div className="mt-1">
                              <ApproveButton id={inv.id} />
                            </div>
                          ) : (
                            <span className="text-[10px] text-gray-400 font-bold italic uppercase mt-1">
                              Awaiting Admin
                            </span>
                          )
                        ) : (
                          <button 
                            onClick={() => openWithdrawal(inv)}
                            className="mt-1 flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-black text-red-600 hover:bg-red-600 hover:text-white transition-all uppercase"
                          >
                            <ArrowUpCircleIcon className="h-4 w-4" />
                            Withdraw
                          </button>
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

      {/* MODAL FOR WITHDRAWAL (Same as before) */}
      {isModalOpen && selectedInv && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 text-gray-900">
           {/* ... Withdrawal Modal Code ... */}
        </div>
      )}
    </>
  );
}