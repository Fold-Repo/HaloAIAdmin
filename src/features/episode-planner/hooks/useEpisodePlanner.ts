import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/constants';
import { episodePlannerService } from '@/features/episode-planner/services/episode-planner.service';
import type {
  ApiError,
  GenerateCliffhangerPayload,
  GenerateEpisodesPayload,
  ReorderScenesPayload,
  SelectSceneVideoPayload,
  UpdateEpisodePayload,
  UpsertScenePayload,
} from '@/types';

export function useEpisodePlannerSummary(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.episodePlanner.summary(projectId),
    queryFn: () => episodePlannerService.getSummary(projectId).then((response) => response.data),
    enabled: !!projectId,
  });
}

export function useEpisodes(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.episodePlanner.episodes(projectId),
    queryFn: () => episodePlannerService.getEpisodes(projectId).then((response) => response.data),
    enabled: !!projectId,
  });
}

export function useEpisode(
  projectId: string,
  episodeId: string,
  options?: { pollWhileRunning?: boolean },
) {
  return useQuery({
    queryKey: QUERY_KEYS.episodePlanner.episode(projectId, episodeId),
    queryFn: () =>
      episodePlannerService.getEpisode(projectId, episodeId).then((response) => response.data),
    enabled: !!projectId && !!episodeId,
    refetchInterval: options?.pollWhileRunning ? 4000 : false,
  });
}

export function useGenerateEpisodes(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: GenerateEpisodesPayload) =>
      episodePlannerService.generateEpisodes(projectId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.episodePlanner.episodes(projectId),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.episodePlanner.summary(projectId),
      });
    },
  });
}

export function useUpdateEpisode(projectId: string, episodeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateEpisodePayload) =>
      episodePlannerService.updateEpisode(projectId, episodeId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.episodePlanner.episode(projectId, episodeId),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.episodePlanner.episodes(projectId),
      });
    },
  });
}

export function useGenerateCliffhanger(projectId: string, episodeId: string) {
  return useMutation({
    mutationFn: (payload: GenerateCliffhangerPayload) =>
      episodePlannerService.generateCliffhanger(projectId, episodeId, payload),
  });
}

export function useCreateScene(projectId: string, episodeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpsertScenePayload) =>
      episodePlannerService.createScene(projectId, episodeId, payload),
    onSuccess: (response) => {
      queryClient.setQueryData(
        QUERY_KEYS.episodePlanner.episode(projectId, episodeId),
        (current: import('@/types').EpisodeWithScenes | undefined) => {
          if (!current) return current;
          const scenes = [...current.scenes, response.data].sort((a, b) => a.order - b.order);
          return {
            ...current,
            scenes,
            sceneCount: scenes.length,
            estimatedRuntimeSec: scenes.reduce((sum, scene) => sum + scene.durationSec, 0),
          };
        },
      );
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.episodePlanner.summary(projectId),
      });
    },
  });
}

export function useReorderScenes(projectId: string, episodeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReorderScenesPayload) =>
      episodePlannerService.reorderScenes(projectId, episodeId, payload),
    onSuccess: (response) => {
      queryClient.setQueryData(
        QUERY_KEYS.episodePlanner.episode(projectId, episodeId),
        (current: import('@/types').EpisodeWithScenes | undefined) => {
          if (!current) return current;
          return { ...current, scenes: response.data };
        },
      );
    },
  });
}

export function useSelectSceneVideo(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      episodeId,
      sceneId,
      videoId,
    }: SelectSceneVideoPayload & { episodeId: string; sceneId: string }) =>
      episodePlannerService.selectSceneVideo(projectId, episodeId, sceneId, { videoId }),
    onSuccess: (response, variables) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.episodePlanner.episode(projectId, variables.episodeId),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.aiGeneration.scenePreview(projectId),
      });

      queryClient.setQueryData(
        QUERY_KEYS.episodePlanner.episode(projectId, variables.episodeId),
        (current: import('@/types').EpisodeWithScenes | undefined) => {
          if (!current) return current;
          return {
            ...current,
            scenes: current.scenes.map((scene) =>
              scene.id === response.data.id ? response.data : scene,
            ),
          };
        },
      );
    },
  });
}

export function useAssembleEpisode(projectId: string, episodeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => episodePlannerService.assembleEpisode(projectId, episodeId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.episodePlanner.episode(projectId, episodeId),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.episodePlanner.episodes(projectId),
      });
    },
  });
}

export function useDeleteEpisode(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ episodeId, confirmation }: { episodeId: string; confirmation: string }) =>
      episodePlannerService
        .deleteEpisode(projectId, episodeId, confirmation)
        .then((response) => response.data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.episodePlanner.episodes(projectId),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.episodePlanner.summary(projectId),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.episodePlanner.episode(projectId, variables.episodeId),
      });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.creator.project(projectId) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.storyBible.detail(projectId) });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.storyComposer.status(projectId),
      });
    },
  });
}

export type EpisodePlannerMutationError = ApiError;
