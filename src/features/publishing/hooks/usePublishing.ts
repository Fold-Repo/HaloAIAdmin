import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/constants';
import { publishingService } from '@/features/publishing/services/publishing.service';
import type {
  ApiError,
  PublishProjectPayload,
  ScheduleReleasePayload,
  UpdatePublishSettingsPayload,
} from '@/types';

export function usePublishOverview(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.publishing.overview(projectId),
    queryFn: () => publishingService.getOverview(projectId).then((response) => response.data),
    enabled: !!projectId,
  });
}

export function usePublishSettings(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.publishing.settings(projectId),
    queryFn: () => publishingService.getSettings(projectId).then((response) => response.data),
    enabled: !!projectId,
  });
}

export function useReleaseSchedule(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.publishing.schedule(projectId),
    queryFn: () => publishingService.getSchedule(projectId).then((response) => response.data),
    enabled: !!projectId,
  });
}

export function useHlsPackages(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.publishing.hls(projectId),
    queryFn: () => publishingService.getHlsPackages(projectId).then((response) => response.data),
    enabled: !!projectId,
    refetchInterval: 10000,
  });
}

export function usePublishCategories() {
  return useQuery({
    queryKey: QUERY_KEYS.publishing.categories,
    queryFn: () => publishingService.getCategories().then((response) => response.data),
  });
}

export function usePushNotificationPreview(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.publishing.pushPreview(projectId),
    queryFn: () => publishingService.getPushPreview(projectId).then((response) => response.data),
    enabled: !!projectId,
  });
}

export function useUpdatePublishSettings(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdatePublishSettingsPayload) =>
      publishingService.updateSettings(projectId, payload),
    onSuccess: (response) => {
      queryClient.setQueryData(QUERY_KEYS.publishing.settings(projectId), response.data);
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.publishing.overview(projectId) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.publishing.pushPreview(projectId) });
    },
  });
}

export function useScheduleRelease(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ScheduleReleasePayload) =>
      publishingService.scheduleRelease(projectId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.publishing.schedule(projectId) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.publishing.overview(projectId) });
    },
  });
}

export function usePublishProject(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PublishProjectPayload = {}) => publishingService.publish(projectId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.publishing.overview(projectId) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.publishing.settings(projectId) });
    },
  });
}

export type PublishingMutationError = ApiError;
