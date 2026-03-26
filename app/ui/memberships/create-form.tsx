'use client';

import Link from 'next/link';
import {
  UserCircleIcon,
  IdentificationIcon,
  CheckCircleIcon,
  BanknotesIcon,
  PhotoIcon,
  PencilIcon,
  DocumentArrowUpIcon,
  PlusCircleIcon,
  DocumentCheckIcon,
  GlobeAltIcon,
  CalendarDaysIcon,
  TagIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { createMembership, checkEmailExists } from '@/app/lib/actions'; // Added checkEmailExists
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

export default function MembershipForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Email Validation State
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const [files, setFiles] = useState<{ [key: string]: string }>({
    passport: '',
    idCard: '',
    receipt: ''
  });

  const [wantsToInvest, setWantsToInvest] = useState(false);
  const [amountToInvest, setAmountToInvest] = useState<string>('');
  const [duration, setDuration] = useState<string>('1 Month (Renewable)');
  const [selectedRoi, setSelectedRoi] = useState<number>(7);
  const [calculatedInterest, setCalculatedInterest] = useState<number>(0);

  // --- Real-time Email Check Logic ---
  useEffect(() => {
    if (email.length < 5 || !email.includes('@')) {
      setEmailError('');
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsCheckingEmail(true);
      const exists = await checkEmailExists(email);
      if (exists) {
        setEmailError('This email is already registered with Sforte.');
      } else {
        setEmailError('');
      }
      setIsCheckingEmail(false);
    }, 600); // 600ms debounce

    return () => clearTimeout(timeoutId);
  }, [email]);

  // Interest Calculation
  useEffect(() => {
    const amount = parseFloat(amountToInvest);
    const months = parseInt(duration) || 1;
    setCalculatedInterest(!isNaN(amount) ? Math.round(amount * (selectedRoi / 100) * months) : 0);
  }, [amountToInvest, duration, selectedRoi]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles(prev => ({ ...prev, [key]: file.name }));
    }
  };

  async function handleAction(formData: FormData): Promise<void> {
    // Final check before submission
    if (emailError) {
      toast.error('Please use a unique email address');
      return;
    }

    const phone = formData.get('mobilePhone') as string;
    if (phone.length !== 11) {
      toast.error('Mobile phone must be exactly 11 digits');
      return;
    }

    if (wantsToInvest) {
      const amount = formData.get('amountToInvest');
      const receipt = formData.get('paymentReceipt') as File;
      const contract = formData.get('contractNotice');
      const accName = formData.get('accountName');

      if (!amount || parseFloat(amount.toString()) <= 0) {
        toast.error('Please enter an investment amount');
        return;
      }
      if (!accName || accName.toString().trim() === '') {
        toast.error('Please enter the Account Name for payouts');
        return;
      }
      if (!receipt || receipt.size === 0) {
        toast.error('Please upload your Proof of Payment receipt');
        return;
      }
      if (!contract) {
        toast.error('Please agree to the withdrawal notice');
        return;
      }
    }

    setIsLoading(true);
    const toastId = toast.loading('Creating member profile...');

    try {
      const result = await createMembership(formData);
      if (result?.success) {
        toast.success('Registration successful!', { id: toastId });
        setIsSubmitted(true);
      } else {
        toast.error(result?.message || 'Database error occurred', { id: toastId });
      }
    } catch (error) {
      toast.error('System error. Please check your connection.', { id: toastId });
    } finally {
      setIsLoading(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto text-center p-10 bg-white rounded-xl shadow-sm border border-green-100 mt-10">
        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold text-gray-800">Registration Complete!</h2>
        <p className="text-gray-500 mt-2">The member profile and documents have been saved.</p>
        <div className="mt-8 flex gap-4 justify-center">
          <Button onClick={() => {
            setIsSubmitted(false);
            setFiles({ passport: '', idCard: '', receipt: '' });
            setWantsToInvest(false);
            setAmountToInvest('');
            setEmail(''); // Reset email
          }} className="bg-green-600">Add Another</Button>
          <Link href="/dashboard/memberships" className="px-6 py-2 bg-gray-100 rounded-lg text-gray-600">View Directory</Link>
        </div>
      </div>
    );
  }

  return (
    <form action={handleAction} className="max-w-2xl mx-auto space-y-6 pb-20">
      
      {/* SECTION 1: PERSONAL INFORMATION */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <UserCircleIcon className="h-5 w-5 text-green-600" />
          Member Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 flex flex-col gap-1">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Email *</label>
                <input 
                  name="email" 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`mt-1 w-full rounded-md border py-2 px-3 text-sm focus:ring-2 outline-none transition-colors ${
                    emailError ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-green-500'
                  }`} 
                  placeholder="email@example.com" 
                />
              </div>
              <div className="w-1/3">
                <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Title *</label>
                <select name="title" required className="mt-1 w-full rounded-md border py-2 px-3 text-sm bg-white outline-none">
                  <option value="Mr">Mr.</option>
                  <option value="Mrs">Mrs.</option>
                  <option value="Ms">Ms.</option>
                  <option value="Dr">Dr.</option>
                </select>
              </div>
            </div>
            {/* Status indicators for Email */}
            {isCheckingEmail && <span className="text-[10px] text-blue-500 animate-pulse ml-1">Checking records...</span>}
            {emailError && <span className="text-[10px] text-red-600 font-bold ml-1">{emailError}</span>}
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Surname *</label>
            <input name="surname" type="text" required className="mt-1 w-full rounded-md border py-2 px-3 text-sm outline-none" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">First Name *</label>
            <input name="firstName" type="text" required className="mt-1 w-full rounded-md border py-2 px-3 text-sm outline-none" />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-gray-500 ml-1 flex items-center gap-1">
              <CalendarDaysIcon className="h-3 w-3" /> Date of Birth *
            </label>
            <input name="dateOfBirth" type="date" required className="mt-1 w-full rounded-md border py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-gray-500 ml-1 flex items-center gap-1">
              <GlobeAltIcon className="h-3 w-3" /> Nationality *
            </label>
            <input name="nationality" type="text" defaultValue="Nigerian" required className="mt-1 w-full rounded-md border py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Mobile Phone *</label>
            <input name="mobilePhone" type="tel" maxLength={11} required className="mt-1 w-full rounded-md border py-2 px-3 text-sm outline-none" placeholder="08012345678" />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-gray-500 ml-1 flex items-center gap-1">
              <IdentificationIcon className="h-3 w-3" /> TIN (Tax ID)
            </label>
            <input name="tin" type="text" className="mt-1 w-full rounded-md border py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-green-500" placeholder="Optional" />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Gender *</label>
            <select name="gender" required className="mt-1 w-full rounded-md border py-2 px-3 text-sm bg-white outline-none">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-gray-500 ml-1 flex items-center gap-1">
              <TagIcon className="h-3 w-3" /> Membership Type *
            </label>
            <select name="membershipType" required className="mt-1 w-full rounded-md border py-2 px-3 text-sm bg-white outline-none focus:ring-2 focus:ring-green-500">
              <option value="Investor">Investor</option>
              <option value="Nominal">Nominal</option>
              <option value="Loan Applicant">Loan Applicant</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Residential Address *</label>
            <textarea name="residentialAddress" required rows={2} className="mt-1 w-full rounded-md border py-2 px-3 text-sm outline-none" />
          </div>
        </div>
      </div>

      {/* SECTION 2: DOCUMENT UPLOADS */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <PhotoIcon className="h-5 w-5 text-green-600" />
          Identification & Verification
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`border-2 border-dashed p-4 rounded-lg transition-colors ${files.passport ? 'border-green-500 bg-green-50' : 'border-gray-100'}`}>
            <label className="block text-center cursor-pointer">
              {files.passport ? <DocumentCheckIcon className="h-8 w-8 text-green-600 mx-auto" /> : <PhotoIcon className="h-8 w-8 text-gray-300 mx-auto" />}
              <span className="block mt-2 text-xs font-bold text-gray-500 uppercase">{files.passport ? 'Uploaded' : 'Passport Photograph *'}</span>
              <input type="file" name="passportFile" accept="image/*" required className="hidden" onChange={(e) => handleFileChange(e, 'passport')} />
              <span className="text-[10px] text-gray-400 block truncate">{files.passport || 'JPG or PNG'}</span>
            </label>
          </div>
          <div className={`border-2 border-dashed p-4 rounded-lg transition-colors ${files.idCard ? 'border-green-500 bg-green-50' : 'border-gray-100'}`}>
            <label className="block text-center cursor-pointer">
              {files.idCard ? <DocumentCheckIcon className="h-8 w-8 text-green-600 mx-auto" /> : <IdentificationIcon className="h-8 w-8 text-gray-300 mx-auto" />}
              <span className="block mt-2 text-xs font-bold text-gray-500 uppercase">{files.idCard ? 'Uploaded' : 'Means of ID *'}</span>
              <input type="file" name="idCardFile" accept="image/*,application/pdf" required className="hidden" onChange={(e) => handleFileChange(e, 'idCard')} />
              <span className="text-[10px] text-gray-400 block truncate">{files.idCard || 'NIN, Voter\'s Card, etc.'}</span>
            </label>
          </div>
        </div>
      </div>

      {/* SECTION 3: CONDITIONAL INVESTMENT */}
      <div className={`rounded-xl border transition-all duration-300 ${wantsToInvest ? 'border-blue-400 bg-blue-50/20' : 'border-gray-200 bg-gray-50/50'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-lg font-semibold flex items-center gap-2 ${wantsToInvest ? 'text-blue-800' : 'text-gray-400'}`}>
              <BanknotesIcon className="h-5 w-5" />
              Investment Plan
            </h2>
            <button 
              type="button"
              onClick={() => setWantsToInvest(!wantsToInvest)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase transition-all ${
                wantsToInvest ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-500'
              }`}
            >
              {wantsToInvest ? <CheckCircleIcon className="h-4 w-4" /> : <PlusCircleIcon className="h-4 w-4" />}
              {wantsToInvest ? 'Enabled' : 'Add Investment'}
            </button>
          </div>

          <div className={`space-y-4 transition-all ${wantsToInvest ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-500 ml-1 mb-2 block">Select ROI Plan *</label>
              <div className="grid grid-cols-3 gap-3">
                {[6, 7, 8].map((rate) => (
                  <div
                    key={rate}
                    onClick={() => wantsToInvest && setSelectedRoi(rate)}
                    className={`cursor-pointer p-3 rounded-xl border-2 transition-all text-center ${
                      selectedRoi === rate 
                      ? 'border-blue-600 bg-white shadow-sm' 
                      : 'border-gray-100 bg-gray-50/50 hover:border-gray-200'
                    }`}
                  >
                    <p className={`text-sm font-black ${selectedRoi === rate ? 'text-blue-700' : 'text-gray-500'}`}>
                      {rate}%
                    </p>
                    <p className="text-[8px] uppercase text-gray-400 font-bold">Monthly</p>
                  </div>
                ))}
              </div>
              <input type="hidden" name="selectedRoi" value={selectedRoi} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 col-span-1">
                <label className="text-[10px] font-bold uppercase text-blue-700">Initial Investment (₦)</label>
                <input 
                  name="amountToInvest" 
                  type="number" 
                  min="0"
                  value={amountToInvest}
                  onChange={(e) => setAmountToInvest(e.target.value)}
                  disabled={!wantsToInvest}
                  className="mt-1 bg-transparent text-xl font-bold text-blue-900 outline-none w-full" 
                  placeholder="0.00"
                />
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200 col-span-1">
                <label className="text-[10px] font-bold uppercase text-gray-500 flex items-center gap-1">
                  <ClockIcon className="h-3 w-3" /> Duration
                </label>
                <select 
                  name="duration" 
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  disabled={!wantsToInvest}
                  className="mt-1 w-full text-sm font-bold text-gray-700 outline-none bg-transparent"
                >
                  <option value="1 Month (Renewable)">1 Month</option>
                  <option value="3 Months">3 Months</option>
                  <option value="6 Months">6 Months</option>
                  <option value="12 Months">12 Months</option>
                </select>
              </div>
            </div>

            <div className="bg-green-50 p-3 rounded-md flex justify-between items-center border border-green-100">
              <span className="text-[10px] font-bold uppercase text-green-700">
                Total ROI Calculation ({selectedRoi}% Monthly)
              </span>
              <p className="text-md font-black text-green-800">
                ₦{calculatedInterest.toLocaleString()}
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-500 ml-1 flex items-center gap-1">
                  <UserCircleIcon className="h-3 w-3" /> Payout Account Name *
                </label>
                <input 
                  name="accountName" 
                  required={wantsToInvest} 
                  placeholder="Exact Name on Bank Account" 
                  disabled={!wantsToInvest} 
                  className="mt-1 w-full rounded-md border py-2 px-3 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Bank Name *</label>
                  <input 
                    name="bankName" 
                    required={wantsToInvest} 
                    placeholder="e.g. Zenith Bank" 
                    disabled={!wantsToInvest} 
                    className="mt-1 w-full rounded-md border py-2 px-3 text-sm bg-white outline-none" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Account Number *</label>
                  <input 
                    name="accountNumber" 
                    required={wantsToInvest} 
                    placeholder="10 Digits" 
                    maxLength={10} 
                    disabled={!wantsToInvest} 
                    className="mt-1 w-full rounded-md border py-2 px-3 text-sm bg-white outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-gray-500 ml-1 flex items-center gap-1">
                  <TagIcon className="h-3 w-3" /> Account Class
                </label>
                <select 
                  name="accountClass" 
                  disabled={!wantsToInvest} 
                  className="mt-1 w-full rounded-md border py-2 px-3 text-sm bg-white outline-none"
                >
                  <option value="Investment">Investment Account</option>
                  <option value="Savings">Savings Account</option>
                  <option value="Current">Current Account</option>
                </select>
              </div>
            </div>

            <div className={`border-2 border-dashed p-4 rounded-lg transition-colors ${files.receipt ? 'border-blue-500 bg-blue-100/50' : 'border-blue-200 bg-white/50'}`}>
              <label className="block text-center cursor-pointer">
                <DocumentArrowUpIcon className={`h-7 w-7 mx-auto ${files.receipt ? 'text-blue-600' : 'text-blue-400'}`} />
                <span className="block mt-2 text-xs font-bold text-blue-700 uppercase">{files.receipt ? 'Receipt Selected' : 'Proof of Payment *'}</span>
                <input 
                  type="file" 
                  name="paymentReceipt" 
                  accept="image/*,application/pdf" 
                  required={wantsToInvest} 
                  disabled={!wantsToInvest} 
                  className="hidden" 
                  onChange={(e) => handleFileChange(e, 'receipt')} 
                />
                <span className="text-[10px] text-blue-400 block truncate">{files.receipt || 'Upload transfer screenshot'}</span>
              </label>
            </div>

            <label className="flex items-start gap-3 mt-4">
              <input 
                name="contractNotice" 
                type="checkbox" 
                required={wantsToInvest} 
                disabled={!wantsToInvest} 
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600" 
              />
              <span className="text-xs text-gray-600 font-medium">I agree to give 1 month notice for withdrawal.</span>
            </label>
          </div>
        </div>
      </div>

      {/* SECTION 4: SIGNATURE */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <PencilIcon className="h-5 w-5 text-gray-600" />
          E-Signature & Declaration
        </h2>
        <div className="space-y-4">
          <p className="text-xs text-gray-500 italic">"I certify that all information provided is true and correct."</p>
          <div>
            <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Full Name (Digital Signature) *</label>
            <input name="signatureName" type="text" required placeholder="Type your full legal name" className="mt-1 w-full rounded-md border border-gray-300 py-3 px-4 text-sm font-medium italic bg-white focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
        </div>
      </div>

      <div className="flex justify-end items-center gap-4">
        <Link href="/dashboard/memberships" className="text-sm font-medium text-gray-400 hover:text-gray-600">Discard</Link>
        <Button 
          type="submit" 
          disabled={isLoading || !!emailError || isCheckingEmail} 
          className="bg-green-600 hover:bg-green-700 px-10"
        >
          {isLoading ? 'Registering...' : 'Submit Application'}
        </Button>
      </div>
    </form>
  );
}