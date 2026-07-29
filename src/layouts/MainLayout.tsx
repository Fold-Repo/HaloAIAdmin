import { Outlet } from 'react-router-dom';

import { ErrorBoundary, SkipToContent } from '@/components/common';
import { AppFooter } from '@/components/layout/AppFooter';
import { AppHeader } from '@/components/layout/AppHeader';

export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <SkipToContent />
      <AppHeader />
      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <ErrorBoundary feature="Page">
          <Outlet />
        </ErrorBoundary>
      </main>
      <AppFooter />
    </div>
  );
}
