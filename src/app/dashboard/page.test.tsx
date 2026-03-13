import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ExtendedUser } from '@/lib/auth.types';

// ── Mock auth-guards and @/auth ───────────────────────────────────────────────
const assertUserMock = vi.fn();
vi.mock('@/lib/auth-guards', () => ({
  assertUser: assertUserMock,
}));

// signOut is used inside an inline Server Action — stub it out
vi.mock('@/auth', () => ({
  signOut: vi.fn(),
}));

const DashboardPage = (await import('@/app/dashboard/page')).default;

function makeSession(user: ExtendedUser) {
  return {
    user,
    expires: new Date(Date.now() + 86400_000).toISOString(),
  };
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the Dashboard heading', async () => {
    assertUserMock.mockResolvedValue(
      makeSession({ id: '1', email: 'user@example.com', role: 'USER' }),
    );
    render(await DashboardPage());
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('displays the user email', async () => {
    assertUserMock.mockResolvedValue(
      makeSession({ id: '1', email: 'user@example.com', role: 'USER' }),
    );
    render(await DashboardPage());
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
  });

  it('displays the USER role badge', async () => {
    assertUserMock.mockResolvedValue(
      makeSession({ id: '1', email: 'user@example.com', role: 'USER' }),
    );
    render(await DashboardPage());
    expect(screen.getByText('USER')).toBeInTheDocument();
  });

  it('renders a Sign Out button', async () => {
    assertUserMock.mockResolvedValue(
      makeSession({ id: '1', email: 'user@example.com', role: 'USER' }),
    );
    render(await DashboardPage());
    expect(screen.getByRole('button', { name: /Sign Out/i })).toBeInTheDocument();
  });

  it('shows Admin Panel link for ADMIN users', async () => {
    assertUserMock.mockResolvedValue(
      makeSession({ id: '1', email: 'admin@example.com', role: 'ADMIN' }),
    );
    render(await DashboardPage());
    expect(screen.getByRole('link', { name: /Admin Panel/i })).toHaveAttribute('href', '/admin');
  });

  it('does not show Admin Panel link for USER role', async () => {
    assertUserMock.mockResolvedValue(
      makeSession({ id: '1', email: 'user@example.com', role: 'USER' }),
    );
    render(await DashboardPage());
    expect(screen.queryByRole('link', { name: /Admin Panel/i })).not.toBeInTheDocument();
  });
});
