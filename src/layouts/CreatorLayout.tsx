import { Outlet } from 'react-router-dom';

import { ErrorBoundary, SkipToContent } from '@/components/common';
import { CreatorMobileNav, CreatorTopBar } from '@/features/creator/components/CreatorTopBar';
import { CreatorSidebar } from '@/features/creator/components/CreatorSidebar';
import { useAppStore } from '@/store';

export function CreatorLayout() {
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen);

  return (
    <div className="bg-muted/20 flex min-h-screen flex-col">
      <SkipToContent />
      <CreatorTopBar />
      <CreatorMobileNav open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <aside className="hidden w-56 shrink-0 lg:block" aria-label="Creator navigation">
          <CreatorSidebar />
        </aside>
        <main id="main-content" className="min-w-0 flex-1">
          <ErrorBoundary feature="Creator Studio">
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
