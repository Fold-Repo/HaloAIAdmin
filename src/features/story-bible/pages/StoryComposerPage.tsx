import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation, useParams } from 'react-router-dom';
import { BookOpen, Clapperboard, Film, RefreshCw, Sparkles, Video } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { LoadingScreen } from '@/components/common';
import { QUERY_KEYS } from '@/constants';
import { creatorService } from '@/features/creator/services/creator.service';
import { useProject } from '@/features/creator/hooks/useCreatorQueries';
import { getEpisodePlannerPath } from '@/features/episode-planner/utils/episode-planner.utils';
import { getAiGenerationPath } from '@/features/ai-generation/utils/ai-generation.utils';
import { FullStoryBoard } from '@/features/story-bible/components/FullStoryBoard';
import {
  useComposeStory,
  useComposerStatus,
  useExpandEpisodes,
  useGenerateEpisodeBatch,
  usePlanEpisode,
  useRememberSeasonSize,
  useStoryBoard,
  useSyncStorySummary,
} from '@/features/story-bible/hooks/useStoryBible';
import { getStoryBiblePath } from '@/features/story-bible/utils/story-bible.utils';
import type { AiJob, ComposerNextStep } from '@/types';

const COMPOSER_JOB_AGENTS = new Set([
  'story-composer-compose',
  'story-composer-generate',
  'story-composer-sync',
]);

function isActiveComposerJob(job: AiJob, projectId: string) {
  return (
    job.projectId === projectId &&
    COMPOSER_JOB_AGENTS.has(job.agentId ?? '') &&
    (job.status === 'queued' || job.status === 'running')
  );
}

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

  const queryClient = useQueryClient();
  const [waitingJobId, setWaitingJobId] = useState<string | null>(null);
  const [jobNotice, setJobNotice] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const jobsQuery = useQuery({
    queryKey: [...QUERY_KEYS.creator.jobs, 'composer-snapshot', projectId],
    queryFn: () => creatorService.getAiJobs().then((response) => response.data),
    enabled: !!projectId,
    refetchInterval: (query) => {
      if (waitingJobId) return 4000;
      const jobs = query.state.data ?? [];
      return jobs.some((job) => isActiveComposerJob(job, projectId)) ? 4000 : false;
    },
    refetchOnWindowFocus: false,
  });

  const projectQuery = useProject(projectId);
  const statusQuery = useComposerStatus(projectId);
  const storiesQuery = useStoryBoard(projectId);
  const composeStory = useComposeStory(projectId);
  const generateBatch = useGenerateEpisodeBatch(projectId);
  const planEpisode = usePlanEpisode(projectId);
  const rememberSeasonSize = useRememberSeasonSize(projectId);
  const expandEpisodes = useExpandEpisodes(projectId);
  const syncSummary = useSyncStorySummary(projectId);

  const [premise, setPremise] = useState('');
  const [episodeCount, setEpisodeCount] = useState(3);
  const [seasonSize, setSeasonSize] = useState(3);
  const [expandCount, setExpandCount] = useState(1);
  const [expandDirection, setExpandDirection] = useState('');
  const [expandFinale, setExpandFinale] = useState(false);
  const [autoComposeAttempted, setAutoComposeAttempted] = useState(false);
  const settledJobIds = useRef(new Set<string>());
  const watchedJobId = useRef<string | null>(null);

  const project = projectQuery.data;
  const status = statusQuery.data;
  const runningJob = jobsQuery.data?.find((job) => isActiveComposerJob(job, projectId));
  const paused = Boolean(waitingJobId || runningJob);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const [jobsResult] = await Promise.all([
        jobsQuery.refetch(),
        statusQuery.refetch(),
        storiesQuery.refetch(),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.creator.notifications }),
      ]);
      const jobs = jobsResult.data ?? [];
      const stillRunning = jobs.some((job) => isActiveComposerJob(job, projectId));
      const tracked = waitingJobId ? jobs.find((job) => job.id === waitingJobId) : undefined;
      if (!stillRunning) {
        setWaitingJobId(null);
        if (tracked?.status === 'failed') {
          setJobNotice(tracked.errorMessage ?? tracked.message ?? 'Story generation failed.');
        } else if (tracked?.status === 'completed') {
          setJobNotice(tracked.message ?? 'Story generation finished.');
        }
      }
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const jobs = jobsQuery.data ?? [];
    const active = jobs.find((job) => isActiveComposerJob(job, projectId));
    if (active) watchedJobId.current = active.id;
    const targetId = waitingJobId ?? watchedJobId.current;
    if (!targetId) return;
    const job = jobs.find((item) => item.id === targetId);
    if (!job || (job.status !== 'completed' && job.status !== 'failed')) return;
    if (settledJobIds.current.has(job.id)) return;
    settledJobIds.current.add(job.id);
    watchedJobId.current = null;
    setWaitingJobId(null);
    setJobNotice(
      job.status === 'failed'
        ? (job.errorMessage ?? job.message ?? 'Story plan failed.')
        : (job.message ?? 'Story plan ready.'),
    );
    void statusQuery.refetch();
    void storiesQuery.refetch();
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.creator.notifications });
  }, [jobsQuery.data, waitingJobId, projectId, queryClient, statusQuery, storiesQuery]);

  useEffect(() => {
    if (!project) return;
    setPremise(navState.premise ?? project.prompt ?? '');
    setEpisodeCount(navState.episodeCount ?? 3);
  }, [project, navState.premise, navState.episodeCount]);

  useEffect(() => {
    if (!status?.plannedEpisodeCount) return;
    setSeasonSize(status.plannedEpisodeCount);
  }, [status?.plannedEpisodeCount]);

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
    composeStory.mutate(
      {
        premise: premise.trim(),
        episodeCount,
        mode: 'replace',
      },
      {
        onSuccess: (data) => {
          if (data.jobId) {
            setWaitingJobId(data.jobId);
            setJobNotice(null);
          }
        },
      },
    );
  }, [navState.autoCompose, autoComposeAttempted, status, premise, episodeCount, composeStory]);

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
    composeStory.mutate(
      {
        premise: premise.trim(),
        episodeCount: Math.min(50, Math.max(1, episodeCount)),
        mode: status.episodeCount > 0 ? 'merge' : 'replace',
      },
      {
        onSuccess: (data) => {
          if (data.jobId) {
            setWaitingJobId(data.jobId);
            setJobNotice(null);
          }
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Story Composer</h1>
          <Badge variant="secondary">{project.title}</Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          A new AI project writes the story plan for up to 50 episodes and stops there. Generate
          scenes on that episode. Video opens when an episode’s scenes are ready. The page stays
          paused until you refresh. Each episode targets at least 1:40 ({targetRuntimeSec}s) with 7+
          scenes.
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

      {paused ? (
        <div className="space-y-3 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-3 text-sm">
          <p>
            The story plan is running in the background, eight episodes at a time. This page stays
            paused and checks the job every few seconds.
            {runningJob?.message
              ? ` ${runningJob.message}`
              : ' The plan loads here when that job finishes.'}
          </p>
          <Button
            type="button"
            variant="outline"
            disabled={refreshing}
            onClick={() => void handleRefresh()}
          >
            <RefreshCw className="size-4" />
            {refreshing ? 'Refreshing…' : 'Refresh stories'}
          </Button>
        </div>
      ) : null}
      {jobNotice ? <p className="text-sm">{jobNotice}</p> : null}

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
                disabled={paused}
                onChange={(event) => setPremise(event.target.value)}
                placeholder="Describe characters, conflict, tone, and where the story should go..."
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="episodeCount">Total episodes in season</Label>
                <Input
                  id="episodeCount"
                  type="number"
                  min={1}
                  max={50}
                  disabled={paused}
                  value={episodeCount}
                  onChange={(event) =>
                    setEpisodeCount(Math.min(50, Math.max(1, Number(event.target.value) || 1)))
                  }
                />
                <p className="text-muted-foreground text-xs">
                  Up to 50. This writes the story plan only. Generate scenes afterward, one episode
                  at a time.
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
              disabled={composeStory.isPending || paused || premise.trim().length < 10}
              onClick={handleCompose}
            >
              {composeStory.isPending
                ? 'Starting…'
                : paused
                  ? 'Paused until you refresh'
                  : 'Create story plan'}
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

      {status.hasStoryOverview && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Episodes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="text-muted-foreground">
              The story plan is already written. If an episode has no scenes, use Generate scenes on
              that episode only.
            </p>
            <div className="flex flex-wrap items-end gap-2">
              <div className="space-y-2">
                <Label htmlFor="seasonSize">Season episodes</Label>
                <Input
                  id="seasonSize"
                  type="number"
                  min={1}
                  max={50}
                  className="w-28"
                  value={seasonSize}
                  disabled={paused}
                  onChange={(event) =>
                    setSeasonSize(Math.min(50, Math.max(1, Number(event.target.value) || 1)))
                  }
                />
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={paused || rememberSeasonSize.isPending}
                onClick={() => rememberSeasonSize.mutate(seasonSize)}
              >
                {rememberSeasonSize.isPending ? 'Saving…' : 'Remember season size'}
              </Button>
            </div>
            {(status.seasonEpisodes?.length ?? 0) > 0 && (
              <ul className="space-y-2">
                {status.seasonEpisodes?.map((episode) => {
                  const nextToPlan = status.seasonEpisodes?.find(
                    (item) => item.status === 'not-planned',
                  )?.number;
                  return (
                    <li key={episode.number} className="flex flex-wrap items-center gap-2">
                      <Badge variant={episode.status === 'scenes-ready' ? 'secondary' : 'outline'}>
                        Ep {episode.number}
                      </Badge>
                      <span className="min-w-0 flex-1 text-sm">{episode.title}</span>
                      <span className="text-muted-foreground text-xs">
                        {episode.status === 'scenes-ready'
                          ? 'scenes ready'
                          : episode.status === 'outline-ready'
                            ? 'plan ready, no scenes'
                            : 'no story plan'}
                      </span>
                      {episode.status === 'not-planned' && episode.number === nextToPlan && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={paused || planEpisode.isPending}
                          onClick={() => {
                            planEpisode.mutate(episode.number, {
                              onSuccess: (data) => {
                                if (data.jobId) {
                                  setWaitingJobId(data.jobId);
                                  setJobNotice(null);
                                }
                              },
                            });
                          }}
                        >
                          Create story plan
                        </Button>
                      )}
                      {episode.status === 'outline-ready' && (
                        <Button
                          type="button"
                          size="sm"
                          disabled={paused || generateBatch.isPending}
                          onClick={() => {
                            generateBatch.mutate(
                              { count: 1, episodeNumber: episode.number },
                              {
                                onSuccess: (data) => {
                                  if ('jobId' in data && data.jobId) {
                                    setWaitingJobId(data.jobId);
                                    setJobNotice(null);
                                  }
                                },
                              },
                            );
                          }}
                        >
                          Generate scenes
                        </Button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
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
              The full plot is in the story bible. Episodes with a plan and no scenes can generate
              scenes from here.
            </p>
            <ul className="space-y-1">
              {status.episodePlanPreview.map((entry) => (
                <li key={entry.number} className="flex items-center gap-2">
                  <Badge variant={entry.generated ? 'secondary' : 'outline'}>
                    Ep {entry.number}
                  </Badge>
                  <span>{entry.title}</span>
                  <span className="text-muted-foreground text-xs">({entry.actPhase})</span>
                  {entry.generated ? (
                    <span className="text-muted-foreground text-xs">scenes ready</span>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      disabled={paused || generateBatch.isPending}
                      onClick={() => {
                        generateBatch.mutate(
                          { count: 1, episodeNumber: entry.number },
                          {
                            onSuccess: (data) => {
                              if ('jobId' in data && data.jobId) {
                                setWaitingJobId(data.jobId);
                                setJobNotice(null);
                              }
                            },
                          },
                        );
                      }}
                    >
                      Generate scenes
                    </Button>
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

      {storiesQuery.data && storiesQuery.data.episodes.length > 0 && (
        <FullStoryBoard stories={storiesQuery.data} generating={false} />
      )}

      {(generateBatch.error || planEpisode.error) && (
        <p className="text-destructive text-sm" role="alert">
          {(generateBatch.error ?? planEpisode.error)?.message}
        </p>
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
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              {status.scenesReady} scene{status.scenesReady === 1 ? '' : 's'} can go to video now.
              Other episodes can stay as a plan until you generate their scenes.
            </p>
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
              disabled={expandEpisodes.isPending || paused}
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
