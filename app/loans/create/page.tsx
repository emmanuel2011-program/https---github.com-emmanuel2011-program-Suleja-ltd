import LoanApplicationForm from '@/app/ui/loans/create-form';
import Breadcrumbs from '@/app/ui/loans/breadcrumbs';
import { fetchMemberships } from '@/app/lib/data';

export default async function Page() {
  // If you want to let the user pick an existing member, fetch memberships
  const memberships = await fetchMemberships();

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
      <LoanApplicationForm/>
    </main>
  );
}
