import { ArrowRightIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

// ... inside your LatestMembers component, at the very bottom ...

<div className="flex items-center pb-2 pt-6">
  <Link
    href="/dashboard/membership"
    className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
  >
    <span>View All Members</span>
    <ArrowRightIcon className="ml-1 w-4" />
  </Link>
</div>;

<div className="flex items-center pb-2 pt-6">
  <Link
    href="/dashboard/membership"
    className="flex w-full justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500 transition-colors"
  >
    View Full Member List
  </Link>
</div>