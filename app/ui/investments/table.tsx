'use client';

import React, { useState } from 'react';
import { 
  EyeIcon, 
  ArrowUpCircleIcon, 
  XMarkIcon, 
  ShieldCheckIcon, 
  CalendarDaysIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  BanknotesIcon,
  ClockIcon
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
  const [mobileExpandedId, setMobileExpandedId] = useState<string | null>(null);

  // Fallback for safety during deployment builds
  const investments = Array.isArray(initialInvestments) ? initialInvestments : [];

  const openWithdrawal = (inv: any, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents row expansion when clicking withdraw
    setSelectedInv(inv);
    setIsModalOpen(true);
  };

  const toggleRow = (id: string) => {
    setMobileExpandedId(mobileExpandedId === id ? null : id);
  };

  return (
    <>
      {/* ROLE INDICATOR */}
      <div className={`mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isAdmin ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
        <ShieldCheckIcon className="h-4 w-4" />
        Role: {isAdmin ? 'Administrator (Full Access)' : 'Member (View Only)'}
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto"> 
          <table className="min-w-full md:min-w-[1000px] w-full text-gray-900 border-collapse">
            <thead className="bg-gray-100 border-b border-gray-200 text-left text-[11px] font-black uppercase tracking-widest text-gray-700">
              <tr>
                <th className="px-6 py-5">Customer Details</th>
                <th className="px-6 py-5">Amount</th>
                <th className="hidden md:table-cell px-6 py-5">Investment Date</th>
                <th className="hidden md:table-cell px-6 py-5">7% ROI (Monthly)</th>
                <th className="hidden md:table-cell px-6 py-5">Duration</th>
                <th className="px-6 py-5 text-center">Receipt</th>
                <th className="px-6 py-5 text-center">Status & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {investments.map((inv) => {
                const rawStatus = inv.status?.toString().toLowerCase() || 'pending';
                const isActive = rawStatus === 'active';
                const isExpanded = mobileExpandedId === inv.id;

                return (
                  <React.Fragment key={inv.id}>
                    <tr 
                      onClick={() => toggleRow(inv.id)}
                      className={`cursor-pointer transition-colors ${isExpanded ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="md:hidden">
                             {isExpanded ? <ChevronUpIcon className="h-4 w-4 text-blue-600" /> : <ChevronDownIcon className="h-4 w-4 text-gray-400" />}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm md:text-base uppercase">{inv.first_name} {inv.surname}</p>
                            <p className="text-[10px] text-blue-600 font-medium">{inv.member_email}</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 font-black text-gray-900 text-sm md:text-lg">
                        ₦{Math.round(Number(inv.amount)).toLocaleString()}
                      </td>

                      {/* DESKTOP ONLY COLUMNS */}
                      <td className="hidden md:table-cell px-6 py-4">
                        <p className="text-sm font-bold text-gray-700">
                          {inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                        </p>
                      </td>

                      <td className="hidden md:table-cell px-6 py-4 text-green-700 font-bold">
                        +₦{Math.round(Number(inv.monthly_interest)).toLocaleString()}
                      </td>

                      <td className="hidden md:table-cell px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                        {inv.duration}
                      </td>

                      <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        {inv.receipt_url ? (
                          <a href={inv.receipt_url} target="_blank" rel="noreferrer" className="text-blue-700 hover:text-blue-900">
                            <EyeIcon className="h-5 w-5 mx-auto" />
                          </a>
                        ) : (
                          <span className="text-gray-300 text-[10px] italic font-bold">None</span>
                        )}
                      </td>

                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col items-center gap-1">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${
                            isActive ? 'bg-green-600 text-white' : 'bg-amber-400 text-amber-900'
                          }`}>
                            {rawStatus}
                          </span>
                          
                          {isActive ? (
                            <button 
                              onClick={(e) => openWithdrawal(inv, e)}
                              className="text-[10px] font-black text-red-600 hover:underline uppercase flex items-center gap-1"
                            >
                              <ArrowUpCircleIcon className="h-3 w-3" /> Withdraw
                            </button>
                          ) : (
                            isAdmin && <ApproveButton id={inv.id} />
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* MOBILE EXPANDED VIEW */}
                    {isExpanded && (
                      <tr className="md:hidden bg-blue-50/40 animate-in slide-in-from-top-1">
                        <td colSpan={4} className="px-6 py-4 border-l-4 border-blue-500">
                          <div className="grid grid-cols-2 gap-y-4">
                            <div>
                               <p className="text-[9px] font-black text-gray-400 uppercase flex items-center gap-1">
                                 <CalendarDaysIcon className="h-3 w-3" /> Joined Date
                               </p>
                               <p className="text-xs font-bold text-gray-800">
                                 {inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-NG') : 'N/A'}
                               </p>
                            </div>
                            <div>
                               <p className="text-[9px] font-black text-gray-400 uppercase flex items-center gap-1">
                                 <BanknotesIcon className="h-3 w-3" /> Monthly ROI
                               </p>
                               <p className="text-xs font-bold text-green-700">
                                 ₦{Math.round(Number(inv.monthly_interest)).toLocaleString()}
                               </p>
                            </div>
                            <div>
                               <p className="text-[9px] font-black text-gray-400 uppercase flex items-center gap-1">
                                 <ClockIcon className="h-3 w-3" /> Duration
                               </p>
                               <p className="text-xs font-bold text-gray-800 uppercase">{inv.duration}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* WITHDRAWAL MODAL */}
      {isModalOpen && selectedInv && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
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