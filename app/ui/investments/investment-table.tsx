'use client';

import React, { useState } from 'react';
import { EyeIcon, ArrowUpCircleIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ApproveButton } from '@/app/ui/investments/buttons'; 
import WithdrawalForm from '@/app/ui/investments/withdrawal-form';

export default function InvestmentTable({ initialInvestments }: { initialInvestments: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInv, setSelectedInv] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Filter Logic: Search by name or email
  const filteredInvestments = initialInvestments.filter((inv) =>
    `${inv.first_name} ${inv.surname} ${inv.member_email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const openWithdrawal = (inv: any, e: React.MouseEvent) => {
    e.stopPropagation(); // Stop the row click from opening the Large View
    setSelectedInv(inv);
    setIsModalOpen(true);
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

      {/* --- LARGE EXPANDED VIEW (Shows when you click a row) --- */}
      {selectedInv && !isModalOpen && (
        <div className="bg-blue-900 text-white p-8 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden border-b-4 border-blue-500">
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

          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-blue-800 pt-8">
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
              {filteredInvestments.map((inv) => (
                <tr 
                  key={inv.id} 
                  onClick={() => setSelectedInv(inv)} // Click body to open Large View
                  className={`cursor-pointer transition-colors ${selectedInv?.id === inv.id ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50/80'}`}
                >
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
                      <a 
                        href={inv.receipt_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        onClick={(e) => e.stopPropagation()} // Stop row click
                        className="inline-flex items-center gap-1.5 text-blue-700 font-black text-sm underline"
                      >
                        <EyeIcon className="h-5 w-5" /> View Proof
                      </a>
                    ) : (
                      <span className="text-red-400 text-xs font-bold italic">No Receipt</span>
                    )}
                  </td>

                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
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
                          onClick={(e) => openWithdrawal(inv, e)}
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
        {filteredInvestments.length === 0 && (
          <div className="p-20 text-center text-gray-500 font-bold">No records found matching your search.</div>
        )}
      </div>

      {/* MODAL FOR WITHDRAWAL */}
      {isModalOpen && selectedInv && (
        <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 text-2xl font-bold">×</button>
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