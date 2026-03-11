import type { NextAuthConfig } from 'next-auth';
import GitHub from 'next-auth/providers/github';
import type { AugmentedToken, ExtendedUser } from '@/lib/auth.types';

export const authConfig: NextAuthConfig = {
  session: { strategy: 'jwt' },
  providers: [GitHub],
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      if (pathname.startsWith('/admin')) {
        if (!isLoggedIn) {
          return Response.redirect(new URL('/auth/login', nextUrl));
        }
        const role = (auth?.user as ExtendedUser | undefined)?.role;
        if (role !== 'ADMIN') {
          return Response.redirect(new URL('/forbidden', nextUrl));
        }
        return true;
      }

      if (pathname.startsWith('/dashboard')) {
        if (!isLoggedIn) {
          return Response.redirect(new URL('/auth/login', nextUrl));
        }
        return true;
      }

      if (pathname === '/auth/login' && isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        const t = token as AugmentedToken;
        const u = user as ExtendedUser;
        if (u.id !== undefined) t.id = u.id;
        if (u.role !== undefined) t.role = u.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        const t = token as AugmentedToken;
        const u = session.user as ExtendedUser;
        if (t.id !== undefined) u.id = t.id;
        if (t.role !== undefined) u.role = t.role;
      }
      return session;
    },
  },
};
