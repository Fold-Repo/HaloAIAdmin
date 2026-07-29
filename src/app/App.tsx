import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';

import { ErrorBoundary, PageSkeleton } from '@/components/common';
import { AppProviders } from '@/providers';
import { router } from '@/routes';

export function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <Suspense fallback={<PageSkeleton />}>
          <RouterProvider router={router} />
        </Suspense>
      </AppProviders>
    </ErrorBoundary>
  );
}
