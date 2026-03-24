import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { z } from 'zod';
import type { User } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User[]>`SELECT * FROM users WHERE LOWER(email) = LOWER(${email.trim()})`;
    return user[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);

          if (!user) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);
          
          if (passwordsMatch) {
            return user; 
          }
        }
        return null;
      },
    }),
  ],
  
  callbacks: {
  async jwt({ token, user }) {
    // This 'user' object comes from your 'getUser' function in the database
    if (user) {
      token.email = user.email;
      
      // Use the role from the database if it exists, 
      // otherwise fallback to the adminEmail list as a backup.
      const adminEmails = ['admin@shhmcsoc.me', 'info@shhmcsoc.me'];
      const isHardcodedAdmin = adminEmails.includes(user.email?.toLowerCase() || '');
      
      // Priority: 1. Database Role, 2. Hardcoded Admin List, 3. Default 'investor'
      token.role = (user as any).role || (isHardcodedAdmin ? 'admin' : 'investor');
    }
    return token;
  },

  async session({ session, token }) {
    if (session.user) {
      session.user.email = (token.email as string || '').toLowerCase();
      // This allows you to use session.user.role in your components
      (session.user as any).role = token.role as string; 
    }
    return session;
  },
  },
});