'use client';

import { registerUser } from '@/app/lib/actions';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import router for redirect
import { ChevronRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function Page() {
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false); // New Success State
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setError(null);
    setIsLoading(true);

    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    const result = await registerUser(formData);
    
    if (result?.success) {
      setIsSuccess(true);
      // Wait 3 seconds then redirect
      setTimeout(() => {
        router.push('/login');
      }, 3500);
    } else {
      setError(result?.message || "An error occurred during registration");
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white relative">
      {/* SUCCESS MODAL POPUP */}
      {isSuccess && (
        <div className="fixed inset-0 bg-green-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full text-center shadow-2xl border-t-8 border-green-600 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Welcome Aboard!</h2>
            <p className="text-sm text-gray-500 mt-3 font-bold leading-relaxed">
              Your registration was successful. You are now a member of the Suleja HH Co-op family.
            </p>
            <p className="text-[10px] text-green-600 font-black uppercase mt-6 tracking-widest animate-pulse">
              Redirecting to Login...
            </p>
            <div className="mt-4 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-600 transition-all duration-[3000ms] ease-linear w-full" 
                   style={{ animation: 'progress 3.5s linear forwards' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* 1. Header/Navigation */}
      <header className="flex h-20 items-center justify-between px-6 md:px-12 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white font-black text-xl">S</div>
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
            <span className="text-green-600 font-black">with God</span> to <br />
            Empower You.
          </h1>
          <p className="text-lg text-gray-600 font-medium leading-relaxed">
            Welcome to **Suleja HH Multipurpose Cooperative Soc Ltd**. Join a community dedicated to financial growth and mutual support.
          </p>
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

              <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full py-4 mt-2 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl transition-all transform hover:-translate-y-1 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
              >
                {isLoading ? 'Processing...' : 'Register Account'}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 3. Features Section */}
      <section className="py-20 px-6 md:px-20 grid md:grid-cols-2 gap-8 bg-white">
        <div className="p-10 bg-green-50 rounded-[2rem] border border-green-100">
          <h2 className="text-2xl font-black text-green-800 mb-4 uppercase tracking-tighter">Our Valued Members</h2>
          <p className="text-green-700 font-medium leading-relaxed">
            We prioritize our members by providing them with real-time updates on their investments and contribution growth.
          </p>
        </div>

        <div className="p-10 bg-blue-50 rounded-[2rem] border border-blue-100">
          <h2 className="text-2xl font-black text-blue-800 mb-4 uppercase tracking-tighter">Loan Services</h2>
          <p className="text-blue-700 font-medium leading-relaxed">
            Quick, easy, and transparent loan applications. Get the support you need for your business or personal growth.
          </p>
        </div>
      </section>

      {/* Progress Bar Animation Styles */}
      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </main>
  );
}