import {
  EmptySectionState,
  EntityCard,
  SectionShell,
} from '@/features/story-bible/components/SectionShell';
import type { StoryProp } from '@/types';

export function PropsSection({ props }: { props: StoryProp[] }) {
  return (
    <SectionShell
      title="Props"
      description="Important objects tracked for scene continuity and AI video prompts."
    >
      {props.length === 0 ? (
        <EmptySectionState message="No props catalogued yet." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {props.map((prop) => (
            <EntityCard
              key={prop.id}
              title={prop.name}
              subtitle={prop.ownerCharacterName ?? 'Unassigned'}
            >
              <p>{prop.description}</p>
              <p>
                <strong>Scene usage:</strong> {prop.sceneUsage}
              </p>
            </EntityCard>
          ))}
        </div>
      )}
    </SectionShell>
  );
}
