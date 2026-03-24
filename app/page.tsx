'use client';

import { registerUser } from '@/app/lib/actions';
import { useState } from 'react';
import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

export default function Page() {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const result = await registerUser(formData);
    if (result?.message) setError(result.message);
  }

  return (
    <main className="min-h-screen bg-white">
      {/* 1. Header/Navigation */}
      <header className="flex h-20 items-center justify-between px-6 md:px-12 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white font-black">S</div>
          <span className="text-green-800 font-black tracking-tighter text-lg uppercase">Suleja HH Co-op</span>
        </div>
        <Link 
          href="/login" 
          className="text-sm font-bold text-green-700 hover:text-green-900 flex items-center gap-1"
        >
          Member Login <ChevronRightIcon className="h-4 w-4" />
        </Link>
      </header>

      {/* 2. Hero + Register Section */}
      <section className="flex flex-col lg:flex-row items-center justify-center p-6 md:p-12 lg:p-20 gap-12 bg-gradient-to-b from-green-50 to-white">
        
        {/* Left Side: Cooperative Info */}
        <div className="flex flex-col gap-6 md:w-1/2 max-w-2xl">
          <div className="inline-block px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-black uppercase tracking-widest">
            Empowering Others Since 2016
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-[1.1]">
            Working Together <br />
            <span className="text-green-600">with God</span> to <br />
            Empower You.
          </h1>
          <p className="text-lg text-gray-600 font-medium leading-relaxed">
            Welcome to **Suleja HH Multipurpose Cooperative Soc Ltd**. Join a community dedicated to financial growth, transparent loan services, and mutual support.
          </p>
          
          <div className="flex items-center gap-4 mt-4">
             <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200" />
                ))}
             </div>
             <p className="text-sm font-bold text-gray-500">Joined by 500+ members this month</p>
          </div>
        </div>

        {/* Right Side: The Register Form */}
        <div className="w-full max-w-[480px]">
          <form 
            action={handleSubmit} 
            className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-green-100"
          >
            <h2 className="text-2xl font-black text-gray-900">Become a Member</h2>
            <p className="text-gray-400 text-sm mb-6 font-medium">Start your investment journey today.</p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-[11px] font-black border border-red-100 uppercase tracking-tight">
                ⚠️ {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input name="firstName" placeholder="First Name" required className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-green-500 outline-none text-sm" />
                <input name="surname" placeholder="Surname" required className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-green-500 outline-none text-sm" />
              </div>

              <input name="email" type="email" placeholder="Email Address" required className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-green-500 outline-none text-sm" />

              <div className="relative">
                <select name="role" required className="w-full appearance-none px-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-green-500 outline-none font-bold text-gray-700 text-sm cursor-pointer">
                  <option value="investor">Apply as Member/Investor</option>
                  <option value="admin">Apply as Administrator</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input name="password" type="password" placeholder="Password" required minLength={6} className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-green-500 outline-none text-sm" />
                <input name="confirmPassword" type="password" placeholder="Confirm" required minLength={6} className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-green-500 outline-none text-sm" />
              </div>

              <button type="submit" className="w-full py-4 mt-2 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl transition-all active:scale-95 transform hover:-translate-y-1">
                Register Account
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 3. Features Section (Your existing content) */}
      <section className="py-20 px-6 md:px-20 grid md:grid-cols-2 gap-8">
        <div id="customers" className="p-10 bg-green-50 rounded-[2rem] border border-green-100">
          <h2 className="text-2xl font-black text-green-800 mb-4">Our Valued Members</h2>
          <p className="text-green-700 font-medium leading-relaxed">
            We prioritize our members by providing them with real-time updates on their investments and contribution growth.
          </p>
        </div>

        <div id="loans" className="p-10 bg-blue-50 rounded-[2rem] border border-blue-100">
          <h2 className="text-2xl font-black text-blue-800 mb-4">Loan Services</h2>
          <p className="text-blue-700 font-medium leading-relaxed">
            Quick, easy, and transparent loan applications. Get the support you need for your business or personal growth.
          </p>
        </div>
      </section>
    </main>
  );
}