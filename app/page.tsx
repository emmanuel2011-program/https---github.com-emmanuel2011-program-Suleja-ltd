import AcmeLogo from '@/app/ui/acme-logo';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import styles from '@/app/ui/home.module.css';
import { lusitana } from '@/app/ui/fonts';
import Image from 'next/image';


export default function Page() {
  return (
    <main className="flex min-h-screen flex-col p-6">
      {/* Hero Section */}
      <section id="home" className="mt-6 flex flex-col md:flex-row gap-6">
        <div className="flex flex-col justify-center gap-4 md:w-2/5 bg-white p-6 rounded-lg shadow">
          <p className="text-xl md:text-3xl font-bold text-gray-800">
            WELCOME TO <br />
            SULEJA HH MULTIPURPOSE COOPERATIVE SOC NIGERIA LIMITED
          </p>
          <p className="text-gray-700">
            Working Together with God to Empower Others. Learn more about our cooperative activities below.
          </p>

          <Link
            href="/about"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Learn More <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>

        <div className="md:w-3/5 flex justify-center items-center">
          <Image
            src="/hero-desktop.png"
            width={1000}
            height={760}
            alt="Cooperative hero"
            className="hidden md:block"
          />
          <Image
            src="/hero-mobile.png"
            width={560}
            height={620}
            className="block md:hidden"
            alt="Screenshot of the dashboard project showing mobile version"
          />
        </div>
      </section>

      {/* Customers Section */}
      <section id="customers" className="mt-12 p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-2">Our Customers</h2>
        <p>Details of our active and valued customers.</p>
      </section>

      {/* Loan Services Section */}
      <section id="loans" className="mt-12 p-6 bg-white rounded-lg shadow text-center">
        <h2 className="text-2xl font-semibold mb-2">Loan Services</h2>
        <p className="mb-4">
          Become a member and apply for cooperative loans easily through our online application system.
        </p>

      </section>

    </main>
  );
}