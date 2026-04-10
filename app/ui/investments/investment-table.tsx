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

  // Filter Logic
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
    // Desktop: Sets the top highlight card
    setSelectedInv(inv);
    // Mobile: Toggles the expandable date/info section
    setMobileExpandedId(mobileExpandedId === inv.id ? null : inv.id);
  };

  return (
    <div className="space-y-6">
      {/* --- SEARCH BAR --- */}
      <div className="relative max-w-md">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or email..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* --- TOP HIGHLIGHT CARD (Hidden on very small mobile, visible on tablet/desktop) --- */}
      {selectedInv && !isModalOpen && (
        <div className="hidden md:block bg-blue-900 text-white p-8 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden border-b-4 border-blue-500">
          <button 
            onClick={() => setSelectedInv(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-white" />
          </button>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Investment Profile</p>
              <h2 className="text-4xl font-black mt-2 tracking-tight">{selectedInv.first_name} {selectedInv.surname}</h2>
              <p className="text-blue-200 mt-1 font-bold">{selectedInv.member_email}</p>
            </div>
            <div className="md:text-right">
              <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Total Principal</p>
              <p className="text-5xl font-black text-green-400 mt-2">₦{Number(selectedInv.amount).toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-6 border-t border-blue-800 pt-8">
            <div>
              <p className="text-blue-400 text-[10px] font-black uppercase mb-1">Date Joined</p>
              <p className="font-bold text-lg text-white">
                {selectedInv.created_at ? new Date(selectedInv.created_at).toLocaleDateString('en-NG') : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-blue-400 text-[10px] font-black uppercase mb-1">Monthly ROI</p>
              <p className="font-bold text-lg text-white">₦{Number(selectedInv.monthly_interest).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-blue-400 text-[10px] font-black uppercase mb-1">Term</p>
              <p className="font-bold text-lg text-white">{selectedInv.duration}</p>
            </div>
            <div>
              <p className="text-blue-400 text-[10px] font-black uppercase mb-1">Status</p>
              <p className="font-bold text-lg uppercase text-amber-400">{selectedInv.status || 'Pending'}</p>
            </div>
            <div>
              <p className="text-blue-400 text-[10px] font-black uppercase mb-1">Bank Account</p>
              <p className="font-bold text-white uppercase">{selectedInv.account_number || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      {/* --- THE TABLE --- */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto"> 
          <table className="min-w-full md:min-w-[1000px] w-full text-gray-900 border-collapse">
            <thead className="bg-gray-100 border-b border-gray-200 text-left text-[11px] font-black uppercase tracking-widest text-gray-700">
              <tr>
                <th className="px-6 py-5">Customer Details</th>
                <th className="px-6 py-5">Amount</th>
                <th className="hidden md:table-cell px-6 py-5">Investment Date</th>
                <th className="hidden md:table-cell px-6 py-5">Monthly ROI</th>
                <th className="hidden md:table-cell px-6 py-5">Duration</th>
                <th className="px-6 py-5 text-center">Receipt</th>
                <th className="px-6 py-5 text-center text-xs">Status & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInvestments.map((inv) => {
                const isExpanded = mobileExpandedId === inv.id;
                return (
                  <React.Fragment key={inv.id}>
                    <tr 
                      onClick={() => handleRowClick(inv)} 
                      className={`cursor-pointer transition-colors ${selectedInv?.id === inv.id ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50/80'}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="md:hidden">
                             {isExpanded ? <ChevronUpIcon className="h-4 w-4 text-blue-600" /> : <ChevronDownIcon className="h-4 w-4 text-gray-400" />}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm md:text-base uppercase">{inv.first_name} {inv.surname}</p>
                            <p className="text-[10px] md:text-xs text-blue-600 font-medium">{inv.member_email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-black text-gray-900 text-sm md:text-lg">
                        ₦{Number(inv.amount).toLocaleString()}
                      </td>

                      {/* DESKTOP COLUMNS (Hidden on Mobile) */}
                      <td className="hidden md:table-cell px-6 py-4">
                        <p className="text-sm font-bold text-gray-700">
                          {inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                        </p>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 text-green-700 font-bold">
                        +₦{Number(inv.monthly_interest).toLocaleString()}
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 text-xs font-bold text-gray-500">
                        {inv.duration}
                      </td>

                      <td className="px-6 py-4 text-center">
                        {inv.receipt_url ? (
                          <a 
                            href={inv.receipt_url} 
                            target="_blank" 
                            rel="noreferrer" 
                            onClick={(e) => e.stopPropagation()} 
                            className="text-blue-700 hover:text-blue-900"
                          >
                            <EyeIcon className="h-5 w-5 mx-auto" />
                          </a>
                        ) : (
                          <span className="text-gray-300 text-[10px]">None</span>
                        )}
                      </td>

                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col items-center gap-1">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                            inv.status === 'active' ? 'bg-green-600 text-white' : 'bg-amber-400 text-amber-900'
                          }`}>
                            {inv.status || 'pending'}
                          </span>
                          {inv.status?.toString().toLowerCase() === 'active' ? (
                            <button 
                              onClick={(e) => openWithdrawal(inv, e)}
                              className="text-[9px] font-black text-red-600 hover:underline flex items-center gap-1"
                            >
                              <ArrowUpCircleIcon className="h-3 w-3" /> WITHDRAW
                            </button>
                          ) : (
                            <ApproveButton id={inv.id} />
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* --- MOBILE EXPANDED SECTION (The Fix for Applied Date) --- */}
                    {isExpanded && (
                      <tr className="md:hidden bg-blue-50/30 animate-in slide-in-from-top-1 duration-200">
                        <td colSpan={4} className="px-6 py-4 border-l-4 border-blue-500">
                          <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                            <div>
                               <p className="text-[9px] font-black text-gray-400 uppercase flex items-center gap-1">
                                 <CalendarDaysIcon className="h-3 w-3" /> Date Applied
                               </p>
                               <p className="text-xs font-bold text-gray-800">
                                 {inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-NG') : 'N/A'}
                               </p>
                            </div>
                            <div>
                               <p className="text-[9px] font-black text-gray-400 uppercase flex items-center gap-1">
                                 <BanknotesIcon className="h-3 w-3" /> Monthly ROI
                               </p>
                               <p className="text-xs font-bold text-green-700">₦{Number(inv.monthly_interest).toLocaleString()}</p>
                            </div>
                            <div>
                               <p className="text-[9px] font-black text-gray-400 uppercase flex items-center gap-1">
                                 <ClockIcon className="h-3 w-3" /> Duration
                               </p>
                               <p className="text-xs font-bold text-gray-800">{inv.duration}</p>
                            </div>
                            <div>
                               <p className="text-[9px] font-black text-gray-400 uppercase">Account</p>
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
          <div className="p-20 text-center text-gray-500 font-bold">No records found.</div>
        )}
      </div>

      {/* --- WITHDRAWAL MODAL --- */}
      {isModalOpen && selectedInv && (
        <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
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