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
  EnvelopeIcon,
  CheckBadgeIcon,
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
        }, 'image/jpeg', 0.7);
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
  yourTitle: string;
  firstName: string;
  surname: string;
  middleName: string;
  stateOfOrigin: string;
  lga: string;
  gender: string;
  nationality: string;
  fullResidentialAddress: string;
  occupation: string;
  email: string;
  mobilePhone: string;
  tin: string;
  dateOfBirth: string;
  purposeOfLoan: string;
  loanAmount: string;
  requestedDate: string;
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
  hasSentEmailDocs: boolean;
};

const initialFormState: FormState = {
  yourTitle: '',
  firstName: '',
  surname: '',
  middleName: '',
  stateOfOrigin: '',
  lga:'',
  gender: '',
  nationality: 'Nigerian',
  fullResidentialAddress: '',
  occupation: '',
  email: '',
  dateOfBirth: '',
  tin: '',
  purposeOfLoan: '',
  loanAmount: '',
  requestedDate: '',
  duration: '1 Month',
  interest: '15',
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
  hasSentEmailDocs: false,
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
      if (!form.tin) return "Tax Identification Number (TIN) is required.";
      if (form.tin.length < 11 || form.tin.length < 13) {
      return "TIN must be between 11 and 13 digits.";
      }
      if (!form.fullResidentialAddress.trim()) return "Residential address is required.";
      if (!form.dateOfBirth) return "Date of Birth is required.";
    }
    if (step === 2) {
      if (!form.loanAmount || Number(form.loanAmount) <= 0) return "Please enter a valid loan amount.";
      if (!form.requestedDate) return "Please select the requested date.";
      if (!form.purposeOfLoan.trim()) return "Please state the purpose of the loan.";
      if (!form.hasSentEmailDocs) return "You must confirm document submission via email to proceed.";
    }
    if (step === 3) {
      if (!form.bankName.trim() || !form.accountNumber.trim() || !form.accountName.trim()) return "Complete bank details are required.";
      if (form.accountNumber.length !== 10) return "Account number must be exactly 10 digits.";
    }
    if (step === 4) {
      if (!form.passportFile) return "Please upload a Passport Photograph.";
      if (!form.idCardFile) return "Please upload a valid ID Card.";
    }
    // --- UPDATED: COMPULSORY SPOUSE INFO ---
    if (step === 5) {
        if (!form.spouseTitle) return "Spouse title is required.";
        if (!form.spouseName.trim()) return "Spouse full name is required.";
        if (!form.spouseDOB) return "Spouse Date of Birth is required.";
        if (!form.spouseGender) return "Spouse gender is required.";
        if (!isValidPhone(form.spouseMobilePhone)) return "Spouse mobile phone must be exactly 11 digits.";
        if (!form.spouseNationality.trim()) return "Spouse nationality is required.";
        if (!form.spouseStateOfOrigin.trim()) return "Spouse state of origin is required.";
        if (!form.spouseLGA.trim()) return "Spouse LGA is required.";
        if (!form.spouseResidentialAddress.trim()) return "Spouse residential address is required.";
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

      // Append core fields
      formData.append('your_title', form.yourTitle);
      formData.append('first_name', form.firstName);
      formData.append('surname', form.surname);
      formData.append('middle_name', form.middleName);
      formData.append('state_of_origin', form.stateOfOrigin);
      formData.append('lga', form.lga);
      formData.append('email', form.email);
      formData.append('mobile_phone', form.mobilePhone);
      formData.append('date_of_birth', form.dateOfBirth); 
      formData.append('loan_amount', form.loanAmount);
      formData.append('requested_date', form.requestedDate);
      formData.append('purpose_of_loan', form.purposeOfLoan);
      formData.append('full_residential_address', form.fullResidentialAddress);
      formData.append('occupation', form.occupation);
      formData.append('gender', form.gender);
      formData.append('tin', form.tin.trim() || '');
      formData.append('bank_name', form.bankName);
      formData.append('account_number', form.accountNumber);
      formData.append('account_name', form.accountName);
      formData.append('account_type', form.accountType);
      formData.append('interest', form.interest);
      formData.append('duration', form.duration);

      // Spouse / Next of Kin
      formData.append('spouse_name', form.spouseName);
      formData.append('spouse_mobile_phone', form.spouseMobilePhone);
      formData.append('spouse_dob', form.spouseDOB);
      formData.append('spouse_gender', form.spouseGender);
      formData.append('spouse_residential_address', form.spouseResidentialAddress);
      formData.append('spouse_title', form.spouseTitle);
      formData.append('spouse_nationality', form.spouseNationality);
      formData.append('spouse_state', form.spouseStateOfOrigin);
      formData.append('spouse_lga', form.spouseLGA);

      // Interest and Repayment Logic
      const [year, month, day] = form.requestedDate.split('-').map(Number);
      const baseDate = new Date(year, month - 1, day);
      baseDate.setMonth(baseDate.getMonth() + 1);

      const y = baseDate.getFullYear();
      const m = String(baseDate.getMonth() + 1).padStart(2, '0');
      const d = String(baseDate.getDate()).padStart(2, '0');
      formData.append('repaymentDate', `${y}-${m}-${d}`);
      
      const principal = Number(form.loanAmount);
      const selectedRate = Number(form.interest) / 100;
      formData.append('calculatedInterest', (principal * selectedRate).toString());

      // Files
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
      alert("An error occurred. Please check your connection.");
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
              <select value={form.yourTitle} onChange={e => update('yourTitle', e.target.value)} className="rounded-md border p-2 text-sm bg-white" required>
                <option value="">Your Title *</option>
                <option value="Male">Mr</option>
                <option value="Female">Mrs</option>
                <option value="Female">Miss</option>
              </select>
              <input type="text" placeholder="First Name *" value={form.firstName} onChange={e => update('firstName', e.target.value)} className="rounded-md border p-2 text-sm outline-none focus:ring-1 focus:ring-green-500" required />
              <input type="text" placeholder="Surname *" value={form.surname} onChange={e => update('surname', e.target.value)} className="rounded-md border p-2 text-sm outline-none focus:ring-1 focus:ring-green-500" required />
              <input type="text" placeholder="Middle Name " value={form.middleName} onChange={e => update('middleName', e.target.value)} className="rounded-md border p-2 text-sm outline-none focus:ring-1 focus:ring-green-500"/>
              <input type="text" placeholder="State Of Origin *" value={form.stateOfOrigin} onChange={e => update('stateOfOrigin', e.target.value)} className="rounded-md border p-2 text-sm outline-none focus:ring-1 focus:ring-green-500" required />
              <input type="text" placeholder="LGA *" value={form.lga} onChange={e => update('lga', e.target.value)} className="rounded-md border p-2 text-sm outline-none focus:ring-1 focus:ring-green-500" required />
              <select value={form.gender} onChange={e => update('gender', e.target.value)} className="rounded-md border p-2 text-sm bg-white" required>
                <option value="">Select Gender *</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <input type="email" placeholder="Email Address *" value={form.email} onChange={e => update('email', e.target.value)} className="rounded-md border p-2 text-sm outline-none focus:ring-1 focus:ring-green-500" required />
              <input type="tel" placeholder="Mobile Phone (11 digits) *" value={form.mobilePhone} onChange={e => update('mobilePhone', e.target.value.replace(/\D/g, '').slice(0, 11))} className="rounded-md border p-2 text-sm outline-none focus:ring-1 focus:ring-green-500" required />
              <div className="relative">
              <input 
                  type="text" 
                  placeholder="TIN (Tax Identification Number) *" 
                  value={form.tin} 
                  // Only allow numbers and limit to 13 characters
                  onChange={e => update('tin', e.target.value.replace(/[^\d-]/g, '').slice(0, 13))} 
                  className="w-full rounded-md border p-2 text-sm outline-none focus:ring-1 focus:ring-green-500" 
                  required
                />
                {/* Visual counter to help the user */}
                <span className={`absolute right-3 top-2.5 text-[10px] font-bold ${form.tin.length >= 11 && form.tin.length <= 13 ? 'text-green-600' : 'text-gray-400'}`}>
                  {form.tin.length}/11-13
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">Date of Birth *</label>
                <input type="date" value={form.dateOfBirth} onChange={e => update('dateOfBirth', e.target.value)} className="rounded-md border p-2 text-sm outline-none focus:ring-1 focus:ring-green-500" required />
              </div>
              <div className="md:col-span-2">
                <textarea placeholder="Full Residential Address *" value={form.fullResidentialAddress} onChange={e => update('fullResidentialAddress', e.target.value)} className="w-full rounded-md border p-2 text-sm outline-none focus:ring-1 focus:ring-green-500" rows={2} required />
              </div>
              <input type="text" placeholder="Occupation *" value={form.occupation} onChange={e => update('occupation', e.target.value)} className="rounded-md border p-2 text-sm outline-none focus:ring-1 focus:ring-green-500" required />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
              <CurrencyDollarIcon className="h-5 w-5 text-green-600" /> Loan Details
            </h2>

            <div className="bg-green-50 border-2 border-dashed border-green-200 p-4 rounded-lg mb-4">
              <div className="flex gap-3 items-start">
                <EnvelopeIcon className="h-6 w-6 text-green-700 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-gray-900 leading-tight">
                    Kindly submit other documents <span className="text-green-700">(BOQ, Contract Award letter, work order forms, etc)</span> via this email:
                  </p>
                  <p className="text-lg font-black text-green-800 mt-1 underline decoration-2 underline-offset-4">
                    sfortefinance@yahoo.com
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-green-200">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={form.hasSentEmailDocs}
                      onChange={(e) => update('hasSentEmailDocs', e.target.checked)}
                      className="h-5 w-5 rounded border-green-300 text-green-600 focus:ring-green-500 transition-all"
                    />
                    <span className="text-xs font-bold text-green-800 group-hover:text-green-600 transition-colors">
                      I have sent my BOQ/Contract documents to the email above.
                    </span>
                  </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="md:col-span-1">
                  <label className="text-sm font-medium mb-1 block">Requested Amount (₦) *</label>
                  <input type="number" value={form.loanAmount} onChange={e => update('loanAmount', e.target.value)} className="w-full rounded-md border p-2 text-sm outline-none focus:ring-1 focus:ring-green-500" required />
               </div>
               <div className="md:col-span-1 flex flex-col gap-1">
                  <label className="text-sm font-medium mb-1 block">Requested Date *</label>
                  <input type="date" value={form.requestedDate} onChange={e => update('requestedDate', e.target.value)} className="w-full rounded-md border p-2 text-sm outline-none focus:ring-1 focus:ring-green-500" required />
               </div>
               <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">Repayment Duration</label>
                <div className="w-full rounded-md border bg-gray-100 p-2 text-sm font-bold text-gray-600">1 Month</div>
               </div>
               
               <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">Interest Rate *</label>
                <select 
                  value={form.interest} 
                  onChange={e => update('interest', e.target.value)} 
                  className="w-full rounded-md border p-2 text-sm font-bold text-green-700 bg-white outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="15">15% Monthly</option>
                  <option value="13">13% Monthly</option>
                </select>
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
            <input type="text" placeholder="Bank Name *" value={form.bankName} onChange={e => update('bankName', e.target.value)} className="w-full rounded-md border p-2 text-sm outline-none focus:ring-1 focus:ring-green-500" required />
            <div className="relative">
              <input 
                type="text" 
                placeholder="Account Number (10 digits) *" 
                value={form.accountNumber} 
                onChange={e => update('accountNumber', e.target.value.replace(/\D/g, '').slice(0, 10))} 
                className="w-full rounded-md border p-2 text-sm outline-none focus:ring-1 focus:ring-green-500" 
                required 
              />
              <span className={`absolute right-3 top-2.5 text-[10px] font-bold ${form.accountNumber.length === 10 ? 'text-green-600' : 'text-gray-400'}`}>
                {form.accountNumber.length}/10
              </span>
            </div>
            <input type="text" placeholder="Account Name *" value={form.accountName} onChange={e => update('accountName', e.target.value)} className="w-full rounded-md border p-2 text-sm outline-none focus:ring-1 focus:ring-green-500" required />
            <select value={form.accountType} onChange={e => update('accountType', e.target.value)} className="w-full rounded-md border p-2 text-sm bg-white outline-none focus:ring-1 focus:ring-green-500">
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
              <HeartIcon className="h-5 w-5 text-green-600" /> Next of Kin / Spouse Information (Required)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select value={form.spouseTitle} onChange={e => update('spouseTitle', e.target.value)} className="rounded-md border p-2 text-sm bg-white outline-none focus:ring-1 focus:ring-green-500" required>
                <option value="">Select Title *</option>
                <option value="Mr">Mr</option>
                <option value="Mrs">Mrs</option>
                <option value="Miss">Miss</option>
              </select>
              <input type="text" placeholder="Spouse Full Name *" value={form.spouseName} onChange={e => update('spouseName', e.target.value)} className="rounded-md border p-2 text-sm outline-none focus:ring-1 focus:ring-green-500" required />
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">Spouse Date of Birth *</label>
                <input type="date" value={form.spouseDOB} onChange={e => update('spouseDOB', e.target.value)} className="w-full rounded-md border p-2 text-sm outline-none focus:ring-1 focus:ring-green-500" required />
              </div>
              <select value={form.spouseGender} onChange={e => update('spouseGender', e.target.value)} className="rounded-md border p-2 text-sm bg-white outline-none focus:ring-1 focus:ring-green-500" required>
                <option value="">Spouse Gender *</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <input type="tel" placeholder="Spouse Phone (11 digits) *" value={form.spouseMobilePhone} onChange={e => update('spouseMobilePhone', e.target.value.replace(/\D/g, '').slice(0, 11))} className="rounded-md border p-2 text-sm outline-none focus:ring-1 focus:ring-green-500" required />
              <input type="text" placeholder="Spouse Nationality *" value={form.spouseNationality} onChange={e => update('spouseNationality', e.target.value)} className="rounded-md border p-2 text-sm outline-none focus:ring-1 focus:ring-green-500" required />
              <input type="text" placeholder="State of Origin *" value={form.spouseStateOfOrigin} onChange={e => update('spouseStateOfOrigin', e.target.value)} className="rounded-md border p-2 text-sm outline-none focus:ring-1 focus:ring-green-500" required />
              <input type="text" placeholder="LGA *" value={form.spouseLGA} onChange={e => update('spouseLGA', e.target.value)} className="rounded-md border p-2 text-sm outline-none focus:ring-1 focus:ring-green-500" required />
              <div className="md:col-span-2">
                <textarea placeholder="Spouse Residential Address *" value={form.spouseResidentialAddress} onChange={e => update('spouseResidentialAddress', e.target.value)} rows={2} className="w-full rounded-md border p-2 text-sm outline-none focus:ring-1 focus:ring-green-500" required />
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
              <div className="flex justify-between border-b pb-1"><span className="text-gray-500">Duration:</span> <span>1 Month</span></div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-gray-500">Estimated Total Due ({form.interest}%):</span> 
                <span className="font-bold text-red-600">
                  ₦{(Number(form.loanAmount) * (1 + Number(form.interest)/100)).toLocaleString()}
                </span>
              </div>
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
            <p className="text-[10px] text-gray-400 text-center px-4">Compressing images and sending application. Please wait.</p>
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
                className={`px-10 py-2.5 rounded-lg font-bold shadow-md active:scale-95 transition-all ${
                  (step === 2 && !form.hasSentEmailDocs) 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
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