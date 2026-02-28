'use client';

import Image from 'next/image';
import { EnvelopeIcon, PhoneIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { FaInstagram, FaFacebook } from "react-icons/fa";

export default function ContactPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-green-700 text-center">Contact Us</h1>

      {/* Grid for Offices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Head Office - Jikwoyi */}
        <div className="bg-white shadow-md rounded-xl overflow-hidden border border-green-100">
          <div className="relative h-52 w-full bg-gray-200">
            <Image 
              src="/suleja-office.png" 
              alt="suleja Headquarters picture"
              fill
              className="object-cover"
            />
          </div>
          <div className="p-5 space-y-3">
            <h2 className="text-xl font-bold text-green-800 flex items-center gap-2">
              <MapPinIcon className="w-6 h-6 text-green-600" />
              Headquarters
            </h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              Behind Old Timer Shed, Suleja <br />
              Niger State, Nigeria.
            </p>
          </div>
        </div>

        {/* Branch - Dei-Dei */}
        <div className="bg-white shadow-md rounded-xl overflow-hidden border border-green-100">
          <div className="relative h-52 w-full bg-gray-200">
            <Image 
              src="/deidei-office.png" 
              alt="Dei-Dei Branch"
              fill
              className="object-cover"
            />
          </div>
          <div className="p-5 space-y-3">
            <h2 className="text-xl font-bold text-green-800 flex items-center gap-2">
              <MapPinIcon className="w-6 h-6 text-green-600" />
              Dei-Dei Branch
            </h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              Opposite Regional Market, <br />
              Dei-Dei, FCT Abuja, Nigeria.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Details & Social Media Box */}
      <div className="bg-green-50 p-8 rounded-xl border border-green-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-green-800 underline decoration-green-300">Direct Support</h2>
            <p className="flex items-center gap-3">
              <EnvelopeIcon className="w-6 h-6 text-green-600" />
              <a href="mailto:sfortefinance@yahoo.com" className="text-green-700 font-medium hover:text-green-900">
                sfortefinance@yahoo.com
              </a>
            </p>
            <p className="flex items-center gap-3">
              <PhoneIcon className="w-6 h-6 text-green-600" />
              <a href="tel:+2348050900409" className="text-green-700 font-medium hover:text-green-900">
                +234 805 090 0409
              </a>
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-green-800 underline decoration-green-300">Follow Our Community</h2>
            <div className="flex gap-6">
              <a
                href="https://www.instagram.com/shhmcop/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-pink-600 font-bold hover:scale-110 transition-transform"
              >
                <FaInstagram className="w-7 h-7" /> Instagram
              </a>
              <a
                href="https://web.facebook.com/profile.php?id=61588282931723"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-700 font-bold hover:scale-110 transition-transform"
              >
                <FaFacebook className="w-7 h-7" /> Facebook
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}