import { assertUser } from '@/lib/auth-guards';
import { signOut } from '@/auth';
import type { ExtendedUser } from '@/lib/auth.types';

export default async function DashboardPage() {
  const session = await assertUser();
  const user = session.user as ExtendedUser;

  return (
    <main className="container mx-auto p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>
        <div className="bg-card text-card-foreground mb-4 rounded-lg border p-6">
          <h2 className="mb-4 text-xl font-semibold">Welcome back!</h2>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Name</dt>
              <dd>{user.name ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Role</dt>
              <dd>
                <span className="bg-primary text-primary-foreground inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold">
                  {user.role}
                </span>
              </dd>
            </div>
          </dl>
        </div>
        {user.role === 'ADMIN' && (
          <a
            href="/admin"
            className="text-primary mb-4 inline-block text-sm underline-offset-4 hover:underline"
          >
            Go to Admin Panel →
          </a>
        )}
        <form
          action={async () => {
            'use server';
            await signOut({ redirectTo: '/auth/login' });
          }}
        >
          <button
            type="submit"
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md px-4 py-2 text-sm font-medium"
          >
            Sign Out
          </button>
        </form>
      </div>
    </main>
  );
}
