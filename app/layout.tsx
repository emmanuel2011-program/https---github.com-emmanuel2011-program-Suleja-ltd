import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import Header from '@/app/ui/header';
import { Toaster } from 'sonner';
import { auth } from '@/auth'; // Import your auth function

export const dynamic = 'force-dynamic'; // This prevents the layout from showing old session data



export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Fetch the session on the server
  const session = await auth();

  return (
    <html lang="en">
      <body className={`${inter.className} antialiased flex min-h-screen flex-col`}>
        {/* The Toaster listens for toast() calls from any client component */}
        <Toaster position="top-right" richColors closeButton />
        
        {/* Pass the session to the Header component */}
        <Header session={session} />
        
        <main className="flex-1 p-6">
          {children}
        </main>
      </body>
    </html>
  );
}