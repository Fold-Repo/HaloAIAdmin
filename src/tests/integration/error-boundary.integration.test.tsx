import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ErrorBoundary } from '@/components/common';

function ThrowError(): never {
  throw new Error('Integration test error');
}

describe('error boundary integration', () => {
  it('renders fallback UI when a child throws', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    render(
      <ErrorBoundary feature="Test Feature">
        <ThrowError />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Test Feature failed to load')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Return home' })).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
