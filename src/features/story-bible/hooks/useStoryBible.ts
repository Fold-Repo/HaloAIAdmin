import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { QUERY_KEYS } from '@/constants';
import { creatorService } from '@/features/creator/services/creator.service';
import { storyBibleService } from '@/features/story-bible/services/story-bible.service';
import type {
  ApiError,
  ComposeStoryPayload,
  ExpandEpisodesPayload,
  GenerateEpisodeBatchPayload,
  SyncEpisodeCountPayload,
  UpdateStoryDocumentPayload,
  UpdateStoryEndingPayload,
  UpdateStoryOverviewPayload,
} from '@/types';

export function useStoryBible(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.storyBible.detail(projectId),
    queryFn: () => storyBibleService.getStoryBible(projectId).then((response) => response.data),
    enabled: !!projectId,
  });
}

export function useUpdateStoryOverview(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateStoryOverviewPayload) =>
      storyBibleService.updateOverview(projectId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.storyBible.detail(projectId) });
    },
  });
}

export function useUpdateStoryEnding(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateStoryEndingPayload) =>
      storyBibleService.updateEnding(projectId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.storyBible.detail(projectId) });
    },
  });
}

export function useUpdateStoryDocument(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateStoryDocumentPayload) =>
      storyBibleService.updateDocument(projectId, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.storyBible.detail(projectId) });
      if (variables.extractEpisodes) {
        void queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.episodePlanner.summary(projectId),
        });
        void queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.episodePlanner.episodes(projectId),
        });
      }
    },
  });
}

export function usePreviewExtractEpisodes(projectId: string) {
  return useMutation({
    mutationFn: (payload?: { content?: string }) =>
      storyBibleService
        .previewExtractEpisodes(projectId, payload)
        .then((response) => response.data),
  });
}

export function useExtractEpisodes(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload?: { content?: string; mode?: 'merge' | 'replace' }) =>
      storyBibleService.extractEpisodes(projectId, payload).then((response) => response.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.storyBible.detail(projectId) });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.episodePlanner.summary(projectId),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.episodePlanner.episodes(projectId),
      });
    },
  });
}

export function useSaveStoryVersion(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { label: string; changeSummary: string }) =>
      storyBibleService.saveDocumentVersion(projectId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.storyBible.detail(projectId) });
    },
  });
}

export function useRestoreStoryVersion(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (versionId: string) => storyBibleService.restoreVersion(projectId, versionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.storyBible.detail(projectId) });
    },
  });
}

export type StoryBibleMutationError = ApiError;

export function useComposerStatus(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.storyComposer.status(projectId),
    queryFn: () => storyBibleService.getComposerStatus(projectId).then((response) => response.data),
    enabled: !!projectId,
  });
}

export function useComposeStory(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ComposeStoryPayload) =>
      storyBibleService.composeStory(projectId, payload).then((response) => response.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.storyComposer.status(projectId) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.storyBible.detail(projectId) });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.episodePlanner.summary(projectId),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.episodePlanner.episodes(projectId),
      });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.creator.project(projectId) });
    },
  });
}

export function useExpandEpisodes(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ExpandEpisodesPayload) =>
      storyBibleService.expandEpisodes(projectId, payload).then((response) => response.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.storyComposer.status(projectId) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.storyBible.detail(projectId) });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.episodePlanner.summary(projectId),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.episodePlanner.episodes(projectId),
      });
    },
  });
}

export function useSyncStorySummary(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      storyBibleService.syncStorySummary(projectId).then((response) => response.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.storyComposer.status(projectId) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.storyBible.detail(projectId) });
    },
  });
}

export function useGenerateEpisodeBatch(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload?: GenerateEpisodeBatchPayload) =>
      storyBibleService.generateEpisodeBatch(projectId, payload).then((response) => response.data),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.creator.jobs });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.creator.notifications });
      // Background job — don't invalidate story data until the job finishes.
      if ('async' in data && data.async) return;
      invalidateStoryProduction(queryClient, projectId);
    },
  });
}

/** Polls AiJobs while a composer generate job is queued/running; refreshes story data when done. */
export function useWatchEpisodeGenerateJob(projectId: string, jobId: string | null) {
  const queryClient = useQueryClient();
  const settledRef = useRef<string | null>(null);

  const jobsQuery = useQuery({
    queryKey: QUERY_KEYS.creator.jobs,
    queryFn: () => creatorService.getAiJobs().then((response) => response.data),
    enabled: !!projectId,
    refetchInterval: (query) => {
      const jobs = query.state.data ?? [];
      const hasActive = jobs.some(
        (item) =>
          item.projectId === projectId &&
          (item.status === 'queued' || item.status === 'running') &&
          (item.agentId === 'story-composer-generate' ||
            item.agentId === 'story-composer-sync' ||
            (jobId != null && item.id === jobId)),
      );
      return hasActive ? 2500 : false;
    },
  });

  const activeJob =
    jobsQuery.data?.find(
      (item) =>
        item.projectId === projectId &&
        (item.status === 'queued' || item.status === 'running') &&
        (item.agentId === 'story-composer-generate' || item.agentId === 'story-composer-sync'),
    ) ?? (jobId ? jobsQuery.data?.find((item) => item.id === jobId) : undefined);

  const job = jobId ? (jobsQuery.data?.find((item) => item.id === jobId) ?? activeJob) : activeJob;

  useEffect(() => {
    if (!job) return;
    if (job.status !== 'completed' && job.status !== 'failed') return;
    const key = job.id;
    if (settledRef.current === key) return;
    settledRef.current = key;
    invalidateStoryProduction(queryClient, projectId);
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.creator.notifications });
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.creator.jobs });
  }, [job, projectId, queryClient]);

  const isActive = Boolean(
    activeJob && (activeJob.status === 'queued' || activeJob.status === 'running'),
  );

  return {
    job: activeJob ?? job,
    activeJobId: activeJob?.id ?? null,
    isWatching: isActive,
    isComplete: job?.status === 'completed',
    isFailed: job?.status === 'failed',
  };
}

function invalidateStoryProduction(
  queryClient: ReturnType<typeof useQueryClient>,
  projectId: string,
) {
  void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.storyComposer.status(projectId) });
  void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.storyBible.detail(projectId) });
  void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.episodePlanner.summary(projectId) });
  void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.episodePlanner.episodes(projectId) });
  void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.creator.project(projectId) });
}

export function useSyncEpisodeCount(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SyncEpisodeCountPayload) =>
      storyBibleService.syncEpisodeCount(projectId, payload).then((response) => response.data),
    onSuccess: (data) => {
      if (data.composerStatus) {
        queryClient.setQueryData(QUERY_KEYS.storyComposer.status(projectId), data.composerStatus);
      }
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.creator.jobs });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.creator.notifications });
      if (data.async) return;
      invalidateStoryProduction(queryClient, projectId);
    },
  });
}

export function useDirectorChat(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      message: string;
      history?: Array<{ role: 'user' | 'assistant'; content: string }>;
    }) => storyBibleService.directorChat(projectId, payload).then((response) => response.data),
    onSuccess: () => invalidateStoryProduction(queryClient, projectId),
  });
}

export function useScenePlanChat(projectId: string, episodeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      message: string;
      history?: Array<{ role: 'user' | 'assistant'; content: string }>;
      apply?: boolean;
    }) =>
      storyBibleService
        .scenePlanChat(projectId, episodeId, payload)
        .then((response) => response.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.episodePlanner.episode(projectId, episodeId),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.episodePlanner.summary(projectId),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.episodePlanner.episodes(projectId),
      });
    },
  });
}

export function useGenerateCharacterImage(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { characterId: string; regenerate?: boolean }) =>
      storyBibleService
        .generateCharacterImage(projectId, payload.characterId, {
          regenerate: payload.regenerate,
        })
        .then((response) => response.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.storyBible.detail(projectId) });
    },
  });
}

export function useGenerateLocationImage(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { locationId: string; regenerate?: boolean }) =>
      storyBibleService
        .generateLocationImage(projectId, payload.locationId, {
          regenerate: payload.regenerate,
        })
        .then((response) => response.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.storyBible.detail(projectId) });
    },
  });
}

export function useGeneratePropImage(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { propId: string; regenerate?: boolean }) =>
      storyBibleService
        .generatePropImage(projectId, payload.propId, {
          regenerate: payload.regenerate,
        })
        .then((response) => response.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.storyBible.detail(projectId) });
    },
  });
}

export function useGenerateWardrobeImage(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { wardrobeId: string; regenerate?: boolean }) =>
      storyBibleService
        .generateWardrobeImage(projectId, payload.wardrobeId, {
          regenerate: payload.regenerate,
        })
        .then((response) => response.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.storyBible.detail(projectId) });
    },
  });
}
