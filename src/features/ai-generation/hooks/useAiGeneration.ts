import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

import { QUERY_KEYS } from '@/constants';
import { creatorService } from '@/features/creator/services/creator.service';
import { aiGenerationService } from '@/features/ai-generation/services/ai-generation.service';
import type {
  ApiError,
  PromptBuilderPayload,
  RunAgentBatchPayload,
  RunAgentPayload,
} from '@/types';

export function useAiDirectorOverview(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.aiGeneration.director(projectId),
    queryFn: () =>
      aiGenerationService.getDirectorOverview(projectId).then((response) => response.data),
    enabled: !!projectId,
    refetchInterval: 10000,
  });
}

export function useAiAgent(projectId: string, agentId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.aiGeneration.agent(projectId, agentId),
    queryFn: () =>
      aiGenerationService.getAgent(projectId, agentId).then((response) => response.data),
    enabled: !!projectId && !!agentId,
  });
}

export function usePromptTemplates(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.aiGeneration.templates(projectId),
    queryFn: () =>
      aiGenerationService.getPromptTemplates(projectId).then((response) => response.data),
    enabled: !!projectId,
  });
}

export function useCostEstimate(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.aiGeneration.cost(projectId),
    queryFn: () => aiGenerationService.getCostEstimate(projectId).then((response) => response.data),
    enabled: !!projectId,
  });
}

export function useAiLogs(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.aiGeneration.logs(projectId),
    queryFn: () => aiGenerationService.getLogs(projectId).then((response) => response.data),
    enabled: !!projectId,
    refetchInterval: 15000,
  });
}

export function useScenePreview(
  projectId: string,
  episodeId?: string,
  options?: { pollWhileRunning?: boolean },
) {
  return useQuery({
    queryKey: QUERY_KEYS.aiGeneration.scenePreview(projectId, episodeId),
    queryFn: () =>
      aiGenerationService.getScenePreview(projectId, episodeId).then((response) => response.data),
    enabled: !!projectId,
    refetchInterval: options?.pollWhileRunning ? 4000 : false,
  });
}

function invalidateVideoAgentQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  projectId: string,
  episodeId?: string,
) {
  void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.aiGeneration.director(projectId) });
  void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.aiGeneration.logs(projectId) });
  void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.aiGeneration.cost(projectId) });
  void queryClient.invalidateQueries({
    queryKey: QUERY_KEYS.aiGeneration.agent(projectId, 'video'),
  });
  void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.episodePlanner.episodes(projectId) });
  void queryClient.invalidateQueries({
    queryKey: QUERY_KEYS.aiGeneration.scenePreview(projectId),
  });
  void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.creator.jobs });
  void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.creator.notifications });
  if (episodeId) {
    void queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.episodePlanner.episode(projectId, episodeId),
    });
  }
}

export function useRunAgent(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RunAgentPayload) => aiGenerationService.runAgent(projectId, payload),
    onSuccess: (response, variables) => {
      const data = response.data;
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.creator.jobs });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.creator.notifications });
      // Background video job — wait for useWatchVideoAgentJob to refresh scene data.
      if (data && 'async' in data && data.async) return;
      invalidateVideoAgentQueries(queryClient, projectId, variables.episodeId);
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.aiGeneration.agent(projectId, variables.agentId),
      });
    },
  });
}

export function useRunAgentBatch(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RunAgentBatchPayload) =>
      aiGenerationService.runAgentBatch(projectId, payload),
    onSuccess: (response, variables) => {
      const data = response.data;
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.creator.jobs });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.creator.notifications });
      if (data && 'async' in data && data.async) return;
      invalidateVideoAgentQueries(queryClient, projectId, variables.episodeId);
    },
  });
}

/** Polls while a Video Agent batch job is queued/running; refreshes previews when done. */
export function useWatchVideoAgentJob(projectId: string, jobId: string | null) {
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
          item.type === 'video' &&
          (item.status === 'queued' || item.status === 'running') &&
          (item.agentId === 'video-batch' ||
            item.agentId === 'video' ||
            (jobId != null && item.id === jobId)),
      );
      return hasActive ? 2500 : false;
    },
  });

  const activeBatch =
    jobsQuery.data?.find(
      (item) =>
        item.projectId === projectId &&
        item.type === 'video' &&
        (item.status === 'queued' || item.status === 'running') &&
        item.agentId === 'video-batch',
    ) ??
    jobsQuery.data?.find(
      (item) =>
        item.projectId === projectId &&
        item.type === 'video' &&
        (item.status === 'queued' || item.status === 'running'),
    );

  const job = jobId
    ? (jobsQuery.data?.find((item) => item.id === jobId) ?? activeBatch)
    : activeBatch;

  useEffect(() => {
    if (!job) return;
    if (job.status !== 'completed' && job.status !== 'failed') return;
    const key = job.id;
    if (settledRef.current === key) return;
    settledRef.current = key;
    invalidateVideoAgentQueries(queryClient, projectId);
  }, [job, projectId, queryClient]);

  const isActive = Boolean(
    activeBatch && (activeBatch.status === 'queued' || activeBatch.status === 'running'),
  );

  return {
    job: activeBatch ?? job,
    activeJobId: activeBatch?.id ?? null,
    isWatching: isActive,
    isComplete: job?.status === 'completed',
    isFailed: job?.status === 'failed',
  };
}

/** Tracks the latest video job id from a run mutation and watches it. */
export function useVideoAgentRun(projectId: string) {
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const runAgent = useRunAgent(projectId);
  const runBatch = useRunAgentBatch(projectId);
  const watch = useWatchVideoAgentJob(projectId, activeJobId);

  useEffect(() => {
    const data = runAgent.data?.data ?? runBatch.data?.data;
    if (data && 'async' in data && data.async && data.jobId) {
      setActiveJobId(data.jobId);
    }
  }, [runAgent.data, runBatch.data]);

  return {
    runAgent,
    runBatch,
    watch,
    isBusy: runAgent.isPending || runBatch.isPending || watch.isWatching,
    statusMessage:
      watch.job?.message ?? runBatch.data?.data?.message ?? runAgent.data?.data?.message,
  };
}

export function useRunPipeline(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => aiGenerationService.runPipeline(projectId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.aiGeneration.director(projectId) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.aiGeneration.logs(projectId) });
    },
  });
}

export function useBuildPrompt(projectId: string) {
  return useMutation({
    mutationFn: (payload: PromptBuilderPayload) =>
      aiGenerationService.buildPrompt(projectId, payload),
  });
}

export type AiGenerationMutationError = ApiError;
