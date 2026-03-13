import { describe, expect, it, vi } from 'vitest';

// vi.mock is hoisted to the top of the file, so we use vi.hoisted() to
// initialise mock variables that need to be referenced inside the factory.
const redirectMock = vi.hoisted(() =>
  vi.fn((path: string): never => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
);

vi.mock('next/navigation', () => ({
  redirect: redirectMock,
}));

import HomePage from '@/app/page';

describe('HomePage', () => {
  it('immediately redirects to /dashboard', () => {
    expect(() => HomePage()).toThrow('NEXT_REDIRECT:/dashboard');
    expect(redirectMock).toHaveBeenCalledWith('/dashboard');
  });
});
