import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AppProviders } from '@/providers';

describe('app providers integration', () => {
  it('renders children within the provider tree', () => {
    render(
      <AppProviders>
        <p>Provider smoke test</p>
      </AppProviders>,
    );

    expect(screen.getByText('Provider smoke test')).toBeInTheDocument();
  });
});
