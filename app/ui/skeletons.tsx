// Loading animation shimmer
const shimmer =
  'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

export function CardSkeleton() {
  return (
    <div
      className={`${shimmer} relative overflow-hidden rounded-xl bg-green-100 p-2 shadow-sm`}
    >
      <div className="flex p-4">
        <div className="h-5 w-5 rounded-md bg-green-200" />
        <div className="ml-2 h-6 w-24 rounded-md bg-green-200 text-sm font-medium" />
      </div>
      <div className="flex items-center justify-center truncate rounded-xl bg-white px-4 py-8">
        <div className="h-7 w-28 rounded-md bg-green-200" />
      </div>
    </div>
  );
}

export function CardsSkeleton() {
  return (
    <>
      <CardSkeleton /> {/* Total Members */}
      <CardSkeleton /> {/* Total Loans */}
      <CardSkeleton /> {/* Loan Portfolio */}
      <CardSkeleton /> {/* Any extra metric */}
    </>
  );
}

export function LoanChartSkeleton() {
  return (
    <div className={`${shimmer} relative w-full overflow-hidden md:col-span-4`}>
      <div className="mb-4 h-8 w-36 rounded-md bg-green-100" />
      <div className="rounded-xl bg-green-100 p-4">
        <div className="sm:grid-cols-13 mt-0 grid h-[410px] grid-cols-12 items-end gap-2 rounded-md bg-white p-4 md:gap-4" />
        <div className="flex items-center pb-2 pt-6">
          <div className="h-5 w-5 rounded-full bg-green-200" />
          <div className="ml-2 h-4 w-20 rounded-md bg-green-200" />
        </div>
      </div>
    </div>
  );
}

export function LoanSkeleton() {
  return (
    <div className="flex flex-row items-center justify-between border-b border-green-100 py-4">
      <div className="flex items-center">
        <div className="mr-2 h-8 w-8 rounded-full bg-green-200" />
        <div className="min-w-0">
          <div className="h-5 w-40 rounded-md bg-green-200" />
          <div className="mt-2 h-4 w-12 rounded-md bg-green-200" />
        </div>
      </div>
      <div className="mt-2 h-4 w-12 rounded-md bg-green-200" />
    </div>
  );
}

export function LatestLoansSkeleton() {
  return (
    <div
      className={`${shimmer} relative flex w-full flex-col overflow-hidden md:col-span-4`}
    >
      <div className="mb-4 h-8 w-36 rounded-md bg-green-100" />
      <div className="flex grow flex-col justify-between rounded-xl bg-green-100 p-4">
        <div className="bg-white px-6">
          <LoanSkeleton />
          <LoanSkeleton />
          <LoanSkeleton />
          <LoanSkeleton />
          <LoanSkeleton />
        </div>
        <div className="flex items-center pb-2 pt-6">
          <div className="h-5 w-5 rounded-full bg-green-200" />
          <div className="ml-2 h-4 w-20 rounded-md bg-green-200" />
        </div>
      </div>
    </div>
  );
}

export default function CooperativeDashboardSkeleton() {
  return (
    <>
      <div
        className={`${shimmer} relative mb-4 h-8 w-36 overflow-hidden rounded-md bg-green-100`}
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <CardsSkeleton />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <LoanChartSkeleton />
        <LatestLoansSkeleton />
      </div>
    </>
  );
}

export function LoansTableSkeleton() {
  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-green-50 p-2 md:pt-0">
          <div className="md:hidden">
            <LoanSkeleton />
            <LoanSkeleton />
            <LoanSkeleton />
            <LoanSkeleton />
            <LoanSkeleton />
            <LoanSkeleton />
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th className="px-4 py-5 font-medium sm:pl-6">Member</th>
                <th className="px-3 py-5 font-medium">Email</th>
                <th className="px-3 py-5 font-medium">Loan Amount</th>
                <th className="px-3 py-5 font-medium">Request Date</th>
                <th className="px-3 py-5 font-medium">Status</th>
                <th className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <tr><td colSpan={6}><LoanSkeleton /></td></tr>
              <tr><td colSpan={6}><LoanSkeleton /></td></tr>
              <tr><td colSpan={6}><LoanSkeleton /></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

