import { Loader2, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  EmptySectionState,
  EntityCard,
  InfoGrid,
  SectionShell,
} from '@/features/story-bible/components/SectionShell';
import { useGenerateLocationImage } from '@/features/story-bible/hooks/useStoryBible';
import type { StoryLocation } from '@/types';

export function LocationsSection({
  projectId,
  locations,
}: {
  projectId: string;
  locations: StoryLocation[];
}) {
  const generateImage = useGenerateLocationImage(projectId);

  return (
    <SectionShell
      title="Locations"
      description="Key settings for scene generation — visuals follow story bible lore, not generic stock places."
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
              <Button
                className="mt-3"
                size="sm"
                variant="secondary"
                disabled={generateImage.isPending}
                onClick={() =>
                  void generateImage.mutateAsync({
                    locationId: location.id,
                    regenerate: true,
                  })
                }
              >
                {generateImage.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    Generate lore-aware image
                  </>
                )}
              </Button>
            </EntityCard>
          ))}
        </div>
      )}
    </SectionShell>
  );
}
