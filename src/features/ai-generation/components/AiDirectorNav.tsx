import { NavLink, useParams } from 'react-router-dom';

import { AI_GENERATION_SECTIONS, getAiGenerationPath } from '@/features/ai-generation/utils/ai-generation.utils';
import { cn } from '@/utils';

export function AiDirectorNav() {
  const { projectId = '' } = useParams();

  return (
    <nav aria-label="AI generation sections" className="overflow-x-auto">
      <div className="flex min-w-max gap-1 rounded-lg border p-1">
        {AI_GENERATION_SECTIONS.map((section) => (
          <NavLink
            key={section.id}
            to={getAiGenerationPath(projectId, section.id)}
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

export function getAiSectionMeta(section: string | undefined) {
  return AI_GENERATION_SECTIONS.find((item) => item.id === section) ?? AI_GENERATION_SECTIONS[0];
}
