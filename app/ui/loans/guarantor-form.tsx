'use client';

import { useState } from 'react';
import { createLoan } from '@/app/lib/actions';
import { 
  ClipboardDocumentCheckIcon, 
  UserIcon, 
  BriefcaseIcon, 
  PhoneIcon, 
  MapPinIcon,
  PhotoIcon,
  IdentificationIcon,
  UserGroupIcon,
  CalendarIcon,
  ArrowPathIcon,
  EnvelopeIcon // Added for the Email field
} from '@heroicons/react/24/outline';

export default function GuarantorForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [files, setFiles] = useState({
    passport: null as File | null,
    idCard: null as File | null
  });

  async function clientAction(formData: FormData) {
    setLoading(true);
    setError('');

    // Validation Check before sending to server
    if (!files.passport || !files.idCard) {
      setError("Please upload both the Passport Photo and ID Card.");
      setLoading(false);
      return;
    }

    if (files.passport) formData.append('guarantorPassportFile', files.passport);
    if (files.idCard) formData.append('guarantorIdFile', files.idCard);

    try {
      const result = await createLoan(null, formData);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("A system error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center py-10 animate-in fade-in zoom-in duration-500">
        <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
          <ClipboardDocumentCheckIcon className="h-12 w-12 text-green-600" />
        </div>
        <h3 className="text-xl font-black text-gray-900">Submission Received!</h3>
        <p className="text-sm text-gray-600 mt-2 px-6 text-center leading-relaxed">
          The documents have been uploaded and are currently <span className="font-bold text-orange-600">Awaiting Approval</span>. 
          The applicant will be notified via email shortly.
        </p>
      </div>
    );
  }

  return (
    <form action={clientAction} className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded animate-bounce">
          <p className="text-red-700 text-xs font-bold">{error}</p>
        </div>
      )}

      {/* --- SECTION 1: LOAN APPLICANT INFO --- */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <UserGroupIcon className="h-4 w-4 text-blue-800" />
          <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest">Loan Applicant Details</p>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <input name="firstName" type="text" placeholder="First Name *" className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all" required />
          <input name="surname" type="text" placeholder="Surname *" className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all" required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input name="email" type="email" placeholder="Email Address *" className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all" required />
          <input name="mobilePhone" type="tel" placeholder="Applicant Mobile *" className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all" required />
        </div>

        <div className="relative">
          <p className="text-[10px] text-gray-500 font-bold mb-1 ml-1 uppercase">Applicant Date of Birth *</p>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input 
              name="dateOfBirth" 
              type="date" 
              className="w-full pl-10 pr-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-gray-600 transition-all" 
              required 
            />
          </div>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* --- SECTION 2: GUARANTOR INFO --- */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheckIcon className="h-4 w-4 text-gray-600" />
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Guarantor Information</p>
        </div>

        <div className="relative">
          <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input name="guarantorName" type="text" placeholder="Guarantor Full Name *" className="w-full pl-10 pr-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all" required />
        </div>

        {/* --- GUARANTOR EMAIL FIELD (NEW) --- */}
        <div className="relative">
          <EnvelopeIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input 
            name="guarantorEmail" 
            type="email" 
            placeholder="Guarantor Email Address (for acknowledgment) *" 
            className="w-full pl-10 pr-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all" 
            required 
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <PhoneIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input name="guarantorPhone" type="tel" placeholder="Guarantor Phone *" className="w-full pl-10 pr-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all" required />
          </div>
          <input name="guarantorRelationship" type="text" placeholder="Relationship *" className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all" required />
        </div>

        <div className="relative">
          <BriefcaseIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input name="guarantorWorkplace" type="text" placeholder="Guarantor Workplace *" className="w-full pl-10 pr-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all" required />
        </div>

        <div className="relative">
          <MapPinIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <textarea name="residentialAddress" placeholder="Guarantor Residential Address *" rows={2} className="w-full pl-10 pr-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all" required />
        </div>

        {/* --- UPLOADS WITH VISUAL PREVIEW STATE --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          <div className={`p-3 border-2 border-dashed rounded-lg transition-all ${files.passport ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-100' : 'bg-gray-50 border-gray-200'}`}>
            <label className="flex items-center gap-2 cursor-pointer">
              <PhotoIcon className={`h-5 w-5 ${files.passport ? 'text-blue-600' : 'text-gray-400'}`} />
              <div className="flex-1">
                <p className="text-[11px] font-bold text-gray-700">Passport Photo *</p>
                <p className="text-[9px] text-gray-500 truncate w-32 font-medium">{files.passport ? files.passport.name : 'Click to select'}</p>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={(e) => setFiles(prev => ({ ...prev, passport: e.target.files?.[0] || null }))} />
            </label>
          </div>

          <div className={`p-3 border-2 border-dashed rounded-lg transition-all ${files.idCard ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-100' : 'bg-gray-50 border-gray-200'}`}>
            <label className="flex items-center gap-2 cursor-pointer">
              <IdentificationIcon className={`h-5 w-5 ${files.idCard ? 'text-blue-600' : 'text-gray-400'}`} />
              <div className="flex-1">
                <p className="text-[11px] font-bold text-gray-700">Valid ID Card *</p>
                <p className="text-[9px] text-gray-500 truncate w-32 font-medium">{files.idCard ? files.idCard.name : 'Click to select'}</p>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={(e) => setFiles(prev => ({ ...prev, idCard: e.target.files?.[0] || null }))} />
            </label>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full flex items-center justify-center gap-3 py-4 rounded-lg font-black text-sm shadow-xl transition-all active:scale-95 ${
          loading 
            ? 'bg-gray-400 cursor-not-allowed text-white' 
            : 'bg-blue-800 hover:bg-blue-900 text-white hover:shadow-blue-200'
        }`}
      >
        {loading ? (
          <>
            <ArrowPathIcon className="h-5 w-5 animate-spin" />
            SECURELY UPLOADING...
          </>
        ) : (
          'SUBMIT GUARANTOR VERIFICATION'
        )}
      </button>

      {loading && (
        <p className="text-[10px] text-center text-gray-400 animate-pulse font-medium italic">
          Please do not close the window while we process the images.
        </p>
      )}
    </form>
  );
}

function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
    </svg>
  );
}