import Form from '@/app/ui/loans/create-form';
import Breadcrumbs from '@/app/ui/loans/breadcrumbs';
import { fetchAllMembers } from '@/app/lib/data'; // Ensure this matches your filename

export default async function Page() {
  // 1. We use the exact name we imported above
  const members = await fetchAllMembers(); 

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Loans', href: '/dashboard/loans' },
          {
            label: 'Create Loan',
            href: '/dashboard/loans/create',
            active: true,
          },
        ]}
      />
      {/* 2. The 'members' variable here now matches the one defined above */}
      <Form members={members} />
    </main>
  );
}