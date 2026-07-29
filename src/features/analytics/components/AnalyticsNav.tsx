import { NavLink, useParams } from 'react-router-dom';

import { ANALYTICS_SECTIONS, getAnalyticsPath } from '@/features/analytics/utils/analytics.utils';
import { cn } from '@/utils';

export function AnalyticsNav() {
  const { projectId = '' } = useParams();

  return (
    <nav aria-label="Analytics sections" className="overflow-x-auto">
      <div className="flex min-w-max gap-1 rounded-lg border p-1">
        {ANALYTICS_SECTIONS.map((section) => (
          <NavLink
            key={section.id}
            to={getAnalyticsPath(projectId, section.id)}
            end={section.id === 'dashboard'}
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

export function getAnalyticsSectionMeta(section: string | undefined) {
  return ANALYTICS_SECTIONS.find((item) => item.id === section) ?? ANALYTICS_SECTIONS[0];
}
