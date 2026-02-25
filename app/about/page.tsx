'use client';

import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-12">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center gap-6">
        <div className="md:w-2/5">
          <h1 className="text-3xl font-bold text-blue-700 mb-4">
            About SULEJA H H Multipurpose Cooperative Society LTD.
          </h1>
          <p className="text-gray-700 leading-relaxed">
            We are a cooperative loan society committed to empowering our members through financial
            services, savings, and loans. Our mission is to help individuals and families access
            affordable loans, manage their finances, and support community development.
          </p>
        </div>
        <div className="md:w-3/5">
          <Image
            src="/cooperative-group.jpg" // replace with your real image
            alt="Cooperative members meeting"
            width={600}
            height={400}
            className="rounded-lg shadow"
          />
        </div>
      </section>

      {/* Our Mission */}
      <section className="bg-blue-50 p-6 rounded-lg shadow space-y-4">
        <h2 className="text-2xl font-semibold text-blue-700">Our Mission</h2>
        <p className="text-gray-700">
          To provide financial assistance and support to our members while promoting savings,
          responsible borrowing, and cooperative growth.
        </p>
      </section>

      {/* What We Do */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-blue-700">What We Do</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Provide short-term and long-term loans to members.</li>
          <li>Encourage savings and responsible financial management.</li>
          <li>Support community projects and member development programs.</li>
          <li>Offer educational workshops on financial literacy.</li>
          <li>Promote a cooperative spirit where everyone contributes and benefits.</li>
        </ul>
      </section>

      {/* How to Join */}
      <section className="bg-blue-50 p-6 rounded-lg shadow space-y-4">
        <h2 className="text-2xl font-semibold text-blue-700">How to Become a Member</h2>
        <p className="text-gray-700">
          Anyone interested in joining our cooperative society can apply for membership by filling
          out a membership application form and meeting our simple eligibility criteria. Members
          enjoy access to loans, savings plans, and community benefits.
        </p>
      </section>
    </div>
  );
}