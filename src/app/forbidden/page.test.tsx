import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ForbiddenPage from '@/app/forbidden/page';

describe('ForbiddenPage', () => {
  it('renders the 403 heading', () => {
    render(<ForbiddenPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('403');
  });

  it('renders the "Access Forbidden" heading', () => {
    render(<ForbiddenPage />);
    expect(screen.getByRole('heading', { name: 'Access Forbidden' })).toBeInTheDocument();
  });

  it('renders a link back to the dashboard', () => {
    render(<ForbiddenPage />);
    const link = screen.getByRole('link', { name: /Go to Dashboard/i });
    expect(link).toHaveAttribute('href', '/dashboard');
  });

  it('renders the permission error message', () => {
    render(<ForbiddenPage />);
    expect(screen.getByText(/You don't have permission to access this page/i)).toBeInTheDocument();
  });
});
