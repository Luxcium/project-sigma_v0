import { beforeEach, describe, expect, it, vi } from 'vitest';

// ── Mock next/navigation before importing auth-guards ────────────────────────
const redirectMock = vi.fn((path: string): never => {
  throw new Error(`NEXT_REDIRECT:${path}`);
});

vi.mock('next/navigation', () => ({
  redirect: redirectMock,
}));

// ── Mock @/auth before importing auth-guards ──────────────────────────────────
const authMock = vi.fn();

vi.mock('@/auth', () => ({
  auth: authMock,
}));

// Import AFTER mocks are set up
const { requireAuth, assertAdmin, assertUser } = await import('@/lib/auth-guards');

// ── helpers ────────────────────────────────────────────────────────────────────

function makeSession(role: string) {
  return {
    user: { id: '1', email: 'test@test.com', role },
    expires: new Date(Date.now() + 86400 * 1000).toISOString(),
  };
}

// ── requireAuth ───────────────────────────────────────────────────────────────

describe('requireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to /auth/login when no session exists', async () => {
    authMock.mockResolvedValue(null);
    await expect(requireAuth()).rejects.toThrow('NEXT_REDIRECT:/auth/login');
    expect(redirectMock).toHaveBeenCalledWith('/auth/login');
  });

  it('redirects to /auth/login when session.user is missing', async () => {
    authMock.mockResolvedValue({ expires: '' });
    await expect(requireAuth()).rejects.toThrow('NEXT_REDIRECT:/auth/login');
    expect(redirectMock).toHaveBeenCalledWith('/auth/login');
  });

  it('returns session when user is logged in and no role is required', async () => {
    const session = makeSession('USER');
    authMock.mockResolvedValue(session);
    const result = await requireAuth();
    expect(result).toBe(session);
  });

  it('allows through when user has the required role', async () => {
    authMock.mockResolvedValue(makeSession('ADMIN'));
    const result = await requireAuth({ requiredRole: 'ADMIN' });
    expect(result.user).toBeDefined();
  });

  it('redirects to /forbidden when user lacks the required role', async () => {
    authMock.mockResolvedValue(makeSession('USER'));
    await expect(requireAuth({ requiredRole: 'ADMIN' })).rejects.toThrow(
      'NEXT_REDIRECT:/forbidden',
    );
    expect(redirectMock).toHaveBeenCalledWith('/forbidden');
  });
});

// ── assertAdmin ────────────────────────────────────────────────────────────────

describe('assertAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows ADMIN users through', async () => {
    authMock.mockResolvedValue(makeSession('ADMIN'));
    const result = await assertAdmin();
    expect(result.user).toBeDefined();
  });

  it('rejects USER role with redirect to /forbidden', async () => {
    authMock.mockResolvedValue(makeSession('USER'));
    await expect(assertAdmin()).rejects.toThrow('NEXT_REDIRECT:/forbidden');
  });

  it('rejects unauthenticated users with redirect to /auth/login', async () => {
    authMock.mockResolvedValue(null);
    await expect(assertAdmin()).rejects.toThrow('NEXT_REDIRECT:/auth/login');
  });
});

// ── assertUser ─────────────────────────────────────────────────────────────────

describe('assertUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows any authenticated user through', async () => {
    authMock.mockResolvedValue(makeSession('USER'));
    const result = await assertUser();
    expect(result.user).toBeDefined();
  });

  it('rejects unauthenticated users with redirect to /auth/login', async () => {
    authMock.mockResolvedValue(null);
    await expect(assertUser()).rejects.toThrow('NEXT_REDIRECT:/auth/login');
  });
});
