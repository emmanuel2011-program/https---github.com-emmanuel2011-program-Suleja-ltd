import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import Header from '@/app/ui/header';
import { Toaster } from 'sonner';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased flex min-h-screen flex-col`}>
        {/* The Toaster listens for toast() calls from any client component */}
        <Toaster position="top-right" richColors closeButton />
        
        <Header />
        <main className="flex-1 p-6">{children}</main>
      </body>
    </html>
  );
}