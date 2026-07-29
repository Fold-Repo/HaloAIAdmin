import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/constants';
import { aiGenerationService } from '@/features/ai-generation/services/ai-generation.service';
import type { ApiError, PromptBuilderPayload, RunAgentBatchPayload, RunAgentPayload } from '@/types';

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
    queryFn: () => aiGenerationService.getAgent(projectId, agentId).then((response) => response.data),
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

export function useRunAgent(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RunAgentPayload) => aiGenerationService.runAgent(projectId, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.aiGeneration.director(projectId) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.aiGeneration.logs(projectId) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.aiGeneration.cost(projectId) });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.aiGeneration.agent(projectId, variables.agentId),
      });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.episodePlanner.episodes(projectId) });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.aiGeneration.scenePreview(projectId),
      });
      if (variables.episodeId) {
        void queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.episodePlanner.episode(projectId, variables.episodeId),
        });
      }
    },
  });
}

export function useRunAgentBatch(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RunAgentBatchPayload) =>
      aiGenerationService.runAgentBatch(projectId, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.aiGeneration.director(projectId) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.aiGeneration.logs(projectId) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.aiGeneration.cost(projectId) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.episodePlanner.episodes(projectId) });
      if (variables.episodeId) {
        void queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.episodePlanner.episode(projectId, variables.episodeId),
        });
      }
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.aiGeneration.scenePreview(projectId),
      });
    },
  });
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
