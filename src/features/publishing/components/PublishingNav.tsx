import { NavLink, useParams } from 'react-router-dom';

import { PUBLISHING_SECTIONS, getPublishingPath } from '@/features/publishing/utils/publishing.utils';
import { cn } from '@/utils';

export function PublishingNav() {
  const { projectId = '' } = useParams();

  return (
    <nav aria-label="Publishing sections" className="overflow-x-auto">
      <div className="flex min-w-max gap-1 rounded-lg border p-1">
        {PUBLISHING_SECTIONS.map((section) => (
          <NavLink
            key={section.id}
            to={getPublishingPath(projectId, section.id)}
            end={section.id === 'wizard'}
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

export function getPublishingSectionMeta(section: string | undefined) {
  return PUBLISHING_SECTIONS.find((item) => item.id === section) ?? PUBLISHING_SECTIONS[0];
}
