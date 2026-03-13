import { describe, expect, it } from 'vitest';
import { LoginSchema } from '@/lib/validations/auth';

describe('LoginSchema', () => {
  describe('valid inputs', () => {
    it('accepts a valid email and password', () => {
      const result = LoginSchema.safeParse({
        email: 'user@example.com',
        password: 'secret123',
      });
      expect(result.success).toBe(true);
    });

    it('accepts a password of exactly 1 character', () => {
      const result = LoginSchema.safeParse({
        email: 'user@example.com',
        password: 'x',
      });
      expect(result.success).toBe(true);
    });

    it('accepts emails with subdomains', () => {
      const result = LoginSchema.safeParse({
        email: 'admin@mail.example.co.uk',
        password: 'password',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('invalid email', () => {
    it('rejects a missing @ sign', () => {
      const result = LoginSchema.safeParse({
        email: 'notanemail',
        password: 'password',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const emailErrors = result.error.errors.filter((e) => e.path[0] === 'email');
        expect(emailErrors.length).toBeGreaterThan(0);
        expect(emailErrors[0]?.message).toBe('Invalid email address');
      }
    });

    it('rejects an empty email', () => {
      const result = LoginSchema.safeParse({ email: '', password: 'password' });
      expect(result.success).toBe(false);
    });

    it('rejects an email without a domain', () => {
      const result = LoginSchema.safeParse({
        email: 'user@',
        password: 'password',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('invalid password', () => {
    it('rejects an empty password', () => {
      const result = LoginSchema.safeParse({
        email: 'user@example.com',
        password: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const pwErrors = result.error.errors.filter((e) => e.path[0] === 'password');
        expect(pwErrors.length).toBeGreaterThan(0);
        expect(pwErrors[0]?.message).toBe('Password is required');
      }
    });
  });

  describe('missing fields', () => {
    it('rejects a missing email field', () => {
      const result = LoginSchema.safeParse({ password: 'password' });
      expect(result.success).toBe(false);
    });

    it('rejects a missing password field', () => {
      const result = LoginSchema.safeParse({ email: 'user@example.com' });
      expect(result.success).toBe(false);
    });

    it('rejects an empty object', () => {
      const result = LoginSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
