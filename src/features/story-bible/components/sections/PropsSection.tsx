import { Loader2, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  EmptySectionState,
  EntityCard,
  SectionShell,
} from '@/features/story-bible/components/SectionShell';
import { useGeneratePropImage } from '@/features/story-bible/hooks/useStoryBible';
import type { StoryProp } from '@/types';

export function PropsSection({ projectId, props }: { projectId: string; props: StoryProp[] }) {
  const generateImage = useGeneratePropImage(projectId);

  return (
    <SectionShell
      title="Props"
      description="Important objects tracked for continuity — images stay faithful to lore and owners."
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
              <Button
                className="mt-3"
                size="sm"
                variant="secondary"
                disabled={generateImage.isPending}
                onClick={() =>
                  void generateImage.mutateAsync({
                    propId: prop.id,
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
