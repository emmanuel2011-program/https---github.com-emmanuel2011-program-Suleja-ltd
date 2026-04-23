import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  // auth.config.ts
callbacks: {
  authorized({ auth, request: { nextUrl } }) {
    const isLoggedIn = !!auth?.user;
    const userEmail = auth?.user?.email?.toLowerCase() || '';
    const adminEmails = ['admin@shhmcsoc.me', 'info@shhmcsoc.me'];
    
    const isActuallyAdmin = adminEmails.includes(userEmail);
    const role = (auth?.user as any)?.role?.toLowerCase().trim() || ''; 
    const isAdmin = isActuallyAdmin || role === 'user' || role === 'admin';

    const pathname = nextUrl.pathname;
    const isOnLoginPage = pathname === '/login';
    const isOnDashboard = pathname.startsWith('/dashboard');

    // 1. Redirect logged-in users away from the Login page
    if (isOnLoginPage) {
      if (isLoggedIn) {
        return Response.redirect(new URL(isAdmin ? '/dashboard/admin' : '/dashboard/membership', nextUrl));
      }
      return true;
    }

    // 2. Dashboard Access Logic
    if (isOnDashboard) {
      if (!isLoggedIn) return false; // Kick to login if not logged in

      // LIST OF ROUTES INVESTORS CANNOT SEE
      const isForbiddenForInvestors = 
        pathname === '/dashboard' || 
        pathname.startsWith('/dashboard/overview') || 
        pathname.startsWith('/dashboard/admin');

      if (!isAdmin && isForbiddenForInvestors) {
        console.log("Investor attempted to access forbidden route:", pathname);
        return Response.redirect(new URL('/dashboard/membership', nextUrl));
      }

      return true; // If they are logged in and not hitting a forbidden route, let them through
    }

    return true;
  },
},
  providers: [], 
} satisfies NextAuthConfig;