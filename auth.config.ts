import type { NextAuthConfig } from 'next-auth';
 
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = (auth?.user as any)?.role; 
      
      const isOnAdminDashboard = nextUrl.pathname.startsWith('/dashboard/admin');
      const isOnDashboardRoot = nextUrl.pathname === '/dashboard'; // Exactly /dashboard
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnLoginPage = nextUrl.pathname === '/login';

      // 1. Handle Login Redirects (Landing Pages)
      if (isLoggedIn && (isOnLoginPage || isOnDashboardRoot)) {
        // If Admin: Go to Dashboard Overview
        if (role === 'admin') {
          return Response.redirect(new URL('/dashboard', nextUrl));
        }
        // If Investor: Go directly to Membership
        return Response.redirect(new URL('/dashboard/membership', nextUrl));
      }

      // 2. Protect Admin Specific Routes
      if (isOnAdminDashboard) {
        if (isLoggedIn && role === 'admin') return true;
        // If an investor tries to type /dashboard/admin manually, kick them to membership
        return Response.redirect(new URL('/dashboard/membership', nextUrl)); 
      }

      // 3. General Dashboard Protection
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login
      } 

      return true;
    },
  },
  providers: [], 
} satisfies NextAuthConfig;