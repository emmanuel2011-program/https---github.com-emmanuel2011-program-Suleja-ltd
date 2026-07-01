import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = (auth?.user as any)?.role?.toLowerCase().trim() || ''; 
      
      const isAdmin = role === 'user' || role === 'admin';
      const isInvestor = role === 'investor';

      const pathname = nextUrl.pathname;
      const isOnLoginPage = pathname === '/login';
      const isOnDashboard = pathname.startsWith('/dashboard');

      // 1. Handling users on the Login Page
      if (isOnLoginPage) {
        if (isLoggedIn) {
          // Send them to their specific home base if they are already logged in
          const destination = isAdmin ? '/dashboard/admin' : '/dashboard/membership';
          return Response.redirect(new URL(destination, nextUrl));
        }
        return true;
      }

      // 2. Protecting the Dashboard
      if (isOnDashboard) {
        if (!isLoggedIn) return false; // Not logged in? Redirect to /login (handled by NextAuth)

        // RESTRICTION LOGIC
        // If an investor tries to access the root /dashboard, /dashboard/admin, or admin-only overviews
        const isTryingToAccessAdminArea = 
          pathname === '/dashboard' || 
          pathname.startsWith('/dashboard/admin') || 
          pathname.startsWith('/dashboard/overview');

        if (isInvestor && isTryingToAccessAdminArea) {
          return Response.redirect(new URL('/dashboard/membership', nextUrl));
        }

        // Optional: If an Admin accidentally wanders into /dashboard/membership, 
        // you could redirect them back to /dashboard/admin here as well.

        return true; 
      }

      return true;
    },
  },
  providers: [], 
} satisfies NextAuthConfig;