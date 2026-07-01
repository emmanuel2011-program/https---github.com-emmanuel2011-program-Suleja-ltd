
'use client';

import { useState } from 'react';
import { requestWithdrawal } from '@/app/lib/actions';
import { BanknotesIcon, BuildingLibraryIcon, CalculatorIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface WithdrawalFormProps {
  investmentId: string;
  email: string;
  currentBalance: number;
  onSuccess?: () => void; // This fixes the highlight error
}

export default function WithdrawalForm({ 
  investmentId, 
  email, 
  currentBalance,
  onSuccess 
}: WithdrawalFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState({ text: '', isError: false });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setMessage({ text: '', isError: false });
    
    const result = await requestWithdrawal(formData);
    
    setLoading(false);
    setMessage({ text: result.message, isError: !result.success });
    
    if (result.success) {
      router.refresh(); 
      // Auto-close modal after 2 seconds so user can see the success message
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    }
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Withdraw Funds</h2>
        <p className="text-sm text-gray-500 font-medium">
          Available Balance: <span className="text-green-600 font-bold">₦{Number(currentBalance).toLocaleString()}</span>
        </p>
      </div>

      <form action={handleSubmit} className="space-y-4">
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
        <div className="space-y-4">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-2">
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${
              loading 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-red-600 hover:bg-red-700 text-white active:scale-[0.98]'
            }`}
          >
            {loading ? 'Processing...' : (
              <>
                <BanknotesIcon className="h-5 w-5" />
                Confirm Withdrawal
              </>
            )}
          </button>

          {/* New Cancel Button to help with your modal size issue */}
          <button 
            type="button"
            onClick={onSuccess}
            className="w-full py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] text-gray-400 hover:text-gray-600 transition-colors"
          >
            Cancel and Go Back
          </button>
        </div>

        {/* Status Messaging */}
        {message.text && (
          <div className={`p-4 rounded-xl text-center text-sm font-bold ${
            message.isError ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'
          }`}>
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
}