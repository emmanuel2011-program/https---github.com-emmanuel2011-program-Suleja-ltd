'use client';

import React, { useState } from 'react';
import { 
  ArrowUpCircleIcon, 
  XMarkIcon, 
  ClockIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
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

  const investments = Array.isArray(initialInvestments) ? initialInvestments : [];

  const openWithdrawal = (inv: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedInv(inv);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide"> 
          <table className="min-w-[750px] md:min-w-full w-full text-gray-900">
            <thead className="bg-gray-100 border-b border-gray-200 text-left text-[10px] md:text-[11px] font-black uppercase tracking-widest text-gray-700">
              <tr>
                <th className="px-4 md:px-6 py-5">Customer & Start Date</th>
                <th className="px-4 md:px-6 py-5">Current Portfolio</th>
                <th className="hidden sm:table-cell px-6 py-5">ROI Accrued</th>
                <th className="px-4 md:px-6 py-5 text-center">Cycle Status</th>
                <th className="px-4 md:px-6 py-5 text-center">Status & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {investments.map((inv) => {
                const isActive = inv.status?.toLowerCase() === 'active';
                const datePlaced = inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-GB') : 'N/A';

                return (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 md:px-6 py-4">
                      <p className="font-bold text-gray-900 text-xs md:text-sm uppercase">
                        {inv.first_name} {inv.surname}
                      </p>
                      <div className="flex items-center gap-1 text-[9px] md:text-[10px] text-gray-500 font-bold mt-1 uppercase">
                        <CalendarDaysIcon className="h-3 w-3 text-gray-400" />
                        Placed: {datePlaced}
                      </div>
                    </td>
                    
                    <td className="px-4 md:px-6 py-4">
                      <p className="font-black text-gray-900 text-sm md:text-lg">
                        ₦{Math.round(inv.total_due).toLocaleString()}
                      </p>
                      <div className="flex items-center gap-1 text-[9px] text-blue-600 font-black uppercase">
                         <ClockIcon className="h-3 w-3" />
                         {inv.months_counted}m Accrued
                      </div>
                    </td>

                    <td className="hidden sm:table-cell px-6 py-4">
                      <p className="text-sm font-black text-green-700">
                        +₦{Math.round(inv.total_roi_due).toLocaleString()}
                      </p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase">ROI only</p>
                    </td>

                    <td className="px-4 md:px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className={`px-2 md:px-3 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-tighter ${
                          isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          C-{inv.cycle}
                        </span>
                        <p className="text-[9px] text-gray-400 font-bold mt-1 uppercase tracking-tight">
                          {inv.duration || '3 Months'}
                        </p>
                      </div>
                    </td>

                    <td className="px-4 md:px-6 py-4">
                      <div className="flex flex-col items-center gap-2">
                        {isActive ? (
                          <button 
                            onClick={(e) => openWithdrawal(inv, e)}
                            className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-[9px] md:text-[10px] font-black hover:bg-red-100 uppercase flex items-center gap-1 border border-red-100"
                          >
                            <ArrowUpCircleIcon className="h-3 w-3" /> Withdraw
                          </button>
                        ) : (
                          isAdmin && <ApproveButton id={inv.id} />
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
    </>
  );
}