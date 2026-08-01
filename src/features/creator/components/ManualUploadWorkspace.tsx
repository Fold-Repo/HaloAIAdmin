import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useCallback, useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LoadingScreen } from '@/components/common';
import { QUERY_KEYS, ROUTES } from '@/constants';
import { useEpisodes } from '@/features/episode-planner/hooks/useEpisodePlanner';
import { episodePlannerService } from '@/features/episode-planner/services/episode-planner.service';
import type { ApiError, Episode } from '@/types';
import { cn } from '@/utils/cn';

type ManualUploadWorkspaceProps = {
  projectId: string;
  projectTitle?: string;
  embedded?: boolean;
};

type RowState = {
  progress: number;
  error?: string;
  uploading: boolean;
};

export function ManualUploadWorkspace({
  projectId,
  projectTitle,
  embedded = false,
}: ManualUploadWorkspaceProps) {
  const queryClient = useQueryClient();
  const episodesQuery = useEpisodes(projectId);
  const [rowState, setRowState] = useState<Record<string, RowState>>({});

  const episodes = episodesQuery.data ?? [];
  const readyCount = useMemo(
    () => episodes.filter((episode) => Boolean(episode.assembledVideoUrl)).length,
    [episodes],
  );
  const allReady = episodes.length > 0 && readyCount === episodes.length;

  const uploadFile = useCallback(
    async (episode: Episode, file: File) => {
      if (!file.name.toLowerCase().endsWith('.mp4') && file.type !== 'video/mp4') {
        setRowState((current) => ({
          ...current,
          [episode.id]: { progress: 0, uploading: false, error: 'Only MP4 files are allowed.' },
        }));
        return;
      }

      setRowState((current) => ({
        ...current,
        [episode.id]: { progress: 0, uploading: true },
      }));

      try {
        await episodePlannerService.uploadEpisodeVideo(projectId, episode.id, file, (percent) => {
          setRowState((current) => ({
            ...current,
            [episode.id]: { progress: percent, uploading: true },
          }));
        });
        setRowState((current) => ({
          ...current,
          [episode.id]: { progress: 100, uploading: false },
        }));
        await queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.episodePlanner.episodes(projectId),
        });
        await queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.creator.project(projectId),
        });
      } catch (error) {
        const message =
          (error as ApiError)?.message ??
          (error instanceof Error ? error.message : 'Upload failed');
        setRowState((current) => ({
          ...current,
          [episode.id]: { progress: 0, uploading: false, error: message },
        }));
      }
    },
    [projectId, queryClient],
  );

  if (episodesQuery.isLoading) {
    return <LoadingScreen message="Loading episodes..." />;
  }

  return (
    <div className={cn('space-y-4', !embedded && 'mx-auto max-w-3xl')}>
      {!embedded && (
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Upload episode videos</h1>
          <p className="text-muted-foreground text-sm">
            {projectTitle ? `${projectTitle} · ` : ''}
            {readyCount}/{episodes.length} ready · MP4 only
          </p>
        </div>
      )}

      {embedded && (
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Upload episode videos</h2>
          <p className="text-muted-foreground text-sm">
            {readyCount}/{episodes.length} ready · drop an MP4 on each episode
          </p>
        </div>
      )}

      <div className="space-y-3">
        {episodes.map((episode) => {
          const state = rowState[episode.id];
          const isReady = Boolean(episode.assembledVideoUrl);
          return (
            <div
              key={episode.id}
              className="bg-card space-y-3 rounded-xl border p-4"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const file = event.dataTransfer.files?.[0];
                if (file) void uploadFile(episode, file);
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">
                    Episode {episode.number}: {episode.title}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {isReady
                      ? `Uploaded ${episode.assembledAt ? new Date(episode.assembledAt).toLocaleString() : ''}`
                      : 'Missing video — drag & drop or choose a file'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={isReady ? 'default' : 'secondary'}>
                    {isReady ? 'Ready' : 'Missing'}
                  </Badge>
                  <label className="inline-flex cursor-pointer">
                    <input
                      type="file"
                      accept="video/mp4,.mp4"
                      className="sr-only"
                      disabled={state?.uploading}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.target.value = '';
                        if (file) void uploadFile(episode, file);
                      }}
                    />
                    <span className="border-input bg-background hover:bg-accent inline-flex h-8 items-center rounded-md border px-3 text-xs font-medium">
                      {isReady ? 'Replace' : 'Upload'} MP4
                    </span>
                  </label>
                </div>
              </div>

              {state?.uploading && (
                <div className="space-y-1">
                  <Progress value={state.progress} />
                  <p className="text-muted-foreground text-xs">{state.progress}%</p>
                </div>
              )}

              {state?.error && (
                <p className="text-destructive text-sm" role="alert">
                  {state.error}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {allReady && (
        <div className="bg-muted/40 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
          <p className="text-sm font-medium">All episodes have videos.</p>
          <Button asChild>
            <Link to={ROUTES.STUDIO.PROJECT_DETAIL.replace(':projectId', projectId)}>
              View project
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
