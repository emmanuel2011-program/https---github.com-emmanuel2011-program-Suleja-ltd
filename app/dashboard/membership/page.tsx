import { fetchAllMembers } from '@/app/lib/data';
import { lusitana } from '@/app/ui/fonts';
import MemberTableWrapper from '@/app/ui/memberships/table-wrapper';

// This line is the fix! It forces Vercel to fetch fresh data on every request.
export const dynamic = 'force-dynamic';

export default async function Page() {
  const members = await fetchAllMembers();

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between mb-4">
        <h1 className={`${lusitana.className} text-2xl text-green-700 font-bold`}>
          Member Directory
        </h1>
      </div>
      
      {/* This component handles the 'Explore' button and 'Search' bar */}
      <MemberTableWrapper members={members} />
    </div>
  );
}