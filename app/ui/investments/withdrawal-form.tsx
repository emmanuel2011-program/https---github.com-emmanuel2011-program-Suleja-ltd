'use client';

import { useState } from 'react';
import { requestWithdrawal } from '@/app/lib/actions';
import { BanknotesIcon, BuildingLibraryIcon, UserIcon, CalculatorIcon } from '@heroicons/react/24/outline';

export default function WithdrawalForm({ 
  investmentId, 
  email, 
  currentBalance 
}: { 
  investmentId: string, 
  email: string, 
  currentBalance: number 
}) {
  const [message, setMessage] = useState({ text: '', isError: false });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setMessage({ text: '', isError: false });
    
    const result = await requestWithdrawal(formData);
    
    setLoading(false);
    setMessage({ text: result.message, isError: !result.success });
    
    if (result.success) {
      // Optional: You could add a window.location.reload() here 
      // to refresh the table after a successful request
    }
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Withdraw Funds</h2>
        <p className="text-sm text-gray-500 font-medium">Available Balance: <span className="text-green-600 font-bold">₦{Number(currentBalance).toLocaleString()}</span></p>
      </div>

      <form action={handleSubmit} className="space-y-4">
        {/* Hidden Context Data */}
        <input type="hidden" name="investmentId" value={investmentId} />
        <input type="hidden" name="email" value={email} />

        {/* Withdrawal Amount */}
        <div>
          <label className="block text-xs font-black uppercase text-gray-500 mb-1 ml-1">Amount to Payout</label>
          <div className="relative">
            <CalculatorIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="number" 
              name="amount" 
              max={currentBalance}
              min={1000}
              required 
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-gray-900"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Bank Details Group */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-xs font-black uppercase text-gray-500 mb-1 ml-1">Bank Name</label>
            <div className="relative">
              <BuildingLibraryIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input 
                type="text" 
                name="bankName" 
                placeholder="e.g. Zenith Bank"
                required 
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all font-medium" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase text-gray-500 mb-1 ml-1">Account Number</label>
              <input 
                type="text" 
                name="accountNumber" 
                maxLength={10}
                placeholder="10 Digits"
                required 
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all font-mono font-bold" 
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-gray-500 mb-1 ml-1">Account Name</label>
              <input 
                type="text" 
                name="accountName" 
                placeholder="Beneficiary Name"
                required 
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all font-medium" 
              />
            </div>
          </div>
        </div>

        {/* Submission Button */}
        <button 
          type="submit" 
          disabled={loading}
          className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${
            loading 
            ? 'bg-gray-300 cursor-not-allowed' 
            : 'bg-red-600 hover:bg-red-700 text-white active:scale-[0.98]'
          }`}
        >
          {loading ? (
            'Processing...'
          ) : (
            <>
              <BanknotesIcon className="h-5 w-5" />
              Confirm Withdrawal
            </>
          )}
        </button>

        {/* Status Messaging */}
        {message.text && (
          <div className={`p-4 rounded-xl text-center text-sm font-bold animate-pulse ${
            message.isError ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'
          }`}>
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
}