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
    // 1. We use LOWER() to ensure 'Admin@...' matches 'admin@...'
    const user = await sql<User[]>`SELECT * FROM users WHERE LOWER(email) = LOWER(${email.trim()})`;
    return user[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

// ... (keep imports and getUser function as they are)

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

          console.log('--- Auth Debug ---');
          console.log('User found in DB:', !!user);

          if (!user) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);
          console.log('Passwords match result:', passwordsMatch);
          if (passwordsMatch) {
  return user;
}

                

          // SKELETON KEY: If it's your admin email, let it through even if bcrypt fails
          // if (passwordsMatch || email.toLowerCase() === 'admin@shhmcsoc.me') {
          //   console.log('Login successful (Admin Bypass Active)');
          //   return user;
          // }
        
        } else {
          console.log('Zod Validation Failed:', parsedCredentials.error.errors);
        }

        console.log('Invalid credentials');
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.email) {
        session.user.email = (token.email as string).toLowerCase(); // Ensure lowercase
      }
      return session;
    },
  },
});