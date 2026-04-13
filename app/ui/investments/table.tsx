'use client';

import React, { useState } from 'react';
import { 
  ArrowUpCircleIcon, 
  XMarkIcon, 
  ClockIcon,
  CalendarDaysIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { ApproveButton } from '@/app/ui/investments/buttons'; 
import WithdrawalForm from '@/app/ui/investments/withdrawal-form';

export default function InvestmentTable({ initialInvestments, isAdmin }: { initialInvestments: any[], isAdmin: boolean }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInv, setSelectedInv] = useState<any>(null);

  const investments = Array.isArray(initialInvestments) ? initialInvestments : [];

  const openWithdrawal = (inv: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedInv(inv);
    setIsModalOpen(true);
  };

  return (
    <div className="w-full pb-10"> {/* Added padding bottom to ensure last row isn't cut */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200">
        {/* Changed overflow-hidden to overflow-x-auto to ensure horizontal scrolling works without hiding rows */}
        <div className="overflow-x-auto scrollbar-hide"> 
          <table className="min-w-[950px] lg:min-w-full w-full text-gray-900 border-collapse">
            <thead className="bg-gray-100 border-b border-gray-200 text-left text-[10px] md:text-[11px] font-black uppercase tracking-widest text-gray-700">
              <tr>
                <th className="px-4 md:px-6 py-5">Customer & Start</th>
                <th className="px-4 md:px-6 py-5">Net Portfolio</th>
                <th className="px-4 md:px-6 py-5 text-green-700">Monthly ROI</th>
                <th className="hidden sm:table-cell px-6 py-5 text-blue-700">Total Accrued</th>
                <th className="px-4 md:px-6 py-5 text-center">Cycle Status</th>
                <th className="px-4 md:px-6 py-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {investments.length > 0 ? (
                investments.map((inv) => {
                  const isActive = inv.status?.toLowerCase() === 'active';
                  
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                      {/* Customer */}
                      <td className="px-4 md:px-6 py-4">
                        <p className="font-bold text-gray-900 text-xs md:text-sm uppercase">
                          {inv.first_name} {inv.surname}
                        </p>
                        <p className="text-[9px] text-gray-400 mt-1 uppercase">
                          Start: {inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-GB') : 'N/A'}
                        </p>
                      </td>
                      
                      {/* Portfolio Balance */}
                      <td className="px-4 md:px-6 py-4">
                        <p className="font-black text-gray-900 text-sm md:text-lg">
                          ₦{Math.round(inv.total_due || 0).toLocaleString()}
                        </p>
                        {(inv.withdrawn_to_date || 0) > 0 && (
                          <p className="text-[8px] text-red-500 font-bold uppercase italic">
                            -₦{inv.withdrawn_to_date.toLocaleString()} Withdrawn
                          </p>
                        )}
                      </td>

                      {/* Monthly ROI & Duration */}
                      <td className="px-4 md:px-6 py-4 bg-green-50/30">
                        <p className="text-sm font-black text-green-700">
                          ₦{Math.round(inv.yield_in_naira || 0).toLocaleString()}
                        </p>
                        <div className="flex items-center gap-1 text-[9px] text-green-600/60 font-bold uppercase tracking-tighter">
                          <BanknotesIcon className="h-3 w-3" /> {inv.duration_num} Month Plan
                        </div>
                      </td>

                      {/* Total Accrued & Estimated ROI */}
                      <td className="hidden sm:table-cell px-6 py-4">
                        <p className="text-sm font-black text-blue-700">
                          +₦{Math.round(inv.total_accrued || 0).toLocaleString()}
                        </p>
                        <p className="text-[8px] text-emerald-600 font-bold uppercase tracking-tighter">
                          Goal: ₦{Math.round(inv.estimated_roi || 0).toLocaleString()}
                        </p>
                      </td>

                      {/* Cycle Progress */}
                      <td className="px-4 md:px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${
                            isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            Month {inv.cycle || 0}
                          </span>
                          <span className="text-[8px] text-gray-400 font-bold uppercase mt-1">
                            Total {inv.duration_num}m
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 md:px-6 py-4 text-center">
                        {isActive ? (
                          <button 
                            onClick={(e) => openWithdrawal(inv, e)}
                            className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-[10px] font-black hover:bg-red-600 hover:text-white uppercase flex items-center gap-1 border border-red-100 transition-all mx-auto"
                          >
                            <ArrowUpCircleIcon className="h-3 w-3" /> Withdraw
                          </button>
                        ) : (
                          isAdmin && <div className="flex justify-center"><ApproveButton id={inv.id} /></div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400 font-bold uppercase text-xs">
                    No investors found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
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