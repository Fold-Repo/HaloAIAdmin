import { NavLink } from 'react-router-dom';

import { ADMIN_SECTIONS, getAdminPath } from '@/features/admin/utils/admin.utils';
import { cn } from '@/utils';

export function AdminNav() {
  return (
    <nav aria-label="Admin sections" className="overflow-x-auto">
      <div className="flex min-w-max gap-1 rounded-lg border p-1">
        {ADMIN_SECTIONS.map((section) => (
          <NavLink
            key={section.id}
            to={getAdminPath(section.id)}
            end={section.id === 'overview'}
            className={({ isActive }) =>
              cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )
            }
          >
            {section.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export function getAdminSectionMeta(section: string | undefined) {
  return ADMIN_SECTIONS.find((item) => item.id === section) ?? ADMIN_SECTIONS[0];
}
