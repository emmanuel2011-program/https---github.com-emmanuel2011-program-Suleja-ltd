import {
  BanknotesIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';

const iconMap = {
  portfolio: BanknotesIcon,
  members: UserGroupIcon,
  loans: ClipboardDocumentListIcon,
};

export default async function CardWrapper({
  numberOfMembers,
  numberOfLoans,
  totalLoanAmount,
}: {
  numberOfMembers: number;
  numberOfLoans: number;
  totalLoanAmount: number;
}) {
  return (
    <>
      <Card title="Total Members" value={numberOfMembers} type="members" />
      <Card title="Total Loans" value={numberOfLoans} type="loans" />
      <Card title="Loan Portfolio" value={`₦${totalLoanAmount.toLocaleString()}`} type="portfolio" />
    </>
  );
}

export function Card({
  title,
  value,
  type,
}: {
  title: string;
  value: number | string;
  type: 'members' | 'loans' | 'portfolio';
}) {
  const Icon = iconMap[type];

  return (
    <div className="rounded-xl bg-gray-50 p-2 shadow-sm">
      <div className="flex p-4">
        {Icon ? <Icon className="h-5 w-5 text-gray-700" /> : null}
        <h3 className="ml-2 text-sm font-medium">{title}</h3>
      </div>
      <p
        className={`${lusitana.className}
          truncate rounded-xl bg-white px-4 py-8 text-center text-2xl`}
      >
        {value}
      </p>
    </div>
  );
}
