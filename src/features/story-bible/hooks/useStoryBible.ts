import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/constants';
import { storyBibleService } from '@/features/story-bible/services/story-bible.service';
import type {
  ApiError,
  ComposeStoryPayload,
  ExpandEpisodesPayload,
  GenerateEpisodeBatchPayload,
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
        void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.episodePlanner.summary(projectId) });
        void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.episodePlanner.episodes(projectId) });
      }
    },
  });
}

export function usePreviewExtractEpisodes(projectId: string) {
  return useMutation({
    mutationFn: (payload?: { content?: string }) =>
      storyBibleService.previewExtractEpisodes(projectId, payload).then((response) => response.data),
  });
}

export function useExtractEpisodes(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload?: { content?: string; mode?: 'merge' | 'replace' }) =>
      storyBibleService.extractEpisodes(projectId, payload).then((response) => response.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.storyBible.detail(projectId) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.episodePlanner.summary(projectId) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.episodePlanner.episodes(projectId) });
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
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.episodePlanner.summary(projectId) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.episodePlanner.episodes(projectId) });
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
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.episodePlanner.summary(projectId) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.episodePlanner.episodes(projectId) });
    },
  });
}

export function useSyncStorySummary(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => storyBibleService.syncStorySummary(projectId).then((response) => response.data),
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
      storyBibleService
        .generateEpisodeBatch(projectId, payload)
        .then((response) => response.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.storyComposer.status(projectId) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.storyBible.detail(projectId) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.episodePlanner.summary(projectId) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.episodePlanner.episodes(projectId) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.creator.project(projectId) });
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
