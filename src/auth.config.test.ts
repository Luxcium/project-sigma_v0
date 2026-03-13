import type { AugmentedToken, ExtendedUser } from '@/lib/auth.types';
import type { NextAuthConfig } from 'next-auth';
import { describe, expect, it } from 'vitest';
import { authConfig } from '@/auth.config';

// ── Callback type aliases ──────────────────────────────────────────────────────

type AuthCallbacks = NonNullable<NextAuthConfig['callbacks']>;
type AuthorizedFn = NonNullable<AuthCallbacks['authorized']>;
type JwtFn = NonNullable<AuthCallbacks['jwt']>;
type SessionFn = NonNullable<AuthCallbacks['session']>;

// ── helpers ────────────────────────────────────────────────────────────────────

function makeUrl(path: string) {
  return new URL(`http://localhost:3000${path}`);
}

function callAuthorized(isLoggedIn: boolean, pathname: string, role?: string): boolean | Response {
  const authorized = authConfig.callbacks?.authorized as AuthorizedFn;
  if (!authorized) throw new Error('authorized callback not found');

  const auth = isLoggedIn
    ? {
        user: { role } as ExtendedUser,
        expires: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      }
    : null;

  // Cast to the expected callback signature; test only uses the `auth` and
  // `request.nextUrl` fields so the rest can be empty stubs.
  const request = {
    nextUrl: makeUrl(pathname),
  } as Parameters<AuthorizedFn>[0]['request'];

  return authorized({ auth, request } as unknown as Parameters<AuthorizedFn>[0]) as
    | boolean
    | Response;
}

// ── authorized callback ────────────────────────────────────────────────────────

describe('authConfig.callbacks.authorized', () => {
  describe('/admin routes', () => {
    it('redirects unauthenticated users to /auth/login', () => {
      const result = callAuthorized(false, '/admin');
      expect(result).toBeInstanceOf(Response);
      expect((result as Response).headers.get('location')).toContain('/auth/login');
    });

    it('redirects authenticated non-admin users to /forbidden', () => {
      const result = callAuthorized(true, '/admin', 'USER');
      expect(result).toBeInstanceOf(Response);
      expect((result as Response).headers.get('location')).toContain('/forbidden');
    });

    it('allows ADMIN users through', () => {
      const result = callAuthorized(true, '/admin', 'ADMIN');
      expect(result).toBe(true);
    });
  });

  describe('/dashboard routes', () => {
    it('redirects unauthenticated users to /auth/login', () => {
      const result = callAuthorized(false, '/dashboard');
      expect(result).toBeInstanceOf(Response);
      expect((result as Response).headers.get('location')).toContain('/auth/login');
    });

    it('allows authenticated users through regardless of role', () => {
      expect(callAuthorized(true, '/dashboard', 'USER')).toBe(true);
      expect(callAuthorized(true, '/dashboard', 'ADMIN')).toBe(true);
    });
  });

  describe('/auth/login redirect', () => {
    it('redirects an already logged-in user away from the login page', () => {
      const result = callAuthorized(true, '/auth/login', 'USER');
      expect(result).toBeInstanceOf(Response);
      expect((result as Response).headers.get('location')).toContain('/dashboard');
    });

    it('allows unauthenticated users to view the login page', () => {
      expect(callAuthorized(false, '/auth/login')).toBe(true);
    });
  });

  describe('public routes', () => {
    it('allows any request to reach the home page', () => {
      expect(callAuthorized(false, '/')).toBe(true);
      expect(callAuthorized(true, '/', 'USER')).toBe(true);
    });
  });
});

// ── jwt callback ───────────────────────────────────────────────────────────────

describe('authConfig.callbacks.jwt', () => {
  function callJwt(token: AugmentedToken, user?: ExtendedUser) {
    const jwt = authConfig.callbacks?.jwt as JwtFn;
    if (!jwt) throw new Error('jwt callback not found');
    return jwt({
      token,
      user,
      account: null,
      profile: undefined,
      trigger: undefined,
      isNewUser: undefined,
      session: undefined,
    } as unknown as Parameters<JwtFn>[0]);
  }

  it('returns the token unchanged when no user is provided', () => {
    const token: AugmentedToken = { sub: 'existing-sub' };
    expect(callJwt(token)).toEqual({ sub: 'existing-sub' });
  });

  it('copies id and role from user into the token on sign-in', () => {
    const token: AugmentedToken = {};
    const user: ExtendedUser = { id: 'user-123', role: 'ADMIN' };
    const result = callJwt(token, user) as AugmentedToken;
    expect(result.id).toBe('user-123');
    expect(result.role).toBe('ADMIN');
  });

  it('does not set id when user.id is undefined', () => {
    const token: AugmentedToken = {};
    const user: ExtendedUser = { role: 'USER' };
    const result = callJwt(token, user) as AugmentedToken;
    expect('id' in result).toBe(false);
  });

  it('does not set role when user.role is undefined', () => {
    const token: AugmentedToken = {};
    const user: ExtendedUser = { id: 'user-456' };
    const result = callJwt(token, user) as AugmentedToken;
    expect('role' in result).toBe(false);
  });
});

// ── session callback ───────────────────────────────────────────────────────────

describe('authConfig.callbacks.session', () => {
  function callSession(sessionUser: ExtendedUser, token: AugmentedToken) {
    const session = authConfig.callbacks?.session as SessionFn;
    if (!session) throw new Error('session callback not found');
    const sessionObj = {
      user: sessionUser,
      expires: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
    };
    return session({
      session: sessionObj,
      token,
      newSession: undefined,
      trigger: undefined,
    } as unknown as Parameters<SessionFn>[0]);
  }

  it('copies id and role from token into session.user', () => {
    const user: ExtendedUser = {};
    const token: AugmentedToken = { id: 'tok-id', role: 'ADMIN' };
    const result = callSession(user, token) as { user: ExtendedUser };
    expect(result.user.id).toBe('tok-id');
    expect(result.user.role).toBe('ADMIN');
  });

  it('does not set id when token.id is undefined', () => {
    const user: ExtendedUser = {};
    const token: AugmentedToken = { role: 'USER' };
    const result = callSession(user, token) as { user: ExtendedUser };
    expect('id' in result.user).toBe(false);
  });

  it('does not set role when token.role is undefined', () => {
    const user: ExtendedUser = {};
    const token: AugmentedToken = { id: 'some-id' };
    const result = callSession(user, token) as { user: ExtendedUser };
    expect('role' in result.user).toBe(false);
  });
});
