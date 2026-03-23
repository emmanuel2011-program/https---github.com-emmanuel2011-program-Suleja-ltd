import SideNav from '@/app/ui/dashboard/sidenav';
import { auth } from '@/auth'; // Import your auth function

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        {/* Pass the session or user to the SideNav */}
        <SideNav user={session?.user} />
      </div>
      <div className="grow p-6 md:overflow-y-auto md:p-12">{children}</div>
    </div>
  );
}