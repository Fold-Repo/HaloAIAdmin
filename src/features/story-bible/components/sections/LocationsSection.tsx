import {
  EmptySectionState,
  EntityCard,
  InfoGrid,
  SectionShell,
} from '@/features/story-bible/components/SectionShell';
import type { StoryLocation } from '@/types';

export function LocationsSection({ locations }: { locations: StoryLocation[] }) {
  return (
    <SectionShell
      title="Locations"
      description="Key settings for scene generation and visual consistency."
    >
      {locations.length === 0 ? (
        <EmptySectionState message="No locations documented yet." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {locations.map((location) => (
            <EntityCard key={location.id} title={location.name}>
              <InfoGrid
                items={[
                  { label: 'Description', value: location.description },
                  { label: 'Significance', value: location.significance },
                  { label: 'Atmosphere', value: location.atmosphere },
                ]}
              />
            </EntityCard>
          ))}
        </div>
      )}
    </SectionShell>
  );
}
