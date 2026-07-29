import type { ReactNode } from 'react';

import { AuthProvider } from '@/providers/AuthProvider';
import { ThemeProvider } from '@/theme';

import { QueryProvider } from './QueryProvider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>{children}</AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
