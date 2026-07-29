import {
  EmptySectionState,
  EntityCard,
  SectionShell,
} from '@/features/story-bible/components/SectionShell';
import type { LoreEntry } from '@/types';

export function LoreSection({ lore }: { lore: LoreEntry[] }) {
  return (
    <SectionShell
      title="Lore"
      description="World rules, mythology, and background knowledge for consistent AI generation."
    >
      {lore.length === 0 ? (
        <EmptySectionState message="No lore entries yet." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {lore.map((entry) => (
            <EntityCard key={entry.id} title={entry.title} subtitle={entry.category}>
              <p>{entry.content}</p>
            </EntityCard>
          ))}
        </div>
      )}
    </SectionShell>
  );
}
