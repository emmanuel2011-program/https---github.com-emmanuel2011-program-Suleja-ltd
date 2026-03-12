import Image from 'next/image';
import { UpdateLoan, DeleteLoan } from '@/app/ui/loans/buttons';
import LoanStatus from '@/app/ui/loans/status';
import { formatDateToLocal, formatCurrency } from '@/app/lib/utils';
import { fetchFilteredLoans } from '@/app/lib/data';
import { EnvelopeIcon } from '@heroicons/react/24/outline'; // Add this import

export default async function LoansTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const loans = await fetchFilteredLoans(query, currentPage);

  // Helper to generate Yahoo Search Link
  const getYahooSearchLink = (searchQuery: string) => {
    // This deep-links to Yahoo Mail search for that specific email
    return `https://mail.yahoo.com/d/search/keyword=${encodeURIComponent(searchQuery)}`;
  };

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-green-50 p-2 md:pt-0">
          
          {/* Mobile view */}
          <div className="md:hidden">
            {loans?.map((loan) => (
              <div key={loan.id} className="mb-2 w-full rounded-md bg-white p-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="mb-2 flex items-center">
                      <Image
                        src="/member-placeholder.png"
                        className="mr-2 rounded-full"
                        width={28}
                        height={28}
                        alt={`${loan.surname} ${loan.firstName}'s profile`}
                      />
                      <p className="font-bold">{loan.surname} {loan.firstName}</p>
                    </div>
                    <p className="text-sm text-gray-500">{loan.email}</p>
                  </div>
                  <LoanStatus status="Pending" />
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <p className="text-xl font-medium">{formatCurrency(loan.loanAmount)}</p>
                    {/* MOBILE VERIFY BUTTON */}
                    <a 
                      href={getYahooSearchLink(loan.email)} 
                      target="_blank" 
                      className="mt-2 flex items-center gap-1 text-xs font-bold text-green-700 underline"
                    >
                      <EnvelopeIcon className="h-4 w-4" /> Verify Docs in Yahoo
                    </a>
                  </div>
                  <div className="flex justify-end gap-2">
                    <UpdateLoan id={loan.id} />
                    <DeleteLoan id={loan.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop view */}
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">Member</th>
                <th scope="col" className="px-3 py-5 font-medium">Email</th>
                <th scope="col" className="px-3 py-5 font-medium text-center">Check Documents</th>
                <th scope="col" className="px-3 py-5 font-medium">Loan Amount</th>
                <th scope="col" className="px-3 py-5 font-medium">Request Date</th>
                <th scope="col" className="px-3 py-5 font-medium">Status</th>
                <th scope="col" className="relative py-3 pl-6 pr-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {loans?.map((loan) => (
                <tr key={loan.id} className="w-full border-b py-3 text-sm last-of-type:border-none">
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <Image src="/member-placeholder.png" className="rounded-full" width={28} height={28} alt="profile" />
                      <p>{loan.surname} {loan.firstName}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">{loan.email}</td>
                  
                  {/* NEW COLUMN: VERIFY DOCUMENTS */}
                  <td className="whitespace-nowrap px-3 py-3 text-center">
                    <a
                      href={getYahooSearchLink(loan.email)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-md bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                      title="Search Yahoo Mail for this user's documents"
                    >
                      <EnvelopeIcon className="h-4 w-4" />
                      Verify in Yahoo
                    </a>
                  </td>

                  <td className="whitespace-nowrap px-3 py-3 font-semibold">{formatCurrency(loan.loanAmount)}</td>
                  <td className="whitespace-nowrap px-3 py-3">{formatDateToLocal(loan.requestDate)}</td>
                  <td className="whitespace-nowrap px-3 py-3"><LoanStatus status="Pending" /></td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <UpdateLoan id={loan.id} />
                      <DeleteLoan id={loan.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}