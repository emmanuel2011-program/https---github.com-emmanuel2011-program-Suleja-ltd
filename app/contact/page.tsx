'use client';
import SideNav from '@/app/ui/dashboard/sidenav';
import Image from 'next/image';
import { EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { FaInstagram, FaFacebook } from "react-icons/fa";

export default function ContactPage() {
  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow rounded space-y-6">
      <h1 className="text-2xl font-bold text-green-700">Contact Page</h1>

      {/* Email */}
      <p className="flex items-center gap-2">
        <EnvelopeIcon className="w-5 h-5 text-green-600" />
        <a href="mailto:sfortefinance@yahoo.com" className="text-green-700 underline">
          sfortefinance@yahoo.com
        </a>
      </p>

      {/* Phone */}
      <p className="flex items-center gap-2">
        <PhoneIcon className="w-5 h-5 text-green-600" />
        <a href="tel:+2348050900409" className="text-green-700 underline">
          +2348050900409
        </a>
      </p>

      {/* Social Media */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-green-700">Follow us on:</h2>
        <ul className="flex gap-4">
          <li>
            <a
              href="https://www.instagram.com/shhmcop/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-pink-500 hover:underline"
            >
              <FaInstagram className="w-5 h-5" /> Instagram
            </a>
          </li>
          <li>
            <a
              href="https://web.facebook.com/profile.php?id=61588282931723"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-700 hover:underline"
            >
              <FaFacebook className="w-5 h-5" /> Facebook
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
