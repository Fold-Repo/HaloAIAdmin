import { Badge } from '@/components/ui/badge';
import {
  EmptySectionState,
  EntityCard,
  SectionShell,
} from '@/features/story-bible/components/SectionShell';
import type { CharacterRelationship } from '@/types';

export function RelationshipsSection({
  relationships,
}: {
  relationships: CharacterRelationship[];
}) {
  return (
    <SectionShell
      title="Relationships"
      description="Map character dynamics that drive conflict and emotional beats."
    >
      {relationships.length === 0 ? (
        <EmptySectionState message="No relationships mapped yet." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {relationships.map((relationship) => (
            <EntityCard
              key={relationship.id}
              title={`${relationship.fromCharacterName} → ${relationship.toCharacterName}`}
              subtitle={relationship.type}
            >
              <Badge variant="outline" className="mb-2 capitalize">
                {relationship.type}
              </Badge>
              <p>{relationship.description}</p>
            </EntityCard>
          ))}
        </div>
      )}
    </SectionShell>
  );
}
