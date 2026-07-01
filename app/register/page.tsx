// app/register/page.tsx
'use client';

import { registerUser } from '@/app/lib/actions';
import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    // Basic client-side validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const result = await registerUser(formData);
    
    // If registerUser returns an object with a message on failure
    if (result?.message) {
      setError(result.message);
    }
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="relative mx-auto flex w-full max-w-[450px] flex-col space-y-4">
        <div className="flex h-24 w-full items-end rounded-xl bg-green-700 p-4 shadow-lg">
          <div className="text-white text-2xl font-black tracking-tight">
            Co-op Portal Signup
          </div>
        </div>

        <form 
          action={handleSubmit} 
          className="space-y-4 bg-white px-8 pb-8 pt-10 rounded-2xl shadow-xl border border-gray-100"
        >
          <h1 className="text-3xl font-black text-gray-900 mb-6">Create Account</h1>
          
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-xs font-bold border border-red-100 animate-shake">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-500 mb-1 ml-1">First Name</label>
              <input name="firstName" required className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-green-500 outline-none font-medium" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-500 mb-1 ml-1">Surname</label>
              <input name="surname" required className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-green-500 outline-none font-medium" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-gray-500 mb-1 ml-1">Email Address</label>
            <input name="email" type="email" required className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-green-500 outline-none font-medium" />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-gray-500 mb-1 ml-1">Account Type</label>
            <div className="relative">
              <select 
                name="role" 
                required 
                className="w-full appearance-none px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-green-500 outline-none font-bold text-gray-700 cursor-pointer"
              >
                <option value="investor">Standard Investor</option>
                <option value="admin">System Administrator</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-500 mb-1 ml-1">Password</label>
              <input name="password" type="password" required minLength={6} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-green-500 outline-none font-medium" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-500 mb-1 ml-1">Confirm Password</label>
              <input name="confirmPassword" type="password" required minLength={6} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-green-500 outline-none font-medium" />
            </div>
          </div>

          <button type="submit" className="w-full py-4 mt-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black uppercase tracking-widest text-sm shadow-lg transition-all active:scale-95">
            Register Now
          </button>

          <p className="text-center text-xs text-gray-500 font-bold pt-4">
            Already a member? <Link href="/login" className="text-green-600 hover:underline">Log in here</Link>
          </p>
        </form>
      </div>
    </main>
  );
}