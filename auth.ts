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

// ... existing imports (NextAuth, Credentials, etc.)

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
      if (user) {
        const adminEmails = ['admin@shhmcsoc.me', 'info@shhmcsoc.me'];
        const userEmail = user.email?.toLowerCase() || '';
        const isHardcodedAdmin = adminEmails.includes(userEmail);

        // THE FIX: 
        // 1. Check the database role first.
        // 2. If it's one of the hardcoded emails, force the role to 'user' (your admin role).
        // 3. Otherwise, default to 'investor'.
        token.role = (user as any).role || (isHardcodedAdmin ? 'user' : 'investor');
        token.email = userEmail;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        // Pass the corrected 'user' or 'investor' role to the session
        (session.user as any).role = token.role;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
});