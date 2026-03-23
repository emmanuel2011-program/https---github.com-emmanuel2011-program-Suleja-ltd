import Pagination from '@/app/ui/loans/pagination';
import Search from '@/app/ui/search';
import Table from '@/app/ui/loans/table';
import { CreateLoan } from '@/app/ui/loans/buttons';
import { lusitana } from '@/app/ui/fonts';
import { LoansTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';
import { fetchLoansPages } from '@/app/lib/actions';
import { auth } from '@/auth'; 
import { redirect } from 'next/navigation';

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const session = await auth();
  
  // 1. Cast the user as 'any' to bypass the "Property 'role' does not exist" error
  const user = session?.user as any;
  
  if (!user) redirect('/login');

  // 2. Now TypeScript will allow .role without squiggles
  const isAdmin = user.role === 'admin';

  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  
  // 3. Pass parameters to match your updated server action
  const totalPages = await fetchLoansPages(query, user.email, user.role);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>
          {isAdmin ? 'All Loan Applications' : 'My Loans'}
        </h1>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        {isAdmin ? (
          <Search placeholder="Search all loans..." />
        ) : (
          /* For non-admins, we hide the search bar to keep them 
             focused on their own records */
          <div className="flex-1" /> 
        )}
        <CreateLoan />
      </div>

      <Suspense key={query + currentPage} fallback={<LoansTableSkeleton />}>
        <Table 
          query={query} 
          currentPage={currentPage} 
          userRole={user.role} 
          userEmail={user.email} 
        />
      </Suspense>

      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}