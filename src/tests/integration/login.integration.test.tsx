import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import { LoginPage } from '@/features/authentication/pages/LoginPage';
import { renderWithProviders } from '@/tests/utils/test-utils';

describe('login page integration', () => {
  it('renders an accessible login form', () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('links to register and forgot password routes', () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByRole('link', { name: 'Create one' })).toHaveAttribute('href', '/register');
    expect(screen.getByRole('link', { name: 'Forgot password?' })).toHaveAttribute(
      'href',
      '/forgot-password',
    );
  });
});
