import { Menu, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/features/creator/components/NotificationBell';
import { CreatorSidebar } from '@/features/creator/components/CreatorSidebar';
import { ROUTES } from '@/constants';
import { useAuth } from '@/features/authentication/hooks/useAuth';
import { useAppStore } from '@/store';

export function CreatorTopBar() {
  const { user, logout } = useAuth();
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);

  return (
    <header className="border-border bg-background/95 flex h-14 items-center justify-between gap-4 border-b px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Open navigation"
          onClick={toggleSidebar}
        >
          <Menu className="size-5" />
        </Button>
        <div>
          <p className="text-sm font-semibold">Creator Studio</p>
          <p className="text-muted-foreground hidden text-xs sm:block">
            {user?.name ?? 'Creator workspace'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button asChild size="sm" className="hidden sm:inline-flex">
          <Link to={ROUTES.STUDIO.PROJECT_NEW}>
            <Plus className="size-4" />
            New project
          </Link>
        </Button>
        <NotificationBell />
        <Button variant="outline" size="sm" onClick={() => void logout()}>
          Sign out
        </Button>
      </div>
    </header>
  );
}

export function CreatorMobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close navigation"
        onClick={onClose}
      />
      <div className="bg-background absolute top-14 left-0 h-[calc(100%-3.5rem)] w-72 border-r p-4 shadow-lg">
        <CreatorSidebar onNavigate={onClose} />
      </div>
    </div>
  );
}
