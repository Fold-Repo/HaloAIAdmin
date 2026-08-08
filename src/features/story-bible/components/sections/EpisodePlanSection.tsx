import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, ListPlus, Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  EmptySectionState,
  EntityCard,
  SectionShell,
} from '@/features/story-bible/components/SectionShell';
import { useSyncEpisodeCount } from '@/features/story-bible/hooks/useStoryBible';
import { getEpisodePlannerPath } from '@/features/episode-planner/utils/episode-planner.utils';
import { getStoryBiblePath } from '@/features/story-bible/utils/story-bible.utils';
import { getStoryComposerPath } from '@/features/story-bible/utils/story-composer.utils';
import type { EpisodePlanEntry, StoryComposerMeta } from '@/types';

const ACT_PHASE_LABELS: Record<string, string> = {
  setup: 'Setup',
  rising: 'Rising action',
  midpoint: 'Midpoint',
  climax: 'Climax',
  finale: 'Finale',
};

type EpisodePlanSectionProps = {
  projectId: string;
  episodePlan: EpisodePlanEntry[];
  composerMeta: StoryComposerMeta | null;
};

export function EpisodePlanSection({
  projectId,
  episodePlan,
  composerMeta,
}: EpisodePlanSectionProps) {
  const syncMutation = useSyncEpisodeCount(projectId);
  const sorted = [...episodePlan].sort((a, b) => a.number - b.number);
  const generatedCount = sorted.filter((entry) => entry.generated).length;
  const totalCount = sorted.length;
  const progress = totalCount > 0 ? Math.round((generatedCount / totalCount) * 100) : 0;
  const pendingCount = totalCount - generatedCount;

  return (
    <SectionShell
      title="Episode Plan"
      description="The full season story from first episode to finale. Read this before generating scenes or video."
      action={
        <div className="flex flex-wrap gap-2">
          {totalCount > 0 && pendingCount > 0 ? (
            <Button
              size="sm"
              variant="secondary"
              disabled={syncMutation.isPending}
              onClick={() =>
                void (async () => {
                  const result = await syncMutation.mutateAsync({
                    targetCount: totalCount,
                    batchSize: 1,
                    direction: `Generate missing episodes up to ${totalCount} from the story bible.`,
                  });
                  if (result.async) return;
                })()
              }
            >
              <ListPlus className="size-4" />
              {syncMutation.isPending ? 'Syncing…' : `Fill ${pendingCount} missing available`}
            </Button>
          ) : null}
          {pendingCount > 0 ? (
            <Button asChild size="sm" variant="outline">
              <Link to={getStoryComposerPath(projectId)}>
                <Sparkles className="size-4" />
                Generate next batch
              </Link>
            </Button>
          ) : (
            <Button asChild size="sm" variant="outline">
              <Link to={getEpisodePlannerPath(projectId)}>Open episode planner</Link>
            </Button>
          )}
          <Button asChild size="sm" variant="secondary">
            <Link to={getStoryBiblePath(projectId, 'editor')}>Open story editor</Link>
          </Button>
        </div>
      }
    >
      {sorted.length === 0 ? (
        <EmptySectionState message="No episode plan yet. Run Story Composer to plan the full season from your premise." />
      ) : (
        <div className="space-y-6">
          <div className="bg-muted/40 space-y-3 rounded-lg border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span>
                <strong>{generatedCount}</strong> of <strong>{totalCount}</strong> episodes have
                production scenes
              </span>
              {composerMeta && (
                <span className="text-muted-foreground">
                  Target runtime: {composerMeta.targetEpisodeRuntimeSec}s · Batches of{' '}
                  {composerMeta.batchSize}
                </span>
              )}
            </div>
            <Progress value={progress} />
            {pendingCount > 0 && (
              <p className="text-muted-foreground text-xs">
                {pendingCount} episode{pendingCount === 1 ? '' : 's'} outlined but scenes not
                generated yet. Use Story Composer to generate the next batch.
              </p>
            )}
          </div>

          <div className="space-y-4">
            {sorted.map((episode) => (
              <EpisodePlanCard key={episode.id} episode={episode} />
            ))}
          </div>
        </div>
      )}
    </SectionShell>
  );
}

function EpisodePlanCard({ episode }: { episode: EpisodePlanEntry }) {
  const actLabel = ACT_PHASE_LABELS[episode.actPhase] ?? episode.actPhase;

  return (
    <EntityCard title={`Episode ${episode.number}: ${episode.title}`} subtitle={actLabel}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="capitalize">
          {actLabel}
        </Badge>
        {episode.generated ? (
          <Badge variant="default" className="gap-1">
            <CheckCircle2 className="size-3" />
            Scenes generated
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1">
            <Circle className="size-3" />
            Plan only
          </Badge>
        )}
      </div>
      <p className="leading-relaxed">{episode.synopsis}</p>
      {episode.keyBeats.length > 0 && (
        <div className="mt-3">
          <p className="mb-1 text-xs font-medium tracking-wide uppercase">Key beats</p>
          <ul className="list-disc space-y-1 pl-4">
            {episode.keyBeats.map((beat) => (
              <li key={beat}>{beat}</li>
            ))}
          </ul>
        </div>
      )}
      {episode.cliffhanger && (
        <p className="mt-3">
          <strong>Cliffhanger:</strong> {episode.cliffhanger}
        </p>
      )}
    </EntityCard>
  );
}
