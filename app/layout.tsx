import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import Header from '@/app/ui/header';
import { Toaster } from 'sonner';
import { auth } from '@/auth';
import { getPendingCount } from '@/app/lib/actions'; // Import the count function

export const dynamic = 'force-dynamic';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // 1. Fetch the session
  const session = await auth();

  // 2. Fetch pending count ONLY if user is admin (security & performance)
  const isAdmin = session?.user?.email === 'admin@coop.org';
  const pendingCount = isAdmin ? await getPendingCount() : 0;

  return (
    <html lang="en">
      <body className={`${inter.className} antialiased flex min-h-screen flex-col`}>
        <Toaster position="top-right" richColors closeButton />
        
        {/* 3. Pass both session and the count to the Header */}
        <Header session={session} pendingCount={pendingCount} />
        
        <main className="flex-1 p-6">
          {children}
        </main>
      </body>
    </html>
  );
}