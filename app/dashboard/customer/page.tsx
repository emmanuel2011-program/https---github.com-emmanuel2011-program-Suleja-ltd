import Pagination from '@/app/ui/loans/pagination';
import Search from '@/app/ui/search';
import Table from '@/app/ui/loans/table';
import { CreateLoan } from '@/app/ui/loans/buttons';
import { lusitana } from '@/app/ui/fonts';
import { LoansTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';
import { fetchLoansPages } from '@/app/lib/data';

export default async function Page(props: {
   searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchLoansPages(query);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Loans</h1>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search loans..." />
        <CreateLoan />
      </div>

      {/* Example Suspense wrapper for cooperative loans table */}
      <Suspense key={query + currentPage} fallback={<LoansTableSkeleton />}>
        <Table query={query} currentPage={currentPage} />
      </Suspense>

      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
