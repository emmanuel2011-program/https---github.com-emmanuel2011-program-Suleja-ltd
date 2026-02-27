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
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { createLoan } from '@/app/lib/actions';

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
  spouseLocalGovt: string;
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
  spouseNationality: '',
  spouseStateOfOrigin: '',
  spouseLocalGovt: '',
  spouseMaritalStatus: '',
  spouseTitle: '',
  spouseResidentialAddress: '',
  passportFile: null,
  idCardFile: null,
};

export default function LoanApplicationForm() {
  const [step, setStep] = useState<number>(1);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<FormState>(initialFormState);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // VALIDATION HELPERS
  const isValidPhone = (phone: string) => /^\d{11}$/.test(phone);
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidTin = (tin: string) => /^\d{10,13}$/.test(tin); // Checks for 10 to 13 digits

  // STEP VALIDATION LOGIC
  function validateCurrentStep() {
    if (step === 1) {
      if (!form.firstName.trim() || !form.surname.trim()) return "First Name and Surname are required.";
      if (!form.gender) return "Please select your gender.";
      if (!form.occupation.trim()) return "Occupation is required.";
      if (!isValidEmail(form.email)) return "Please enter a valid email address.";
      if (!isValidPhone(form.mobilePhone)) return "Mobile phone must be exactly 11 digits.";
      if (!form.residentialAddress.trim()) return "Residential address is required.";
      if (!form.dateOfBirth) return "Date of Birth is required.";
      
      // TIN Validation (Optional field, but if filled, must be 10-13 digits)
      if (form.tin.trim() !== '' && !isValidTin(form.tin)) {
        return "TIN must be a number between 10 and 13 digits.";
      }
    }
    
    if (step === 2) {
      if (!form.loanAmount || Number(form.loanAmount) <= 0) return "Please enter a valid loan amount.";
      if (!form.purposeOfLoan.trim()) return "Please state the purpose of the loan.";
    }
    
    if (step === 3) {
      if (!form.bankName.trim()) return "Bank Name is required.";
      if (!form.accountNumber.trim() || form.accountNumber.length < 10) return "Valid 10-digit Account Number is required.";
      if (!form.accountName.trim()) return "Account Name is required.";
    }
    
    if (step === 4) {
      if (!form.passportFile) return "Please upload a Passport Photograph.";
      if (!form.idCardFile) return "Please upload a valid ID Card.";
    }

    return null; // No errors
  }

  const handleNext = () => {
    const error = validateCurrentStep();
    if (error) {
      alert(error);
    } else {
      setStep(s => s + 1);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const error = validateCurrentStep();
    if (error) return alert(error);
    
    setIsLoading(true);
    const formData = new FormData();
    
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && !(value instanceof File)) {
        formData.append(key, value.toString());
      }
    });

    const today = new Date().toISOString().split('T')[0];
    formData.append('requestDate', today);
    const repDate = new Date();
    repDate.setDate(repDate.getDate() + 30);
    formData.append('repaymentDate', repDate.toISOString().split('T')[0]);

    if (form.passportFile) formData.append('passportFile', form.passportFile);
    if (form.idCardFile) formData.append('idCardFile', form.idCardFile);

    try {
      const response = await createLoan(null, formData); 
      if (response?.success) {
        setSubmitted(true);
      } else {
        alert(response?.message || "Submission failed. Check database constraints.");
        setIsLoading(false);
      }
    } catch (err) {
      alert("Critical Connection Error. Check your server logs.");
      setIsLoading(false);
    }
  }

  function renderStep() {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
              <UserCircleIcon className="h-5 w-5 text-green-600" /> Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="First Name *" value={form.firstName} onChange={e => update('firstName', e.target.value)} className="rounded-md border p-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" required />
              <input type="text" placeholder="Surname *" value={form.surname} onChange={e => update('surname', e.target.value)} className="rounded-md border p-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" required />
              <select value={form.gender} onChange={e => update('gender', e.target.value)} className="rounded-md border p-2 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white" required>
                <option value="">Select Gender *</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <input type="text" placeholder="Occupation *" value={form.occupation} onChange={e => update('occupation', e.target.value)} className="rounded-md border p-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" required />
              <div className="relative">
                <input type="email" placeholder="Email Address *" value={form.email} onChange={e => update('email', e.target.value)} className="w-full rounded-md border p-2 pl-8 text-sm focus:ring-2 focus:ring-green-500 outline-none" required />
                <EnvelopeIcon className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              <input type="tel" placeholder="Mobile Phone (11 digits) *" value={form.mobilePhone} onChange={e => update('mobilePhone', e.target.value.replace(/\D/g, '').slice(0, 11))} className="w-full rounded-md border p-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" required />
              <div className="md:col-span-2">
                <textarea placeholder="Full Residential Address *" value={form.residentialAddress} onChange={e => update('residentialAddress', e.target.value)} className="w-full rounded-md border p-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" rows={2} required />
              </div>
              <div className="md:col-span-1">
                <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">Date of Birth *</label>
                <input type="date" value={form.dateOfBirth} onChange={e => update('dateOfBirth', e.target.value)} className="w-full rounded-md border p-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" required />
              </div>
              <input 
                type="text" 
                placeholder="TIN (10-13 digits)" 
                value={form.tin} 
                onChange={e => update('tin', e.target.value.replace(/\D/g, '').slice(0, 13))} 
                className="rounded-md border p-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" 
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
              <CurrencyDollarIcon className="h-5 w-5 text-green-600" /> Loan Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="md:col-span-2">
                  <label className="text-sm font-medium">Requested Amount (₦) *</label>
                  <input type="number" value={form.loanAmount} onChange={e => update('loanAmount', e.target.value)} className="w-full rounded-md border p-2 text-sm" required />
               </div>
               <select value={form.duration} onChange={e => update('duration', e.target.value)} className="w-full rounded-md border bg-white p-2 text-sm font-semibold text-gray-700 outline-none">
                <option value="1 Month">1 Month</option>
                <option value="2 Months">2 Months</option>
               </select>
               <input type="text" value={form.interest} readOnly className="w-full rounded-md border bg-gray-100 p-2 text-sm font-bold text-gray-500" />
               <div className="md:col-span-2">
                <textarea placeholder="Purpose of Loan *" value={form.purposeOfLoan} onChange={e => update('purposeOfLoan', e.target.value)} rows={2} className="w-full rounded-md border p-2 text-sm" required />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
              <BanknotesIcon className="h-5 w-5 text-green-600" /> Crediting Bank
            </h2>
            <input type="text" placeholder="Bank Name *" value={form.bankName} onChange={e => update('bankName', e.target.value)} className="w-full rounded-md border p-2 text-sm" required />
            <input type="text" placeholder="Account Number *" value={form.accountNumber} onChange={e => update('accountNumber', e.target.value)} className="w-full rounded-md border p-2 text-sm" required />
            <input type="text" placeholder="Account Name *" value={form.accountName} onChange={e => update('accountName', e.target.value)} className="w-full rounded-md border p-2 text-sm" required />
            <select value={form.accountType} onChange={e => update('accountType', e.target.value)} className="w-full rounded-md border p-2 text-sm bg-white">
              <option value="Savings">Savings</option>
              <option value="Current">Current</option>
            </select>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
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
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
              <HeartIcon className="h-5 w-5 text-green-600" /> Next of Kin / Spouse
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input type="text" placeholder="Full Name" value={form.spouseName} onChange={e => update('spouseName', e.target.value)} className="w-full rounded-md border p-2 text-sm" />
              <select value={form.spouseTitle} onChange={e => update('spouseTitle', e.target.value)} className="w-full rounded-md border p-2 text-sm bg-white">
                <option value="">Select Title</option>
                <option value="Mr">Mr</option>
                <option value="Mrs">Mrs</option>
                <option value="Miss">Miss</option>
              </select>
              <input type="tel" placeholder="Spouse Phone" value={form.spouseMobilePhone} onChange={e => update('spouseMobilePhone', e.target.value.replace(/\D/g, '').slice(0, 11))} className="w-full rounded-md border p-2 text-sm" />
              <input type="text" placeholder="Nationality" value={form.spouseNationality} onChange={e => update('spouseNationality', e.target.value)} className="w-full rounded-md border p-2 text-sm" />
              <div className="md:col-span-2">
                <textarea placeholder="Spouse Address" value={form.spouseResidentialAddress} onChange={e => update('spouseResidentialAddress', e.target.value)} rows={2} className="w-full rounded-md border p-2 text-sm" />
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Final Review</h2>
            <div className="bg-white p-4 rounded-md shadow-sm text-sm space-y-3 border border-gray-200">
              <div className="flex justify-between border-b pb-1"><span className="text-gray-500">Applicant:</span> <span>{form.firstName} {form.surname}</span></div>
              <div className="flex justify-between border-b pb-1"><span className="text-gray-500">Gender:</span> <span>{form.gender}</span></div>
              <div className="flex justify-between border-b pb-1"><span className="text-gray-500">Amount:</span> <span className="font-bold">₦{form.loanAmount}</span></div>
              <div className="flex justify-between border-b pb-1"><span className="text-gray-500">Terms:</span> <span>{form.interest} for {form.duration}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Documents:</span> <span className="text-green-600 font-medium">Attached</span></div>
            </div>
          </div>
        );
      default: return null;
    }
  }

  return (
    <div className="max-w-2xl mx-auto rounded-xl bg-gray-50 p-6 border border-gray-200 shadow-xl mt-10">
      {submitted ? (
        <div className="text-center py-10">
          <CheckCircleIcon className="h-20 w-20 text-green-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900">Application Sent!</h2>
          <Button onClick={() => window.location.reload()} className="bg-green-600 hover:bg-green-700 mt-6">Submit Another</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-8 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-green-700 uppercase">Loan Application</span>
              <span className="text-sm text-gray-500">Step {step} of 6</span>
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className={`h-2 w-6 rounded-full ${step >= i ? 'bg-green-600 w-10' : 'bg-gray-300'}`} />
              ))}
            </div>
          </div>

          <div className="min-h-[340px]">{renderStep()}</div>

          <div className="mt-10 flex justify-between border-t pt-6">
            <button
              type="button"
              disabled={step === 1 || isLoading}
              onClick={() => setStep(s => s - 1)}
              className={`px-6 py-2 text-sm font-semibold rounded-lg ${step === 1 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-200'}`}
            >
              Back
            </button>

            {step < 6 ? (
              <button 
                type="button" 
                onClick={handleNext}
                className="bg-green-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-green-700 shadow-md transition-all active:scale-95"
              >
                Next
              </button>
            ) : (
              <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700 px-10">
                {isLoading ? 'Uploading...' : 'Confirm & Submit'}
              </Button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}