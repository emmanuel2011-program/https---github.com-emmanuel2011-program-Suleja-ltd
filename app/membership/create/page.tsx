import MembershipForm from '@/app/ui/memberships/create-form';
import Breadcrumbs from '@/app/ui/memberships/breadcrumbs';
import { fetchMemberships } from '@/app/lib/data';

export default async function Page() {
  // Fetch memberships if needed for dropdowns or validation
  const memberships = await fetchMemberships();

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        <Breadcrumbs
          breadcrumbs={[
            { label: 'Memberships', href: '/membership' },
            {
              label: 'Create Membership',
              href: '/membership/create',
              active: true,
            },
          ]}
        />
        
        <div className="mt-8">
          {/* The MembershipForm we built is max-w-2xl. 
            This wrapper ensures it sits nicely below the breadcrumbs.
          */}
          <MembershipForm />
        </div>
      </div>
    </main>
  );
}