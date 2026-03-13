import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { LoginActionState } from '@/lib/validations/auth';

// ── Mock next-auth to avoid its internal `next/server` import in Vitest ───────
class MockAuthError extends Error {
  type: string;
  constructor(type: string) {
    super(type);
    this.type = type;
  }
}

vi.mock('next-auth', () => ({
  AuthError: MockAuthError,
}));

// ── Mock @/auth before importing actions ──────────────────────────────────────
const signInMock = vi.fn();
vi.mock('@/auth', () => ({ signIn: signInMock }));

const { loginAction } = await import('@/app/auth/login/actions');

// ── helpers ───────────────────────────────────────────────────────────────────

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) {
    fd.append(k, v);
  }
  return fd;
}

const PREV: LoginActionState = {};

// ── tests ─────────────────────────────────────────────────────────────────────

describe('loginAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validation errors', () => {
    it('returns an error when email is missing', async () => {
      const result = await loginAction(PREV, makeFormData({ password: 'pass' }));
      expect(result.error).toBeDefined();
      expect(result.success).toBeUndefined();
    });

    it('returns an error when password is empty', async () => {
      const result = await loginAction(
        PREV,
        makeFormData({ email: 'user@example.com', password: '' }),
      );
      expect(result.error).toBe('Password is required');
    });

    it('returns an error when email is invalid', async () => {
      const result = await loginAction(
        PREV,
        makeFormData({ email: 'not-an-email', password: 'password' }),
      );
      expect(result.error).toBe('Invalid email address');
    });
  });

  describe('successful sign-in', () => {
    it('calls signIn with credentials and redirectTo', async () => {
      // signIn resolves (redirect happens internally via Next.js)
      signInMock.mockResolvedValue(undefined);
      await loginAction(PREV, makeFormData({ email: 'user@example.com', password: 'password123' }));
      expect(signInMock).toHaveBeenCalledWith('credentials', {
        email: 'user@example.com',
        password: 'password123',
        redirectTo: '/dashboard',
      });
    });
  });

  describe('authentication errors', () => {
    it('returns "Invalid email or password" for CredentialsSignin', async () => {
      const err = new MockAuthError('CredentialsSignin');
      signInMock.mockRejectedValue(err);
      const result = await loginAction(
        PREV,
        makeFormData({ email: 'user@example.com', password: 'wrong' }),
      );
      expect(result.error).toBe('Invalid email or password');
    });

    it('returns a generic error for other AuthError types', async () => {
      const err = new MockAuthError('OAuthCallbackError');
      signInMock.mockRejectedValue(err);
      const result = await loginAction(
        PREV,
        makeFormData({ email: 'user@example.com', password: 'pass' }),
      );
      expect(result.error).toBe('Authentication failed. Please try again.');
    });

    it('re-throws non-AuthError errors (e.g. NEXT_REDIRECT)', async () => {
      signInMock.mockRejectedValue(new Error('NEXT_REDIRECT'));
      await expect(
        loginAction(PREV, makeFormData({ email: 'user@example.com', password: 'password123' })),
      ).rejects.toThrow('NEXT_REDIRECT');
    });
  });
});
