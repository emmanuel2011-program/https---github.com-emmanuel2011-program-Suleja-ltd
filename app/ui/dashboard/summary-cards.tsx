'use client';

import {
  BanknotesIcon,
  ClockIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

// Added 'role' to the props definition
export default function SummaryCards({ data, role }: { data: any, role: string }) {
  const { loanSummary, investmentSummary } = data;

  // 1. SECURITY CHECK: If the role is 'investor', do not render anything.
  // This prevents the entire grid from appearing.
  if (role?.toLowerCase() === 'investor') {
    return null; 
  }

  const totalLoanValue = (loanSummary.totalPrincipal + loanSummary.totalInterest) - loanSummary.totalPaid;
  const totalInvestmentValue = investmentSummary.totalValue + investmentSummary.accruedRoi;

  const stats = [
    {
      title: 'Total Loan Portfolio',
      value: `₦${totalLoanValue.toLocaleString('en-NG')}`,
      sub: 'View all active loans',
      icon: BanknotesIcon,
      color: 'bg-blue-50 text-blue-600',
      href: '/dashboard/active-loans',
    },
    {
      title: 'Accrued Interest',
      value: `₦${loanSummary.totalInterest.toLocaleString('en-NG')}`,
      sub: 'Interest breakdown',
      icon: ChartBarIcon,
      color: 'bg-emerald-50 text-emerald-600',
      href: '/dashboard/loans', 
    },
    {
      title: 'Investment Value',
      value: `₦${totalInvestmentValue.toLocaleString('en-NG')}`,
      sub: 'View all active investments',
      icon: ClockIcon,
      color: 'bg-purple-50 text-purple-600',
      href: '/dashboard/investments',
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <Link
          key={stat.title}
          href={stat.href}
          className="block transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <h3 className="text-xl font-bold text-gray-900 truncate">
                  {stat.value}
                </h3>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
               <p className="text-xs text-gray-400 font-medium">{stat.sub}</p>
               <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">Click to view →</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}