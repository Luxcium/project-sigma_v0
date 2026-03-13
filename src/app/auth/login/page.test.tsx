import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock the LoginForm so we avoid pulling in the server action
vi.mock('@/components/auth/login-form', () => ({
  LoginForm: () => <div data-testid="login-form" />,
}));

import LoginPage from '@/app/auth/login/page';

describe('LoginPage', () => {
  it('renders the "Sign In" heading', () => {
    render(<LoginPage />);
    expect(screen.getByRole('heading', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('renders the LoginForm', () => {
    render(<LoginPage />);
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });
});
