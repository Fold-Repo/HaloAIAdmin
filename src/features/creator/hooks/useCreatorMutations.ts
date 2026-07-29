import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { QUERY_KEYS } from '@/constants';
import { creatorService } from '@/features/creator/services/creator.service';
import { getStoryComposerPath } from '@/features/story-bible/utils/story-composer.utils';
import type { ApiError, CreateProjectPayload, CreateSeasonPayload, CreateSeriesPayload } from '@/types';

import type { ProjectWizardValues } from '../schemas/creator.schemas';

export function useCreateProject() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: ProjectWizardValues) => {
      const payload: CreateProjectPayload = {
        title: values.title,
        description: values.premise.slice(0, 500),
        prompt: values.premise,
        genre: values.genre,
        targetFormat: values.targetFormat,
        episodeLength: values.episodeLength,
        episodeCount: values.episodeCount,
        seriesId: values.assignmentMode === 'existing' ? values.seriesId : undefined,
        seasonId: values.assignmentMode === 'existing' ? values.seasonId : undefined,
        createNewSeries: values.assignmentMode === 'new-series',
        newSeriesTitle: values.newSeriesTitle,
        newSeasonTitle: values.newSeasonTitle,
      };
      return creatorService.createProject(payload);
    },
    onSuccess: (response, values) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.creator.projects });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.creator.dashboard });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.creator.series });
      navigate(getStoryComposerPath(response.data.id), {
        state: {
          autoCompose: true,
          episodeCount: values.episodeCount,
          premise: values.premise,
        },
      });
    },
  });
}

export function useCreateSeries() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSeriesPayload) => creatorService.createSeries(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.creator.series });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.creator.dashboard });
    },
  });
}

export function useCreateSeason(seriesId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<CreateSeasonPayload, 'seriesId'>) =>
      creatorService.createSeason({ ...payload, seriesId }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.creator.seasons(seriesId) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.creator.seriesDetail(seriesId) });
    },
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      creatorService.markNotificationRead(notificationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.creator.notifications });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => creatorService.markAllNotificationsRead(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.creator.notifications });
    },
  });
}

export function useGenerateProjectCover(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (regenerate?: boolean) =>
      creatorService.generateProjectCover(projectId, { regenerate }).then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.creator.project(projectId) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.creator.projects });
    },
  });
}

export function useGenerateSeriesCover(seriesId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (regenerate?: boolean) =>
      creatorService.generateSeriesCover(seriesId, { regenerate }).then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.creator.seriesDetail(seriesId) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.creator.series });
    },
  });
}

export type CreatorMutationError = ApiError;
