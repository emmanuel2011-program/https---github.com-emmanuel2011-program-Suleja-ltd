import { generateYAxis } from '@/app/lib/utils';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';

// Define a type for cooperative loan data
export type LoanData = {
  month: string;
  loan_amount: number;
};

export default async function LoanChart({
  loans,
}: {
  loans: LoanData[];
}) {
  const chartHeight = 350;

  // const { yAxisLabels, topLabel } = generateYAxis(loans.map(l => ({ month: l.month, revenue: l.loan_amount })));

  // if (!loans || loans.length === 0) {
  //   return <p className="mt-4 text-gray-400">No loan data available.</p>;
  // }

  return (
    <div className="w-full md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Loan Portfolio (Recent Months)
      </h2>

      {/* Uncomment in Chapter 7 */}
      {/* <div className="rounded-xl bg-gray-50 p-4">
        <div className="sm:grid-cols-13 mt-0 grid grid-cols-12 items-end gap-2 rounded-md bg-white p-4 md:gap-4">
          <div
            className="mb-6 hidden flex-col justify-between text-sm text-gray-400 sm:flex"
            style={{ height: `${chartHeight}px` }}
          >
            {yAxisLabels.map((label) => (
              <p key={label}>{label}</p>
            ))}
          </div>

          {loans.map((loan) => (
            <div key={loan.month} className="flex flex-col items-center gap-2">
              <div
                className="w-full rounded-md bg-green-400"
                style={{
                  height: `${(chartHeight / topLabel) * loan.loan_amount}px`,
                }}
              ></div>
              <p className="-rotate-90 text-sm text-gray-400 sm:rotate-0">
                {loan.month}
              </p>
            </div>
          ))}
        </div>
        <div className="flex items-center pb-2 pt-6">
          <CalendarIcon className="h-5 w-5 text-gray-500" />
          <h3 className="ml-2 text-sm text-gray-500 ">Last 12 months</h3>
        </div>
      </div> */}
    </div>
  );
}
