// app/ui/dashboard/SummaryCards.tsx

import { BanknotesIcon, ChartBarIcon, ArrowTrendingUpIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export default function SummaryCards({ data }: { data: any }) {
  const { loanSummary, investmentSummary } = data;

  const cards = [
    {
      title: 'Total Loan Portfolio',
      value: `₦${(loanSummary.totalPrincipal + loanSummary.totalInterest).toLocaleString()}`,
      sub: `Principal: ₦${loanSummary.totalPrincipal.toLocaleString()}`,
      icon: BanknotesIcon,
      color: 'text-blue-600',
    },
    {
      title: 'Accrued Loan Interest',
      value: `₦${loanSummary.totalInterest.toLocaleString()}`,
      sub: `Collected: ₦${loanSummary.totalPaid.toLocaleString()}`,
      icon: ArrowTrendingUpIcon,
      color: 'text-emerald-600',
    },
    {
      title: 'Active Investments',
      value: `₦${investmentSummary.totalValue.toLocaleString()}`,
      sub: `Expected ROI: ₦${investmentSummary.accruedRoi.toLocaleString()}`,
      icon: ChartBarIcon,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <div key={card.title} className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <card.icon className={`h-8 w-8 ${card.color}`} />
            <div>
              <p className="text-sm font-medium text-gray-500">{card.title}</p>
              <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
              <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}