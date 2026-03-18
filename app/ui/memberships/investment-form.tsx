'use client';

import { useState, useEffect } from 'react';
import { 
  BanknotesIcon, 
  PhotoIcon, 
  PencilIcon, 
  CheckCircleIcon, 
} from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { createInvestment } from '@/app/lib/actions'; 
import { toast } from 'sonner';

// 1. Define the response type clearly
interface ActionResponse {
  success: boolean;
  message?: string;
}

export default function InvestmentForm() {
  const [amount, setAmount] = useState<string>('');
  const [duration, setDuration] = useState<string>('1 Month');
  const [interest, setInterest] = useState<number>(0);
  const [isPending, setIsPending] = useState(false);
  const [fileName, setFileName] = useState<string>('');

  useEffect(() => {
    const val = parseFloat(amount);
    const months = parseInt(duration) || 1;
    setInterest(!isNaN(val) ? val * 0.07 * months : 0);
  }, [amount, duration]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    }
  };

  async function handleAction(formData: FormData) {
    setIsPending(true);
    const toastId = toast.loading('Recording investment...');
    
    try {
      // 2. Explicitly cast the action result
      const result = await createInvestment(formData) as ActionResponse;
      
      setIsPending(false);

      if (result.success) {
        toast.success(result.message || 'Investment submitted!', { id: toastId });
        setAmount(''); 
        setFileName('');
        const form = document.getElementById('invest-form') as HTMLFormElement;
        form?.reset();
      } else {
        toast.error(result.message || 'An error occurred', { id: toastId });
      }
    } catch (error) {
      setIsPending(false);
      toast.error('System error occurred', { id: toastId });
    }
  }

  return (
    <form 
      id="invest-form"
      action={handleAction} 
      className="max-w-2xl mx-auto bg-white p-6 rounded-xl border border-blue-100 shadow-sm space-y-6"
    >
      <h2 className="text-xl font-black text-blue-900 flex items-center gap-2 uppercase tracking-tight">
        <BanknotesIcon className="h-6 w-6 text-blue-600" /> Investment Registration
      </h2>

      <div className="space-y-5">
        <div>
          <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Member Email *</label>
          <input name="email" type="email" required className="w-full border-gray-200 rounded-md p-2.5 mt-1 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50" placeholder="member@example.com" />
        </div>

        <div className="bg-blue-600 p-5 rounded-xl flex justify-between items-center shadow-inner">
          <div className="w-1/2">
            <label className="text-[10px] font-black text-blue-100 uppercase tracking-widest">Amount to Invest (₦)</label>
            <input 
              name="amountToInvest" 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-transparent text-3xl font-black outline-none text-white placeholder:text-blue-300" 
              placeholder="0.00"
              required
            />
          </div>
          <div className="text-right border-l border-blue-400/30 pl-4">
            <p className="text-[10px] text-blue-100 font-black uppercase tracking-widest">Est. Total ROI</p>
            <p className="text-2xl font-black text-white">+₦{interest.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Investment Duration *</label>
            <select 
              name="investmentDuration" 
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full border-gray-200 rounded-md p-2.5 mt-1 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-700"
            >
              <option value="1 Month">1 Month (Renewable)</option>
              <option value="3 Months">3 Months</option>
              <option value="6 Months">6 Months</option>
              <option value="12 Months">12 Months</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Account Class *</label>
            <select 
              name="accountClass" 
              className="w-full border-gray-200 rounded-md p-2.5 mt-1 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-700"
            >
              <option value="Investment">Investment</option>
              <option value="Corporate">Corporate</option>
              <option value="Savings">Savings</option>
            </select>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Account Name (Payout Name) *</label>
              <input name="accountName" required className="w-full border-gray-200 rounded-md p-2.5 mt-1 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white" placeholder="Full name on bank account" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Bank Name *</label>
                <input name="bankName" required className="w-full border-gray-200 rounded-md p-2.5 mt-1 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white" placeholder="e.g. GTBank" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Account Number *</label>
                <input name="accountNumber" required maxLength={10} className="w-full border-gray-200 rounded-md p-2.5 mt-1 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white" placeholder="0123456789" />
              </div>
            </div>
        </div>

        <div className={`border-2 border-dashed p-6 rounded-xl transition-all ${fileName ? 'border-green-400 bg-green-50' : 'border-blue-200 bg-gray-50 hover:bg-blue-50/50'}`}>
          <label className="block text-center cursor-pointer">
            {fileName ? (
              <CheckCircleIcon className="h-8 w-8 text-green-500 mx-auto" />
            ) : (
              <PhotoIcon className="h-8 w-8 text-blue-400 mx-auto" />
            )}
            <span className="block mt-2 text-[10px] font-black text-gray-600 uppercase tracking-widest">
              {fileName ? 'Document Attached' : 'Upload Payment Receipt *'}
            </span>
            <input 
              type="file" 
              name="paymentReceipt" 
              accept="image/*,application/pdf" 
              required 
              className="hidden" 
              onChange={handleFileChange}
            />
            <span className="text-xs font-bold text-blue-700 mt-2 block truncate px-4">
              {fileName || 'Click to select JPG, PNG or PDF'}
            </span>
          </label>
        </div>

        <div className="p-4 bg-gray-900 rounded-xl space-y-4">
            <label className="flex gap-3 cursor-pointer items-start">
              <input type="checkbox" name="contractNotice" required className="mt-1 h-4 w-4 rounded border-none text-blue-500 focus:ring-offset-gray-900" />
              <span className="text-[11px] text-gray-300 leading-tight">
                I agree to provide <strong>one month's notice</strong> before withdrawing my total funds and verify all bank details are correct.
              </span>
            </label>

            <div className="pt-3 border-t border-gray-700">
               <label className="text-[10px] font-black uppercase text-blue-400 flex items-center gap-1">
                 <PencilIcon className="h-3 w-3" /> Digital Signature *
               </label>
               <input 
                 name="signatureName" 
                 type="text" 
                 required 
                 placeholder="Type your full legal name" 
                 className="w-full mt-1 bg-gray-800 border-none rounded p-2.5 text-sm italic font-bold text-white shadow-inner outline-none focus:ring-2 focus:ring-blue-500"
               />
            </div>
        </div>

        <Button 
          disabled={isPending} 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 py-7 text-lg font-black uppercase tracking-widest shadow-xl active:scale-[0.98] transition-transform"
        >
          {isPending ? 'Processing...' : 'Submit Investment'}
        </Button>
      </div>
    </form>
  );
}