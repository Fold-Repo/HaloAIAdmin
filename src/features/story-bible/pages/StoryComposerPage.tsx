import { Link, useLocation, useParams } from 'react-router-dom';
import { BookOpen, Clapperboard, Film, RefreshCw, Sparkles, Video } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { LoadingScreen } from '@/components/common';
import { useProject } from '@/features/creator/hooks/useCreatorQueries';
import { getEpisodePlannerPath } from '@/features/episode-planner/utils/episode-planner.utils';
import { getAiGenerationPath } from '@/features/ai-generation/utils/ai-generation.utils';
import {
  useComposeStory,
  useComposerStatus,
  useExpandEpisodes,
  useGenerateEpisodeBatch,
  useSyncStorySummary,
  useWatchEpisodeGenerateJob,
} from '@/features/story-bible/hooks/useStoryBible';
import { getStoryBiblePath } from '@/features/story-bible/utils/story-bible.utils';
import type { ComposerNextStep, GenerateEpisodeBatchAccepted } from '@/types';

const STEP_LABELS: Record<ComposerNextStep, string> = {
  compose: 'Plan full story',
  'review-bible': 'Read story bible',
  'generate-episodes': 'Generate episodes',
  'review-episodes': 'Review episodes',
  'complete-scenes': 'Complete scenes',
  'generate-video': 'Generate video',
  done: 'Done',
};

const PIPELINE_STEPS: ComposerNextStep[] = [
  'compose',
  'review-bible',
  'generate-episodes',
  'review-episodes',
  'complete-scenes',
  'generate-video',
];

type ComposerLocationState = {
  autoCompose?: boolean;
  episodeCount?: number;
  premise?: string;
};

export function StoryComposerPage() {
  const { projectId = '' } = useParams();
  const location = useLocation();
  const navState = (location.state ?? {}) as ComposerLocationState;

  const projectQuery = useProject(projectId);
  const statusQuery = useComposerStatus(projectId);
  const composeStory = useComposeStory(projectId);
  const generateBatch = useGenerateEpisodeBatch(projectId);
  const expandEpisodes = useExpandEpisodes(projectId);
  const syncSummary = useSyncStorySummary(projectId);

  const [premise, setPremise] = useState('');
  const [episodeCount, setEpisodeCount] = useState(3);
  const [firstBatchCount, setFirstBatchCount] = useState(1);
  const [batchCount, setBatchCount] = useState(1);
  const [expandCount, setExpandCount] = useState(1);
  const [expandDirection, setExpandDirection] = useState('');
  const [expandFinale, setExpandFinale] = useState(false);
  const [autoComposeAttempted, setAutoComposeAttempted] = useState(false);
  const [activeGenerateJobId, setActiveGenerateJobId] = useState<string | null>(null);

  const project = projectQuery.data;
  const status = statusQuery.data;
  const generateWatch = useWatchEpisodeGenerateJob(projectId, activeGenerateJobId);

  useEffect(() => {
    if (generateWatch.activeJobId && generateWatch.activeJobId !== activeGenerateJobId) {
      setActiveGenerateJobId(generateWatch.activeJobId);
    }
  }, [generateWatch.activeJobId, activeGenerateJobId]);

  useEffect(() => {
    if (!project) return;
    setPremise(navState.premise ?? project.prompt ?? '');
    setEpisodeCount(navState.episodeCount ?? 3);
  }, [project, navState.premise, navState.episodeCount]);

  useEffect(() => {
    if (
      !navState.autoCompose ||
      autoComposeAttempted ||
      !status ||
      status.nextStep !== 'compose' ||
      composeStory.isPending
    ) {
      return;
    }

    if (!premise.trim()) return;

    setAutoComposeAttempted(true);
    composeStory.mutate({
      premise: premise.trim(),
      episodeCount,
      mode: 'replace',
      firstBatchCount,
    });
  }, [
    navState.autoCompose,
    autoComposeAttempted,
    status,
    premise,
    episodeCount,
    firstBatchCount,
    composeStory,
  ]);

  if (projectQuery.isLoading || statusQuery.isLoading) {
    return <LoadingScreen message="Loading story composer..." />;
  }

  if (!project || !status) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold">Project not found</h1>
      </div>
    );
  }

  const sceneProgress =
    status.scenesTotal > 0 ? Math.round((status.scenesReady / status.scenesTotal) * 100) : 0;
  const planProgress =
    status.plannedEpisodeCount > 0
      ? Math.round((status.generatedFromPlan / status.plannedEpisodeCount) * 100)
      : 0;
  const currentStepIndex = PIPELINE_STEPS.indexOf(
    status.nextStep === 'done' ? 'generate-video' : status.nextStep,
  );
  const targetRuntimeSec = Math.max(100, project.episodeLength);

  const handleCompose = () => {
    composeStory.mutate({
      premise: premise.trim(),
      episodeCount,
      mode: status.episodeCount > 0 ? 'merge' : 'replace',
      firstBatchCount,
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Story Composer</h1>
          <Badge variant="secondary">{project.title}</Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          Claude plans the full season in the story bible first (beginning to ending). Episode
          scenes generate in settable batches (default 1 — safer behind Cloudflare). Each episode
          targets at least 1:40 ({targetRuntimeSec}s) with 7+ scenes before video generation.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Production pipeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {PIPELINE_STEPS.map((step, index) => {
              const active = index === currentStepIndex;
              const complete = index < currentStepIndex;
              return (
                <Badge key={step} variant={active ? 'default' : complete ? 'secondary' : 'outline'}>
                  {index + 1}. {STEP_LABELS[step]}
                </Badge>
              );
            })}
          </div>
          {status.hasEpisodePlan && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Episodes generated from plan</span>
                <span>
                  {status.generatedFromPlan}/{status.plannedEpisodeCount}
                </span>
              </div>
              <Progress value={planProgress} />
            </div>
          )}
          {status.scenesTotal > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Scenes ready for video</span>
                <span>
                  {status.scenesReady}/{status.scenesTotal}
                </span>
              </div>
              <Progress value={sceneProgress} />
            </div>
          )}
        </CardContent>
      </Card>

      {(status.nextStep === 'compose' || composeStory.isPending) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="size-4" />
              Plan full story from premise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="premise">Story premise</Label>
              <Textarea
                id="premise"
                rows={6}
                value={premise}
                onChange={(event) => setPremise(event.target.value)}
                placeholder="Describe characters, conflict, tone, and where the story should go..."
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="episodeCount">Total episodes in season</Label>
                <Input
                  id="episodeCount"
                  type="number"
                  min={1}
                  max={30}
                  value={episodeCount}
                  onChange={(event) => setEpisodeCount(Number(event.target.value))}
                />
                <p className="text-muted-foreground text-xs">
                  Full plot is planned for all episodes up front.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstBatchCount">First batch size</Label>
                <Input
                  id="firstBatchCount"
                  type="number"
                  min={1}
                  max={5}
                  value={firstBatchCount}
                  onChange={(event) =>
                    setFirstBatchCount(Math.min(5, Math.max(1, Number(event.target.value) || 1)))
                  }
                />
                <p className="text-muted-foreground text-xs">
                  Use 1 on staging to avoid timeouts / wasted Claude calls.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Target episode runtime</Label>
                <Input value={`${targetRuntimeSec}s minimum (1:40+)`} disabled />
              </div>
            </div>
            {(composeStory.error || statusQuery.error) && (
              <p className="text-destructive text-sm" role="alert">
                {(composeStory.error ?? statusQuery.error)?.message}
              </p>
            )}
            <Button
              disabled={composeStory.isPending || premise.trim().length < 10}
              onClick={handleCompose}
            >
              {composeStory.isPending
                ? 'Planning story & generating first batch...'
                : 'Plan full story & generate first batch'}
            </Button>
          </CardContent>
        </Card>
      )}

      {status.hasStoryOverview && status.overview && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Story overview</CardTitle>
            <Button
              variant="outline"
              size="sm"
              disabled={syncSummary.isPending}
              onClick={() => syncSummary.mutate()}
            >
              <RefreshCw className="size-4" />
              {syncSummary.isPending ? 'Syncing...' : 'Sync summary'}
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              <span className="text-muted-foreground">Logline:</span> {status.overview.logline}
            </p>
            <p className="leading-relaxed">{status.overview.synopsis}</p>
            <p>
              <span className="text-muted-foreground">Tone:</span> {status.overview.tone}
            </p>
            {status.summarySyncedAt && (
              <p className="text-muted-foreground text-xs">
                Summary last synced {new Date(status.summarySyncedAt).toLocaleString()}
              </p>
            )}
            <Button asChild variant="secondary" size="sm">
              <Link to={getStoryBiblePath(projectId, 'episode-plan')}>
                <BookOpen className="size-4" />
                Read full episode plan
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {status.hasEpisodePlan && status.episodePlanPreview.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Season episode plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              The full plot is in the story bible. Review before generating more scenes or video.
            </p>
            <ul className="space-y-1">
              {status.episodePlanPreview.map((entry) => (
                <li key={entry.number} className="flex items-center gap-2">
                  <Badge variant={entry.generated ? 'secondary' : 'outline'}>
                    Ep {entry.number}
                  </Badge>
                  <span>{entry.title}</span>
                  <span className="text-muted-foreground text-xs">({entry.actPhase})</span>
                  {entry.generated && (
                    <span className="text-muted-foreground text-xs">scenes ready</span>
                  )}
                </li>
              ))}
            </ul>
            {status.plannedEpisodeCount > status.episodePlanPreview.length && (
              <p className="text-muted-foreground text-xs">
                +{status.plannedEpisodeCount - status.episodePlanPreview.length} more in story bible
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {status.pendingEpisodeCount > 0 && status.nextBatch && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-base">Generate next episode batch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Next up from the plan: episode{status.nextBatch.size > 1 ? 's' : ''}{' '}
              {status.nextBatch.start}
              {status.nextBatch.size > 1 ? `–${status.nextBatch.end}` : ''}
              {status.nextBatch.isFinale ? ' (season finale)' : ''}. Each episode gets 7+ scenes
              totaling at least 1:40.
            </p>
            <div className="max-w-xs space-y-2">
              <Label htmlFor="batchCount">Episodes this call (1–5)</Label>
              <Input
                id="batchCount"
                type="number"
                min={1}
                max={5}
                value={batchCount}
                onChange={(event) =>
                  setBatchCount(Math.min(5, Math.max(1, Number(event.target.value) || 1)))
                }
              />
              <p className="text-muted-foreground text-xs">
                Prefer 1 behind Cloudflare (~100s limit). Larger batches risk a 524 after Claude
                already ran.
              </p>
            </div>
            {generateWatch.isWatching ? (
              <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm">
                Episode job in progress
                {generateWatch.job?.message ? `: ${generateWatch.job.message}` : ''}. Wait until it
                finishes — another generate cannot be started.
              </p>
            ) : null}
            {generateBatch.error && (
              <p className="text-destructive text-sm" role="alert">
                {generateBatch.error.message}
              </p>
            )}
            {!generateWatch.isWatching &&
            (generateBatch.data as GenerateEpisodeBatchAccepted | undefined)?.message ? (
              <p className="text-muted-foreground text-xs">
                {(generateBatch.data as GenerateEpisodeBatchAccepted).message}
              </p>
            ) : null}
            <Button
              disabled={generateBatch.isPending || generateWatch.isWatching}
              onClick={() => {
                if (generateWatch.isWatching) return;
                generateBatch.mutate(
                  {
                    count: batchCount,
                    forceFinale: status.nextBatch?.isFinale,
                  },
                  {
                    onSuccess: (data) => {
                      if ('jobId' in data && data.jobId) {
                        setActiveGenerateJobId(data.jobId);
                      }
                    },
                  },
                );
              }}
            >
              {generateBatch.isPending
                ? 'Starting…'
                : generateWatch.isWatching
                  ? 'Job running — wait…'
                  : `Generate ${batchCount} episode${batchCount === 1 ? '' : 's'}`}
            </Button>
          </CardContent>
        </Card>
      )}

      {status.episodeCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Episodes & scenes</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link to={getEpisodePlannerPath(projectId)}>
                <Clapperboard className="size-4" />
                Review {status.episodeCount} episodes
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={getStoryBiblePath(projectId, 'overview')}>
                <BookOpen className="size-4" />
                Story bible
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {status.nextStep === 'complete-scenes' && (
        <Card className="border-amber-500/40">
          <CardHeader>
            <CardTitle className="text-base">Complete scenes before video</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              {status.scenesReady} of {status.scenesTotal} scenes are ready. Each scene needs a
              production-ready description (40+ characters) and status planned or higher.
            </p>
            <Button asChild>
              <Link to={getEpisodePlannerPath(projectId)}>Edit scenes</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {status.videoUnlocked && (
        <Card className="border-primary/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Video className="size-4" />
              Video generation unlocked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to={getAiGenerationPath(projectId, 'video')}>
                <Film className="size-4" />
                Generate scene videos
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {status.episodeCount > 0 && status.pendingEpisodeCount === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Extend season (optional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              All planned episodes are generated. Add more episodes to the plan and generate scenes
              from the updated bible.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="expandCount">Episodes to add</Label>
                <Input
                  id="expandCount"
                  type="number"
                  min={1}
                  max={5}
                  value={expandCount}
                  onChange={(event) => setExpandCount(Number(event.target.value))}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="expandDirection">Direction (optional)</Label>
                <Textarea
                  id="expandDirection"
                  rows={3}
                  value={expandDirection}
                  onChange={(event) => setExpandDirection(event.target.value)}
                  placeholder="Where should the story go next?"
                />
              </div>
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input
                  type="checkbox"
                  checked={expandFinale}
                  onChange={(event) => setExpandFinale(event.target.checked)}
                />
                These episodes are the season finale
              </label>
            </div>
            {expandEpisodes.error && (
              <p className="text-destructive text-sm" role="alert">
                {expandEpisodes.error.message}
              </p>
            )}
            <Button
              variant="secondary"
              disabled={expandEpisodes.isPending}
              onClick={() =>
                expandEpisodes.mutate({
                  count: expandCount,
                  direction: expandDirection.trim() || undefined,
                  finale: expandFinale,
                })
              }
            >
              {expandEpisodes.isPending ? 'Adding episodes...' : 'Extend plan & generate batch'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
