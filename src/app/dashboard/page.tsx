import { assertUser } from '@/lib/auth-guards';
import { signOut } from '@/auth';
import type { ExtendedUser } from '@/lib/auth.types';

export default async function DashboardPage() {
  const session = await assertUser();
  const user = session.user as ExtendedUser;

  return (
    <main className="container mx-auto p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="bg-card text-card-foreground rounded-lg border p-6 mb-4">
          <h2 className="text-xl font-semibold mb-4">Welcome back!</h2>
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
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary text-primary-foreground">
                  {user.role}
                </span>
              </dd>
            </div>
          </dl>
        </div>
        {user.role === 'ADMIN' && (
          <a
            href="/admin"
            className="inline-block mb-4 text-sm text-primary underline-offset-4 hover:underline"
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
            className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
          >
            Sign Out
          </button>
        </form>
      </div>
    </main>
  );
}
