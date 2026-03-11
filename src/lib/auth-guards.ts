import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import type { UserRole, ExtendedUser } from '@/lib/auth.types';

interface RequireAuthOptions {
  requiredRole?: UserRole;
}

export async function requireAuth(opts?: RequireAuthOptions) {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/login');
  }

  const user = session.user as ExtendedUser;

  if (opts?.requiredRole) {
    if (user.role !== opts.requiredRole) {
      redirect('/forbidden');
    }
  }

  return session;
}

export async function assertAdmin() {
  return requireAuth({ requiredRole: 'ADMIN' });
}

export async function assertUser() {
  return requireAuth();
}
