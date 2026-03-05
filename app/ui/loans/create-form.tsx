'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserCircleIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  PhotoIcon,
  BanknotesIcon,
  HeartIcon,
  IdentificationIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { createLoan } from '@/app/lib/actions';
import { Membership } from '@/app/lib/definitions';

// --- UTILITY: IMAGE COMPRESSION ---
async function compressImage(file: File): Promise<Blob | File> {
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size <= maxSize) return file;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          resolve(blob || file);
        }, 'image/jpeg', 0.7); // 70% quality
      };
    };
  });
}

const Spinner = () => (
  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

type FormState = {
  firstName: string;
  surname: string;
  middleName: string;
  gender: string;
  nationality: string;
  residentialAddress: string;
  occupation: string;
  email: string;
  mobilePhone: string;
  tin: string;
  dateOfBirth: string;
  purposeOfLoan: string;
  loanAmount: string;
  requestedDate: string; // New field
  duration: string;
  interest: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  accountType: string;
  spouseName: string;
  spouseMobilePhone: string;
  spouseDOB: string;
  spouseGender: string;
  spouseNationality: string;
  spouseStateOfOrigin: string;
  spouseLGA: string;
  spouseMaritalStatus: string;
  spouseTitle: string;
  spouseResidentialAddress: string;
  passportFile: File | null;
  idCardFile: File | null;
};

const initialFormState: FormState = {
  firstName: '',
  surname: '',
  middleName: '',
  gender: '',
  nationality: 'Nigerian',
  residentialAddress: '',
  occupation: '',
  email: '',
  dateOfBirth: '',
  tin: '',
  purposeOfLoan: '',
  loanAmount: '',
  requestedDate: '', // New field
  duration: '1 Month',
  interest: '15% Monthly',
  bankName: '',
  accountNumber: '',
  accountName: '',
  accountType: 'Savings',
  mobilePhone: '',
  spouseName: '',
  spouseMobilePhone: '',
  spouseDOB: '',
  spouseGender: '',
  spouseNationality: 'Nigerian',
  spouseStateOfOrigin: '',
  spouseLGA: '',
  spouseMaritalStatus: '',
  spouseTitle: '',
  spouseResidentialAddress: '',
  passportFile: null,
  idCardFile: null,
};

export default function LoanApplicationForm({ members }: { members: Membership[] }) {
  const [step, setStep] = useState<number>(1);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<FormState>(initialFormState);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const isValidPhone = (phone: string) => /^\d{11}$/.test(phone);
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  function validateCurrentStep() {
    if (step === 1) {
      if (!form.firstName.trim() || !form.surname.trim()) return "First Name and Surname are required.";
      if (!form.gender) return "Please select your gender.";
      if (!isValidEmail(form.email)) return "Please enter a valid email address.";
      if (!isValidPhone(form.mobilePhone)) return "Mobile phone must be exactly 11 digits.";
      if (!form.residentialAddress.trim()) return "Residential address is required.";
      if (!form.dateOfBirth) return "Date of Birth is required.";
    }
    if (step === 2) {
      if (!form.loanAmount || Number(form.loanAmount) <= 0) return "Please enter a valid loan amount.";
      if (!form.requestedDate) return "Please select the requested date.";
      if (!form.purposeOfLoan.trim()) return "Please state the purpose of the loan.";
    }
    if (step === 3) {
      if (!form.bankName.trim() || !form.accountNumber.trim() || !form.accountName.trim()) return "Complete bank details are required.";
    }
    if (step === 4) {
      if (!form.passportFile) return "Please upload a Passport Photograph.";
      if (!form.idCardFile) return "Please upload a valid ID Card.";
    }
    return null;
  }

  const handleNext = () => {
    const error = validateCurrentStep();
    if (error) alert(error);
    else setStep(s => s + 1);
  };

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setIsLoading(true);

  try {
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && !(value instanceof File)) {
        formData.append(key, value.toString());
      }
    });

    // --- DYNAMIC REPAYMENT LOGIC START ---
    // 1. Use the Requested Date as the starting point
    // 1. Split the YYYY-MM-DD string to avoid timezone "rollback"
    const [year, month, day] = form.requestedDate.split('-').map(Number);

// 2. Create the date object using the local constructor (months are 0-indexed)
    const baseDate = new Date(year, month - 1, day);

// 3. Determine how many months to add
    const monthsToAdd = form.duration === '2 Months' ? 2 : 1;

// 4. Set the repayment date
    baseDate.setMonth(baseDate.getMonth() + monthsToAdd);

// 5. Format back to YYYY-MM-DD manually to keep it clean
    const y = baseDate.getFullYear();
    const m = String(baseDate.getMonth() + 1).padStart(2, '0');
    const d = String(baseDate.getDate()).padStart(2, '0');
    const finalRepaymentDate = `${y}-${m}-${d}`;

    formData.append('repaymentDate', finalRepaymentDate);
    // ... rest of your code (image compression and createLoan call)
      if (form.passportFile) {
        const compressed = await compressImage(form.passportFile);
        formData.append('passportFile', compressed, 'passport.jpg');
      }
      if (form.idCardFile) {
        const compressed = await compressImage(form.idCardFile);
        formData.append('idCardFile', compressed, 'idcard.jpg');
      }

      const response = await createLoan(null, formData); 
      if (response?.success) {
        setSubmitted(true);
      } else {
        alert(response?.message || "Submission failed.");
      }
    } catch (err) {
      console.error("Submission Error:", err);
      alert("An error occurred. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function renderStep() {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
              <UserCircleIcon className="h-5 w-5 text-green-600" /> Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="First Name *" value={form.firstName} onChange={e => update('firstName', e.target.value)} className="rounded-md border p-2 text-sm outline-none focus:ring-1 focus:ring-green-500" required />
              <input type="text" placeholder="Surname *" value={form.surname} onChange={e => update('surname', e.target.value)} className="rounded-md border p-2 text-sm outline-none focus:ring-1 focus:ring-green-500" required />
              
              <select value={form.gender} onChange={e => update('gender', e.target.value)} className="rounded-md border p-2 text-sm bg-white" required>
                <option value="">Select Gender *</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>

              <input type="email" placeholder="Email Address *" value={form.email} onChange={e => update('email', e.target.value)} className="rounded-md border p-2 text-sm outline-none focus:ring-1 focus:ring-green-500" required />
              
              <input type="tel" placeholder="Mobile Phone (11 digits) *" value={form.mobilePhone} onChange={e => update('mobilePhone', e.target.value.replace(/\D/g, '').slice(0, 11))} className="rounded-md border p-2 text-sm outline-none focus:ring-1 focus:ring-green-500" required />
              
              <input type="text" placeholder="TIN (Tax Identification Number)" value={form.tin} onChange={e => update('tin', e.target.value)} className="rounded-md border p-2 text-sm outline-none focus:ring-1 focus:ring-green-500" />

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">Date of Birth *</label>
                <input type="date" value={form.dateOfBirth} onChange={e => update('dateOfBirth', e.target.value)} className="rounded-md border p-2 text-sm outline-none focus:ring-1 focus:ring-green-500" required />
              </div>

              <div className="md:col-span-2">
                <textarea placeholder="Full Residential Address *" value={form.residentialAddress} onChange={e => update('residentialAddress', e.target.value)} className="w-full rounded-md border p-2 text-sm outline-none focus:ring-1 focus:ring-green-500" rows={2} required />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
              <CurrencyDollarIcon className="h-5 w-5 text-green-600" /> Loan Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="md:col-span-1">
                  <label className="text-sm font-medium mb-1 block">Requested Amount (₦) *</label>
                  <input type="number" value={form.loanAmount} onChange={e => update('loanAmount', e.target.value)} className="w-full rounded-md border p-2 text-sm outline-none focus:ring-1 focus:ring-green-500" required />
               </div>
               {/* NEW REQUESTED DATE FIELD */}
               <div className="md:col-span-1 flex flex-col gap-1">
                  <label className="text-sm font-medium mb-1 block">Requested Date *</label>
                  <input type="date" value={form.requestedDate} onChange={e => update('requestedDate', e.target.value)} className="w-full rounded-md border p-2 text-sm outline-none focus:ring-1 focus:ring-green-500" required />
               </div>
               <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">Repayment Duration</label>
                <select value={form.duration} onChange={e => update('duration', e.target.value)} className="w-full rounded-md border bg-white p-2 text-sm font-semibold text-gray-700 outline-none">
                  <option value="1 Month">1 Month</option>
                  <option value="2 Months">2 Months</option>
                </select>
               </div>
               <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">Interest Rate</label>
                <input type="text" value={form.interest} readOnly className="w-full rounded-md border bg-gray-100 p-2 text-sm font-bold text-gray-500" />
               </div>
               <div className="md:col-span-2">
                <textarea placeholder="Purpose of Loan *" value={form.purposeOfLoan} onChange={e => update('purposeOfLoan', e.target.value)} rows={2} className="w-full rounded-md border p-2 text-sm outline-none focus:ring-1 focus:ring-green-500" required />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
              <BanknotesIcon className="h-5 w-5 text-green-600" /> Crediting Bank
            </h2>
            <input type="text" placeholder="Bank Name *" value={form.bankName} onChange={e => update('bankName', e.target.value)} className="w-full rounded-md border p-2 text-sm outline-none" required />
            <input type="text" placeholder="Account Number *" value={form.accountNumber} onChange={e => update('accountNumber', e.target.value)} className="w-full rounded-md border p-2 text-sm outline-none" required />
            <input type="text" placeholder="Account Name *" value={form.accountName} onChange={e => update('accountName', e.target.value)} className="w-full rounded-md border p-2 text-sm outline-none" required />
            <select value={form.accountType} onChange={e => update('accountType', e.target.value)} className="w-full rounded-md border p-2 text-sm bg-white outline-none">
              <option value="Savings">Savings</option>
              <option value="Current">Current</option>
            </select>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
              <PhotoIcon className="h-5 w-5 text-green-600" /> Required Documents
            </h2>
            <div className="p-4 border-2 border-dashed rounded-lg bg-white hover:border-green-400 transition-colors">
              <label className="block text-sm font-medium mb-2">Passport Photograph *</label>
              <input type="file" accept="image/*" onChange={e => update('passportFile', e.target.files ? e.target.files[0] : null)} className="text-sm w-full" />
            </div>
            <div className="p-4 border-2 border-dashed rounded-lg bg-white hover:border-green-400 transition-colors">
              <label className="block text-sm font-medium mb-2">Valid ID Card *</label>
              <input type="file" accept="image/*" onChange={e => update('idCardFile', e.target.files ? e.target.files[0] : null)} className="text-sm w-full" />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
              <HeartIcon className="h-5 w-5 text-green-600" /> Next of Kin / Spouse Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select value={form.spouseTitle} onChange={e => update('spouseTitle', e.target.value)} className="rounded-md border p-2 text-sm bg-white outline-none">
                <option value="">Select Title</option>
                <option value="Mr">Mr</option>
                <option value="Mrs">Mrs</option>
                <option value="Miss">Miss</option>
              </select>
              <input type="text" placeholder="Spouse Full Name" value={form.spouseName} onChange={e => update('spouseName', e.target.value)} className="rounded-md border p-2 text-sm outline-none" />
              
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">Spouse Date of Birth</label>
                <input type="date" value={form.spouseDOB} onChange={e => update('spouseDOB', e.target.value)} className="w-full rounded-md border p-2 text-sm outline-none" />
              </div>

              <select value={form.spouseGender} onChange={e => update('spouseGender', e.target.value)} className="rounded-md border p-2 text-sm bg-white outline-none">
                <option value="">Spouse Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <input type="tel" placeholder="Spouse Phone" value={form.spouseMobilePhone} onChange={e => update('spouseMobilePhone', e.target.value.replace(/\D/g, '').slice(0, 11))} className="rounded-md border p-2 text-sm outline-none" />
              <input type="text" placeholder="Spouse Nationality" value={form.spouseNationality} onChange={e => update('spouseNationality', e.target.value)} className="rounded-md border p-2 text-sm outline-none" />
              <input type="text" placeholder="State of Origin" value={form.spouseStateOfOrigin} onChange={e => update('spouseStateOfOrigin', e.target.value)} className="rounded-md border p-2 text-sm outline-none" />
              <input type="text" placeholder="LGA" value={form.spouseLGA} onChange={e => update('spouseLGA', e.target.value)} className="rounded-md border p-2 text-sm outline-none" />
              <div className="md:col-span-2">
                <textarea placeholder="Spouse Residential Address" value={form.spouseResidentialAddress} onChange={e => update('spouseResidentialAddress', e.target.value)} rows={2} className="w-full rounded-md border p-2 text-sm outline-none" />
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h2 className="text-lg font-semibold text-gray-800">Final Review</h2>
            <div className="bg-white p-4 rounded-md shadow-sm text-sm space-y-3 border border-gray-200">
              <div className="flex justify-between border-b pb-1"><span className="text-gray-500">Applicant:</span> <span>{form.firstName} {form.surname}</span></div>
              <div className="flex justify-between border-b pb-1"><span className="text-gray-500">Amount:</span> <span className="font-bold text-green-700">₦{Number(form.loanAmount).toLocaleString()}</span></div>
              <div className="flex justify-between border-b pb-1"><span className="text-gray-500">Date Requested:</span> <span>{form.requestedDate}</span></div>
              <div className="flex justify-between border-b pb-1"><span className="text-gray-500">Duration:</span> <span>{form.duration}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Documents:</span> <span className="text-green-600 font-medium">Ready for Upload</span></div>
            </div>
          </div>
        );
      default: return null;
    }
  }

  return (
    <div className="relative max-w-2xl mx-auto rounded-xl bg-gray-50 p-6 border border-gray-200 shadow-xl mt-10 mb-20">
      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm rounded-xl">
          <div className="bg-white p-6 rounded-lg shadow-xl border border-green-100 flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="text-sm font-bold text-gray-700">Processing & Uploading...</p>
            <p className="text-[10px] text-gray-400 text-center px-4">Compressing images and sending to the cooperative. Please wait.</p>
          </div>
        </div>
      )}

      {submitted ? (
        <div className="text-center py-10 animate-in zoom-in duration-500">
          <CheckCircleIcon className="h-20 w-20 text-green-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900">Application Sent!</h2>
          <p className="text-gray-600 mt-2">Your loan application has been received. Our team will review it and contact you via email shortly.</p>
          <Button onClick={() => window.location.reload()} className="bg-green-600 hover:bg-green-700 mt-8 px-10">Back to Top</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-8 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Progress</span>
              <span className="text-xs font-bold text-gray-500">Step {step} of 6</span>
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className={`h-1.5 transition-all duration-300 rounded-full ${step >= i ? 'bg-green-600 w-8' : 'bg-gray-300 w-4'}`} />
              ))}
            </div>
          </div>

          <div className="min-h-[360px]">{renderStep()}</div>

          <div className="mt-10 flex justify-between border-t border-gray-100 pt-6">
            <button 
              type="button" 
              disabled={step === 1 || isLoading} 
              onClick={() => setStep(s => s - 1)} 
              className="px-6 py-2 text-sm font-bold text-gray-400 hover:text-gray-600 disabled:opacity-30"
            >
              Back
            </button>
            
            {step < 6 ? (
              <button 
                type="button" 
                onClick={handleNext} 
                className="bg-green-600 text-white px-10 py-2.5 rounded-lg font-bold hover:bg-green-700 shadow-md active:scale-95 transition-all"
              >
                Continue
              </button>
            ) : (
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="bg-green-700 hover:bg-green-800 px-10 flex items-center gap-2 justify-center min-w-[180px] shadow-lg"
              >
                {isLoading ? (
                  <>
                    <Spinner />
                    <span>Processing...</span>
                  </>
                ) : (
                  'Submit Application'
                )}
              </Button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}