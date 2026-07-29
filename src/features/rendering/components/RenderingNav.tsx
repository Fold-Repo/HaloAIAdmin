import { NavLink, useParams } from 'react-router-dom';

import { RENDERING_SECTIONS, getRenderingPath } from '@/features/rendering/utils/rendering.utils';
import { cn } from '@/utils';

export function RenderingNav() {
  const { projectId = '' } = useParams();

  return (
    <nav aria-label="Rendering sections" className="overflow-x-auto">
      <div className="flex min-w-max gap-1 rounded-lg border p-1">
        {RENDERING_SECTIONS.map((section) => (
          <NavLink
            key={section.id}
            to={getRenderingPath(projectId, section.id)}
            end={section.id === 'progress'}
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

export function getRenderingSectionMeta(section: string | undefined) {
  return RENDERING_SECTIONS.find((item) => item.id === section) ?? RENDERING_SECTIONS[0];
}
