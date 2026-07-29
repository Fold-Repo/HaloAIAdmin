import { Loader2, RefreshCw, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { AuthenticatedImage } from '@/features/story-bible/components/AuthenticatedImage';
import {
  EmptySectionState,
  EntityCard,
  SectionShell,
} from '@/features/story-bible/components/SectionShell';
import { useGenerateWardrobeImage } from '@/features/story-bible/hooks/useStoryBible';
import { getWardrobeImageApiUrl } from '@/features/story-bible/utils/story-bible.utils';
import type { WardrobeItem } from '@/types';

type WardrobeSectionProps = {
  projectId: string;
  wardrobe: WardrobeItem[];
};

export function WardrobeSection({ projectId, wardrobe }: WardrobeSectionProps) {
  return (
    <SectionShell
      title="Wardrobe"
      description="Character looks for consistent visual generation across episodes."
    >
      {wardrobe.length === 0 ? (
        <EmptySectionState message="No wardrobe items yet. Story Composer fills looks per character when you compose a story." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {wardrobe.map((item) => (
            <WardrobeCard key={item.id} projectId={projectId} item={item} />
          ))}
        </div>
      )}
    </SectionShell>
  );
}

function WardrobeCard({ projectId, item }: { projectId: string; item: WardrobeItem }) {
  const generateImage = useGenerateWardrobeImage(projectId);
  const imageApiUrl = item.imageUrl ? getWardrobeImageApiUrl(projectId, item.id) : null;

  return (
    <EntityCard title={item.name} subtitle={`${item.characterName} · ${item.episodes}`}>
      <div className="mb-3 flex flex-col gap-3 sm:flex-row">
        {imageApiUrl ? (
          <AuthenticatedImage
            src={imageApiUrl}
            alt={`${item.characterName} — ${item.name}`}
            className="aspect-[3/4] w-full max-w-[160px] shrink-0"
          />
        ) : (
          <div className="bg-muted text-muted-foreground flex aspect-[3/4] w-full max-w-[160px] shrink-0 items-center justify-center rounded-lg border text-xs">
            No look image yet
          </div>
        )}
        <div className="flex flex-1 flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-fit"
            disabled={generateImage.isPending}
            onClick={() =>
              void generateImage.mutateAsync({
                wardrobeId: item.id,
                regenerate: Boolean(item.imageUrl),
              })
            }
          >
            {generateImage.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : item.imageUrl ? (
              <RefreshCw className="size-4" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {item.imageUrl ? 'Regenerate look' : 'Generate look'}
          </Button>
          {generateImage.isError && (
            <p className="text-destructive text-xs">{generateImage.error.message}</p>
          )}
        </div>
      </div>
      <p>{item.description}</p>
    </EntityCard>
  );
}
