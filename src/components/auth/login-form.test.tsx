import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LoginForm } from '@/components/auth/login-form';

// The server action is mocked so the form can be rendered in jsdom
vi.mock('@/app/auth/login/actions', () => ({
  loginAction: vi.fn(),
}));

describe('LoginForm component', () => {
  it('renders email and password inputs', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('renders a submit button with "Sign In" text', () => {
    render(<LoginForm />);
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('does not render an error alert by default', () => {
    render(<LoginForm />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('email input has type="email"', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
  });

  it('password input has type="password"', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
  });

  it('email input has name="email"', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('name', 'email');
  });

  it('password input has name="password"', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText('Password')).toHaveAttribute('name', 'password');
  });
});
