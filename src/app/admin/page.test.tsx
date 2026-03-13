import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ExtendedUser } from '@/lib/auth.types';

// ── Mock auth-guards before importing AdminPage ───────────────────────────────
const assertAdminMock = vi.hoisted(() => vi.fn());
vi.mock('@/lib/auth-guards', () => ({
  assertAdmin: assertAdminMock,
}));

const AdminPage = (await import('@/app/admin/page')).default;

function makeSession(user: ExtendedUser) {
  return {
    user,
    expires: new Date(Date.now() + 86400_000).toISOString(),
  };
}

describe('AdminPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Admin Panel heading for an ADMIN user', async () => {
    assertAdminMock.mockResolvedValue(
      makeSession({ id: '1', email: 'admin@example.com', role: 'ADMIN' }),
    );
    render(await AdminPage());
    expect(screen.getByRole('heading', { name: 'Admin Panel' })).toBeInTheDocument();
  });

  it('displays the admin email', async () => {
    assertAdminMock.mockResolvedValue(
      makeSession({ id: '1', email: 'admin@example.com', role: 'ADMIN' }),
    );
    render(await AdminPage());
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
  });

  it('displays the ADMIN role badge', async () => {
    assertAdminMock.mockResolvedValue(
      makeSession({ id: '1', email: 'admin@example.com', role: 'ADMIN' }),
    );
    render(await AdminPage());
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
  });

  it('renders a link back to the dashboard', async () => {
    assertAdminMock.mockResolvedValue(
      makeSession({ id: '1', email: 'admin@example.com', role: 'ADMIN' }),
    );
    render(await AdminPage());
    expect(screen.getByRole('link', { name: /Back to Dashboard/i })).toHaveAttribute(
      'href',
      '/dashboard',
    );
  });
});
