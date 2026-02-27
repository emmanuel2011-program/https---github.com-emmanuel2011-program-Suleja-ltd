'use client';

import Link from 'next/link';
import {
  UserCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  HomeIcon,
  CalendarIcon,
  IdentificationIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { createMembership } from '@/app/lib/actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function MembershipForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Validation helpers
  const isValidPhone = (phone: string) => /^\d{11}$/.test(phone);
  const isValidTin = (tin: string) => tin === '' || /^\d{10,13}$/.test(tin);

  /**
   * Main form handler
   * Explicitly returns Promise<void> to satisfy TypeScript
   */
  async function handleAction(formData: FormData): Promise<void> {
    const phone = formData.get('mobilePhone') as string;
    const tin = formData.get('tin') as string;

    // 1. Client-side validation
    if (!isValidPhone(phone)) {
      toast.error('Mobile phone must be exactly 11 digits');
      return;
    }

    if (!isValidTin(tin)) {
      toast.error('TIN must be between 10 and 13 digits');
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading('Creating membership...');

    try {
      const result = await createMembership(formData);

      if (result?.success) {
        toast.success('Membership created successfully!', { id: toastId });
        router.push('/membership');
      } else {
        toast.error(result?.message || 'An unexpected error occurred', { id: toastId });
        setIsLoading(false);
      }
    } catch (error) {
      toast.error('Network error. Please check your connection.', { id: toastId });
      setIsLoading(false);
    }
  }

  // UI helper to keep inputs numeric and within length limits
  const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>, max: number) => {
    const val = e.target.value.replace(/\D/g, ''); 
    e.target.value = val.slice(0, max);
  };

  return (
    // "as any" is used here to bypass the React/Next.js type conflict squiggle
    <form action={handleAction as any} className="max-w-2xl mx-auto">
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <UserCircleIcon className="h-5 w-5 text-green-600" />
          Member Information
        </h2>

        {/* Grid Layout - Compact View */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Surname */}
          <div>
            <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Surname *</label>
            <div className="relative mt-1">
              <input
                name="surname"
                type="text"
                placeholder="Surname"
                required
                className="w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-none focus:ring-2 focus:ring-green-500"
              />
              <UserCircleIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* First Name */}
          <div>
            <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">First Name *</label>
            <div className="relative mt-1">
              <input
                name="firstName"
                type="text"
                placeholder="First Name"
                required
                className="w-full rounded-md border border-gray-200 py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Date of Birth *</label>
            <div className="relative mt-1">
              <input
                name="dateOfBirth"
                type="date"
                required
                className="w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-none focus:ring-2 focus:ring-green-500"
              />
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Gender *</label>
            <select
              name="gender"
              required
              className="mt-1 w-full rounded-md border border-gray-200 py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-green-500 bg-white"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          {/* Email */}
          <div>
            <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Email *</label>
            <div className="relative mt-1">
              <input
                name="email"
                type="email"
                placeholder="email@example.com"
                required
                className="w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-none focus:ring-2 focus:ring-green-500"
              />
              <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Mobile Phone *</label>
            <div className="relative mt-1">
              <input
                name="mobilePhone"
                type="tel"
                placeholder="080XXXXXXXX"
                required
                onChange={(e) => handleNumericInput(e, 11)}
                className="w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-none focus:ring-2 focus:ring-green-500"
              />
              <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* TIN */}
          <div className="md:col-span-2">
            <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">TIN (Tax ID)</label>
            <div className="relative mt-1">
              <input
                name="tin"
                type="text"
                placeholder="10-13 digit number"
                onChange={(e) => handleNumericInput(e, 13)}
                className="w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-none focus:ring-2 focus:ring-green-500"
              />
              <IdentificationIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Residential Address *</label>
            <div className="relative mt-1">
              <textarea
                name="residentialAddress"
                placeholder="Full residential address"
                required
                rows={2}
                className="w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-none focus:ring-2 focus:ring-green-500"
              />
              <HomeIcon className="absolute left-3 top-4 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-between items-center gap-4">
        <Link
          href="/membership"
          className="text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancel & Exit
        </Link>
        <Button 
          type="submit" 
          disabled={isLoading} 
          className="bg-green-600 hover:bg-green-700 px-8 min-w-[160px]"
        >
          {isLoading ? 'Processing...' : 'Create Membership'}
        </Button>
      </div>
    </form>
  );
}