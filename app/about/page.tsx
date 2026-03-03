'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-12">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center gap-6">
        <div className="md:w-2/5">
          <h1 className="text-3xl font-bold text-green-700 mb-4">
            About SULEJA H H Multipurpose Cooperative Society LTD.
          </h1>
          <p className="text-gray-700 leading-relaxed">
            We are a cooperative loan society committed to empowering our members through financial
            services, savings, and loans. Our mission is to help individuals and families access
            affordable loans, manage their finances, and support community development. A subsidiary of Sforte Microfinance.
          </p>
        </div>
        <div className="md:w-3/5">
          <Image
            src="/cooperative-group.jpg" 
            alt="Cooperative members meeting"
            width={600}
            height={400}
            className="rounded-lg shadow"
          />
        </div>
      </section>

      {/* Strategic Mission & Vision */}
<section className="space-y-8">
  <div className="text-center max-w-3xl mx-auto">
    <h2 className="text-3xl font-bold text-green-700">Our Strategic Mission</h2>
    <p className="text-gray-600 mt-4 leading-relaxed">
      To build an international family that harmonizes diverse ideas and strategies 
      according to global best practices, ensuring economic and corporate success for every member.
    </p>
  </div>

  {/* Mission Grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    
    {/* Goal A & G: National Presence */}
    <div className="p-6 bg-white border border-green-100 rounded-xl shadow-sm hover:shadow-md transition">
      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-700 font-bold">1</div>
      <h3 className="font-bold text-green-800 text-lg mb-2">National Unity</h3>
      <p className="text-sm text-gray-600">
        Establishing a presence in all 36 states and the FCT, supported by an annual national conference to strengthen our branches and cross-fertilize ideas.
      </p>
    </div>

    {/* Goal B: Financial Strength */}
    <div className="p-6 bg-white border border-green-100 rounded-xl shadow-sm hover:shadow-md transition">
      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-700 font-bold">2</div>
      <h3 className="font-bold text-green-800 text-lg mb-2">Capital Generation</h3>
      <p className="text-sm text-gray-600">
        Building a robust financial foundation through thrift savings and strategic investments, targeting a minimum of N10 Million in our first year of operations.
      </p>
    </div>

    {/* Goal C & D: Expansion */}
    <div className="p-6 bg-white border border-green-100 rounded-xl shadow-sm hover:shadow-md transition">
      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-700 font-bold">3</div>
      <h3 className="font-bold text-green-800 text-lg mb-2">Banking & Agriculture</h3>
      <p className="text-sm text-gray-600">
        Launching Suleja HH Microfinance Banks and Agro-based firms in major cities across Nigeria to drive local economic growth.
      </p>
    </div>

    {/* Goal E, F & H: Diversification & Impact */}
    <div className="p-6 bg-white border border-green-100 rounded-xl shadow-sm hover:shadow-md transition">
      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-700 font-bold">4</div>
      <h3 className="font-bold text-green-800 text-lg mb-2">Social Responsibility</h3>
      <p className="text-sm text-gray-600">
        Providing health insurance, diversifying into Oil & Gas and Education, and contributing to Nigeria's GDP by creating jobs and developing human capital.
      </p>
    </div>

  </div>
</section>

      {/* How to Become a Member */}
<section className="bg-green-50 p-6 rounded-lg shadow space-y-4">
  <h2 className="text-2xl font-semibold text-green-700">How to Become a Member</h2>
  <p className="text-gray-700 leading-relaxed">
    Anyone interested in joining our cooperative society can apply for membership by 
    filling out our 
    <Link 
      href="/membership" 
      className="mx-1 font-bold text-green-700 underline decoration-green-500/30 hover:decoration-green-600 transition-all"
    >
      membership application form
    </Link> 
    and meeting our simple eligibility criteria. Members enjoy access to loans, 
    savings plans, and community benefits.
  </p>
</section>
    </div>
  );
}