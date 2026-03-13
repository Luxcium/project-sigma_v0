import { assertAdmin } from '@/lib/auth-guards';
import type { ExtendedUser } from '@/lib/auth.types';

export default async function AdminPage() {
  const session = await assertAdmin();
  const user = session.user as ExtendedUser;

  return (
    <main className="container mx-auto p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-3xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground mb-6">Restricted to ADMIN role only.</p>
        <div className="bg-card text-card-foreground rounded-lg border p-6">
          <h2 className="mb-4 text-xl font-semibold">Admin Details</h2>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Email</dt>
              <dd>{user.email}</dd>
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
        <a
          href="/dashboard"
          className="text-primary mt-4 inline-block text-sm underline-offset-4 hover:underline"
        >
          ← Back to Dashboard
        </a>
      </div>
    </main>
  );
}
