import Link from 'next/link';

export default function Page() {
  return (
    <>
      {/* Hero Section */}
      <section id="home" className="mt-6 flex flex-col md:flex-row gap-6">
        <div className="flex flex-col justify-center gap-4 md:w-2/5 bg-green-50 p-6 rounded-lg shadow">
          <p className="text-xl md:text-3xl font-bold text-green-700">
            WELCOME TO <br />
            SULEJA HH MULTIPURPOSE COOPERATIVE SOC LTD
          </p>
          <p className="text-green-600">
            Working Together with God to Empower Others. Learn more about our cooperative activities below.
          </p>

          <Link
            href="/about"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Learn More
          </Link>
        </div>

        <div className="md:w-3/5 flex justify-center items-center">
          <img
            src="/hero-desktop.png"
            alt="Cooperative hero"
            className="hidden md:block rounded-lg shadow"
          />
          <img
            src="/hero-mobile.png"
            alt="Cooperative hero mobile"
            className="block md:hidden rounded-lg shadow"
          />
        </div>
      </section>

      {/* Customers Section */}
      <section id="customers" className="mt-12 p-6 bg-green-50 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-2 text-green-700">Our Customers</h2>
        <p className="text-green-600">Details of our active and valued customers.</p>
      </section>

      {/* Loan Services Section */}
      <section id="loans" className="mt-12 p-6 bg-green-50 rounded-lg shadow text-center">
        <h2 className="text-2xl font-semibold mb-2 text-green-700">Loan Services</h2>
        <p className="mb-4 text-green-600">
          Become a member and apply for cooperative loans easily through our online application system.
        </p>
      </section>
    </>
  );
}
