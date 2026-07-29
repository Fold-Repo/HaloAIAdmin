import { Loader2, RefreshCw, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AuthenticatedImage } from '@/features/story-bible/components/AuthenticatedImage';
import {
  EmptySectionState,
  EntityCard,
  SectionShell,
} from '@/features/story-bible/components/SectionShell';
import { useGenerateCharacterImage } from '@/features/story-bible/hooks/useStoryBible';
import { getCharacterImageApiUrl } from '@/features/story-bible/utils/story-bible.utils';
import type { StoryCharacter } from '@/types';

type CharactersSectionProps = {
  projectId: string;
  characters: StoryCharacter[];
};

export function CharactersSection({ projectId, characters }: CharactersSectionProps) {
  return (
    <SectionShell
      title="Characters"
      description="Maintain character consistency across AI script, voice, and video generation."
    >
      {characters.length === 0 ? (
        <EmptySectionState message="No characters yet. Run Story Composer from the project page to populate the bible, or sync summary after adding episodes." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {characters.map((character) => (
            <CharacterCard key={character.id} projectId={projectId} character={character} />
          ))}
        </div>
      )}
    </SectionShell>
  );
}

function CharacterCard({
  projectId,
  character,
}: {
  projectId: string;
  character: StoryCharacter;
}) {
  const generateImage = useGenerateCharacterImage(projectId);
  const imageApiUrl = character.imageUrl
    ? getCharacterImageApiUrl(projectId, character.id)
    : null;

  return (
    <EntityCard title={character.name} subtitle={character.role}>
      <div className="mb-3 flex flex-col gap-3 sm:flex-row">
        {imageApiUrl ? (
          <AuthenticatedImage
            src={imageApiUrl}
            alt={`Portrait of ${character.name}`}
            className="aspect-[3/4] w-full max-w-[160px] shrink-0"
          />
        ) : (
          <div className="bg-muted text-muted-foreground flex aspect-[3/4] w-full max-w-[160px] shrink-0 items-center justify-center rounded-lg border text-xs">
            No portrait yet
          </div>
        )}
        <div className="flex flex-1 flex-col gap-2">
          <Badge variant="secondary" className="w-fit capitalize">
            {character.role}
          </Badge>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-fit"
            disabled={generateImage.isPending}
            onClick={() =>
              void generateImage.mutateAsync({
                characterId: character.id,
                regenerate: Boolean(character.imageUrl),
              })
            }
          >
            {generateImage.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : character.imageUrl ? (
              <RefreshCw className="size-4" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {character.imageUrl ? 'Regenerate portrait' : 'Generate portrait'}
          </Button>
          {generateImage.isError && (
            <p className="text-destructive text-xs">{generateImage.error.message}</p>
          )}
        </div>
      </div>
      <p>{character.description}</p>
      <p>
        <strong>Motivation:</strong> {character.motivation}
      </p>
      <p>
        <strong>Backstory:</strong> {character.backstory}
      </p>
      <p>
        <strong>Visual notes:</strong> {character.visualNotes}
      </p>
      {character.voiceNotes && (
        <p>
          <strong>Voice notes:</strong> {character.voiceNotes}
        </p>
      )}
    </EntityCard>
  );
}
