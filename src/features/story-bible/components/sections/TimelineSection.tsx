import {
  EmptySectionState,
  EntityCard,
  SectionShell,
} from '@/features/story-bible/components/SectionShell';
import type { TimelineEvent } from '@/types';

export function TimelineSection({ timeline }: { timeline: TimelineEvent[] }) {
  const sorted = [...timeline].sort((a, b) => a.order - b.order);

  return (
    <SectionShell
      title="Timeline"
      description="Chronological beats aligned to episodes and story progression."
    >
      {sorted.length === 0 ? (
        <EmptySectionState message="No timeline events yet." />
      ) : (
        <div className="relative space-y-4 border-l pl-6">
          {sorted.map((event) => (
            <EntityCard
              key={event.id}
              title={event.title}
              subtitle={`${event.dateLabel}${event.episodeRef ? ` · ${event.episodeRef}` : ''}`}
            >
              <p>{event.description}</p>
            </EntityCard>
          ))}
        </div>
      )}
    </SectionShell>
  );
}
