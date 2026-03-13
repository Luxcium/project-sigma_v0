import { describe, expect, it } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn (class name utility)', () => {
  it('returns a single class name unchanged', () => {
    expect(cn('text-red-500')).toBe('text-red-500');
  });

  it('merges multiple class names', () => {
    expect(cn('text-red-500', 'bg-blue-200')).toBe('text-red-500 bg-blue-200');
  });

  it('resolves Tailwind conflicts — last value wins', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('filters out falsy values', () => {
    expect(cn('text-red-500', false && 'hidden', undefined, null, '')).toBe('text-red-500');
  });

  it('supports conditional class names via objects', () => {
    expect(cn({ 'font-bold': true, italic: false })).toBe('font-bold');
  });

  it('supports conditional class names via arrays', () => {
    expect(cn(['text-sm', false && 'hidden'])).toBe('text-sm');
  });

  it('handles padding conflicts', () => {
    expect(cn('p-4', 'px-2')).toBe('p-4 px-2');
    expect(cn('px-4', 'px-2')).toBe('px-2');
  });

  it('returns an empty string when no arguments are given', () => {
    expect(cn()).toBe('');
  });
});
