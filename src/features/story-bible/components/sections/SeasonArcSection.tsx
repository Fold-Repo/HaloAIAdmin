import { Badge } from '@/components/ui/badge';
import {
  EmptySectionState,
  EntityCard,
  SectionShell,
} from '@/features/story-bible/components/SectionShell';
import type { SeasonArcBeat } from '@/types';

export function SeasonArcSection({ seasonArc }: { seasonArc: SeasonArcBeat[] }) {
  const sorted = [...seasonArc].sort((a, b) => a.act - b.act);

  return (
    <SectionShell
      title="Season arc"
      description="Act structure and episode ranges for long-form vertical series."
    >
      {sorted.length === 0 ? (
        <EmptySectionState message="No season arc beats defined yet." />
      ) : (
        <div className="space-y-4">
          {sorted.map((beat) => (
            <EntityCard
              key={beat.id}
              title={beat.title}
              subtitle={`Act ${beat.act} · ${beat.episodeRange}`}
            >
              <Badge variant="secondary" className="mb-2">
                Act {beat.act}
              </Badge>
              <p>{beat.description}</p>
            </EntityCard>
          ))}
        </div>
      )}
    </SectionShell>
  );
}
