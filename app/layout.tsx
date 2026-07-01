import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import Header from '@/app/ui/header';
import { Toaster } from 'sonner';
import { auth } from '@/auth';
import { getPendingCount } from '@/app/lib/actions'; 

export const dynamic = 'force-dynamic';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // 1. Fetch the session
  const session = await auth();

  // 2. Identify Admin status
  const userEmail = session?.user?.email?.toLowerCase();
  const isAdmin = userEmail === 'admin@shhmcsoc.me' || userEmail === 'info@shhmcsoc.me';
  
  // 3. Fetch count (only for admins to save database resources)
  const pendingCount = isAdmin ? await getPendingCount() : 0;

  return (
    <html lang="en">
      <body className={`${inter.className} antialiased flex min-h-screen flex-col bg-gray-50`}>
        <Toaster position="top-right" richColors closeButton />
        
        {/* The Header receives the count and session here */}
        <Header session={session} pendingCount={pendingCount} />
        
        <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6">
          {children}
        </main>
        
        <footer className="p-4 text-center text-xs text-gray-400 border-t bg-white">
          © {new Date().getFullYear()} SulejaHH Cooperative Society
        </footer>
      </body>
    </html>
  );
}