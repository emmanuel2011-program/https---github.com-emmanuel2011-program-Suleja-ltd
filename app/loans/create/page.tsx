import LoanApplicationForm from '@/app/ui/loans/create-form';
import Breadcrumbs from '@/app/ui/loans/breadcrumbs';
import { fetchMemberships } from '@/app/lib/data';

export default async function Page() {
  // 1. Fixed: Called 'fetchMemberships' (matching your import)
  // 2. Fixed: Named the variable 'members' (matching what your form expects below)
  const members = await fetchMemberships();

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Loans', href: '/app/loans' },
          {
            label: 'Create Loan Application',
            href: '/app/loans/create',
            active: true,
          },
        ]}
      />
      {/* 3. Fixed: 'members' now refers to the variable defined on line 7 */}
      <LoanApplicationForm members={members} />
    </main>
  );
}