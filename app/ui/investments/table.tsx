// app/ui/investments/table.tsx
'use client';

import React, { useState } from 'react';
import { EyeIcon, ArrowUpCircleIcon } from '@heroicons/react/24/outline';
import { ApproveButton } from '@/app/ui/investments/buttons'; 
import WithdrawalForm from '@/app/ui/investments/withdrawal-form';

export default function InvestmentTable({ initialInvestments }: { initialInvestments: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInv, setSelectedInv] = useState<any>(null);

  const openWithdrawal = (inv: any) => {
    setSelectedInv(inv);
    setIsModalOpen(true);
  };

  return (
    <>
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
              {initialInvestments.map((inv) => (
                <tr key={inv.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900 text-base">{inv.first_name} {inv.surname}</p>
                    <p className="text-xs text-blue-600 font-medium">{inv.member_email}</p>
                  </td>
                  <td className="px-6 py-4 font-black text-gray-900 text-lg">
                    ₦{Number(inv.amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-green-700 font-bold text-md">
                    +₦{Number(inv.monthly_interest).toLocaleString()}
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
                      <span className={`inline-block px-3 py-1 rounded-md text-[10px] font-black uppercase ${
                        inv.status === 'active' ? 'bg-green-600 text-white' : 'bg-amber-400 text-amber-900'
                      }`}>
                        {inv.status || 'pending'}
                      </span>
                      
                      {inv.status?.toString().toLowerCase() !== 'active' ? (
                        <div className="mt-2">
                          <ApproveButton id={inv.id} />
                        </div>
                      ) : (
                        <button 
                          onClick={() => openWithdrawal(inv)}
                          className="mt-2 flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-800 uppercase"
                        >
                          <ArrowUpCircleIcon className="h-4 w-4" />
                          Withdraw
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {initialInvestments.length === 0 && (
          <div className="p-20 text-center text-gray-500 font-bold">No records found.</div>
        )}
      </div>

      {/* MODAL FOR WITHDRAWAL */}
      {isModalOpen && selectedInv && (
        <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 text-xl font-bold">×</button>
            <WithdrawalForm 
              investmentId={selectedInv.id} 
              email={selectedInv.member_email} 
              currentBalance={selectedInv.amount} 
            />
          </div>
        </div>
      )}
    </>
  );
}