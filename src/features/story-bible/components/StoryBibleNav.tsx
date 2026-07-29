import { NavLink, useParams } from 'react-router-dom';

import { STORY_BIBLE_SECTIONS, getStoryBiblePath } from '@/features/story-bible/utils/story-bible.utils';
import { cn } from '@/utils';
import type { StoryBibleSection } from '@/types';

export function StoryBibleNav() {
  const { projectId = '' } = useParams();

  return (
    <nav aria-label="Story bible sections" className="overflow-x-auto">
      <div className="flex min-w-max gap-1 rounded-lg border p-1">
        {STORY_BIBLE_SECTIONS.map((section) => (
          <NavLink
            key={section.id}
            to={getStoryBiblePath(projectId, section.id)}
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

export function getSectionMeta(section: string | undefined) {
  const meta = STORY_BIBLE_SECTIONS.find((item) => item.id === section);
  return meta ?? STORY_BIBLE_SECTIONS[0];
}

export function isStoryBibleSection(value: string | undefined): value is StoryBibleSection {
  return STORY_BIBLE_SECTIONS.some((section) => section.id === value);
}
