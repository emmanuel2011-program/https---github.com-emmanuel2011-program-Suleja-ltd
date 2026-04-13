'use client';

import React, { useState } from 'react';
import { 
  EyeIcon, 
  ArrowUpCircleIcon, 
  MagnifyingGlassIcon, 
  XMarkIcon, 
  CalendarDaysIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  ClockIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { ApproveButton } from '@/app/ui/investments/buttons'; 
import WithdrawalForm from '@/app/ui/investments/withdrawal-form';

export default function InvestmentTable({ initialInvestments }: { initialInvestments: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInv, setSelectedInv] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileExpandedId, setMobileExpandedId] = useState<string | null>(null);

  const filteredInvestments = initialInvestments.filter((inv) =>
    `${inv.first_name} ${inv.surname} ${inv.member_email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const openWithdrawal = (inv: any, e: React.MouseEvent) => {
    e.stopPropagation(); 
    setSelectedInv(inv);
    setIsModalOpen(true);
  };

  const handleRowClick = (inv: any) => {
    setSelectedInv(inv);
    setMobileExpandedId(mobileExpandedId === inv.id ? null : inv.id);
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden px-1">
      {/* --- SEARCH BAR --- */}
      <div className="relative w-full max-w-md">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search name or email..."
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* --- TOP HIGHLIGHT CARD (Now Mobile Friendly) --- */}
      {selectedInv && !isModalOpen && (
        <div className="bg-blue-900 text-white p-5 md:p-8 rounded-2xl shadow-xl animate-in zoom-in-95 duration-200 relative overflow-hidden border-b-4 border-blue-500">
          <button 
            onClick={() => setSelectedInv(null)}
            className="absolute top-3 right-3 p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-white" />
          </button>
          
          <div className="flex flex-col md:grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-blue-400 text-[9px] font-black uppercase tracking-widest">Investment Profile</p>
              <h2 className="text-2xl md:text-4xl font-black mt-1 tracking-tight uppercase leading-tight">
                {selectedInv.first_name} {selectedInv.surname}
              </h2>
              <p className="text-blue-200 text-xs md:text-base font-bold truncate">{selectedInv.member_email}</p>
            </div>
            <div className="md:text-right">
              <p className="text-blue-400 text-[9px] font-black uppercase tracking-widest">Total Principal</p>
              <p className="text-3xl md:text-5xl font-black text-green-400 mt-1">
                ₦{Number(selectedInv.amount).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Details Grid: Stacks on mobile */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4 border-t border-blue-800 pt-6">
            <div>
              <p className="text-blue-400 text-[8px] font-black uppercase mb-0.5">Joined</p>
              <p className="font-bold text-sm md:text-lg">
                {selectedInv.created_at ? new Date(selectedInv.created_at).toLocaleDateString('en-NG') : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-blue-400 text-[8px] font-black uppercase mb-0.5">Monthly ROI</p>
              <p className="font-bold text-sm md:text-lg text-green-400">₦{Number(selectedInv.monthly_interest).toLocaleString()}</p>
            </div>
            <div className="hidden sm:block">
              <p className="text-blue-400 text-[8px] font-black uppercase mb-0.5">Term</p>
              <p className="font-bold text-sm md:text-lg">{selectedInv.duration}</p>
            </div>
            <div>
              <p className="text-blue-400 text-[8px] font-black uppercase mb-0.5">Status</p>
              <p className="font-bold text-sm md:text-lg uppercase text-amber-400">{selectedInv.status || 'Pending'}</p>
            </div>
            <div className="col-span-1">
              <p className="text-blue-400 text-[8px] font-black uppercase mb-0.5">Account</p>
              <p className="font-bold text-sm md:text-lg truncate">{selectedInv.account_number || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      {/* --- THE TABLE --- */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide"> 
          <table className="w-full text-gray-900 border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200 text-left text-[10px] md:text-[11px] font-black uppercase tracking-widest text-gray-600">
              <tr>
                <th className="px-4 md:px-6 py-4">Customer Details</th>
                <th className="px-4 md:px-6 py-4">Amount</th>
                <th className="hidden lg:table-cell px-6 py-4">Applied Date</th>
                <th className="hidden lg:table-cell px-6 py-4 text-green-700">ROI</th>
                <th className="px-4 md:px-6 py-4 text-center">Receipt</th>
                <th className="px-4 md:px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInvestments.map((inv) => {
                const isExpanded = mobileExpandedId === inv.id;
                const isSelected = selectedInv?.id === inv.id;
                const isActive = inv.status?.toString().toLowerCase() === 'active';

                return (
                  <React.Fragment key={inv.id}>
                    <tr 
                      onClick={() => handleRowClick(inv)} 
                      className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-50/80 border-l-4 border-blue-500' : 'hover:bg-gray-50/50'}`}
                    >
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="lg:hidden">
                             {isExpanded ? <ChevronUpIcon className="h-3 w-3 text-blue-600" /> : <ChevronDownIcon className="h-3 w-3 text-gray-400" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 text-xs md:text-sm uppercase truncate">{inv.first_name} {inv.surname}</p>
                            <p className="text-[9px] md:text-xs text-blue-600 font-medium truncate">{inv.member_email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <p className="font-black text-gray-900 text-sm md:text-base">₦{Number(inv.amount).toLocaleString()}</p>
                        <p className="lg:hidden text-[8px] text-green-600 font-bold tracking-tight">
                          +₦{Number(inv.monthly_interest).toLocaleString()} ROI
                        </p>
                      </td>

                      {/* DESKTOP ONLY */}
                      <td className="hidden lg:table-cell px-6 py-4">
                        <p className="text-xs font-bold text-gray-600">
                          {inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-NG') : 'N/A'}
                        </p>
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4 text-green-700 font-bold text-sm">
                        ₦{Number(inv.monthly_interest).toLocaleString()}
                      </td>

                      <td className="px-4 md:px-6 py-4 text-center">
                        {inv.receipt_url ? (
                          <a 
                            href={inv.receipt_url} 
                            target="_blank" 
                            rel="noreferrer" 
                            onClick={(e) => e.stopPropagation()} 
                            className="inline-block p-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-700 hover:text-white transition-all"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </a>
                        ) : (
                          <span className="text-gray-300 text-[10px]">None</span>
                        )}
                      </td>

                      <td className="px-4 md:px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                            isActive ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {inv.status || 'pending'}
                          </span>
                          {isActive && (
                            <button 
                              onClick={(e) => openWithdrawal(inv, e)}
                              className="text-[9px] font-black text-red-600 hover:underline flex items-center gap-1"
                            >
                              <ArrowUpCircleIcon className="h-3 w-3" /> WITHDRAW
                            </button>
                          )}
                          {!isActive && <ApproveButton id={inv.id} />}
                        </div>
                      </td>
                    </tr>

                    {/* --- MOBILE EXPANDED (Improved Spacing) --- */}
                    {isExpanded && (
                      <tr className="lg:hidden bg-blue-50/30 animate-in slide-in-from-top-1 duration-200">
                        <td colSpan={6} className="px-4 md:px-6 py-4 border-l-4 border-blue-500">
                          <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                            <div>
                               <p className="text-[8px] font-black text-gray-400 uppercase flex items-center gap-1 mb-1">
                                 <CalendarDaysIcon className="h-3 w-3" /> Date Applied
                               </p>
                               <p className="text-xs font-bold text-gray-800">
                                 {inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-NG') : 'N/A'}
                               </p>
                            </div>
                            <div>
                               <p className="text-[8px] font-black text-gray-400 uppercase flex items-center gap-1 mb-1">
                                 <ClockIcon className="h-3 w-3" /> Duration
                               </p>
                               <p className="text-xs font-bold text-gray-800">{inv.duration}</p>
                            </div>
                            <div className="col-span-2">
                               <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Payout Account</p>
                               <p className="text-xs font-bold text-blue-900">{inv.account_number || 'N/A'}</p>
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
        {filteredInvestments.length === 0 && (
          <div className="p-16 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">No records found.</div>
        )}
      </div>

      {/* --- WITHDRAWAL MODAL --- */}
      {isModalOpen && selectedInv && (
        <div className="fixed inset-0 bg-blue-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in zoom-in-95">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 p-2"
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
    </div>
  );
}