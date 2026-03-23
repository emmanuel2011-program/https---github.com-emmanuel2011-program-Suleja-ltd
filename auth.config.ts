import type { NextAuthConfig } from 'next-auth';
 
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = (auth?.user as any)?.role; // Get the role we set in auth.ts
      
      const isOnAdminDashboard = nextUrl.pathname.startsWith('/dashboard/admin');
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnLoginPage = nextUrl.pathname === '/login';

      // 1. Protect Admin Routes
      if (isOnAdminDashboard) {
        if (isLoggedIn && role === 'admin') return true;
        return Response.redirect(new URL('/dashboard', nextUrl)); // Send non-admins to main dashboard
      }

      // 2. Protect General Dashboard
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login
      } 
      
      // 3. Redirect logged-in users away from the Login page
      if (isLoggedIn && isOnLoginPage) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      return true;
    },
  },
  providers: [], 
} satisfies NextAuthConfig;