import { Film, FolderKanban, GraduationCap, LayoutDashboard, LibraryBig, Bell } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { CREATOR_NAV_ITEMS } from '@/constants';
import { cn } from '@/utils';

const ICONS = {
  'layout-dashboard': LayoutDashboard,
  'folder-kanban': FolderKanban,
  'library-big': LibraryBig,
  bell: Bell,
  'graduation-cap': GraduationCap,
  film: Film,
} as const;

type CreatorSidebarProps = {
  onNavigate?: () => void;
};

export function CreatorSidebar({ onNavigate }: CreatorSidebarProps) {
  return (
    <nav aria-label="Creator studio" className="space-y-1">
      {CREATOR_NAV_ITEMS.map((item) => {
        const Icon = ICONS[item.icon as keyof typeof ICONS] ?? Film;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )
            }
          >
            <Icon className="size-4" aria-hidden="true" />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
