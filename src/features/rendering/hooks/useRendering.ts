import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/constants';
import { renderingService } from '@/features/rendering/services/rendering.service';
import type { ApiError, CancelJobPayload, RetryJobPayload } from '@/types';

export function useRenderingOverview(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.rendering.overview(projectId),
    queryFn: () => renderingService.getOverview(projectId).then((response) => response.data),
    enabled: !!projectId,
    refetchInterval: 10000,
  });
}

export function useRenderQueue(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.rendering.queue(projectId),
    queryFn: () => renderingService.getQueue(projectId).then((response) => response.data),
    enabled: !!projectId,
    refetchInterval: 8000,
  });
}

export function useRetryQueue(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.rendering.retryQueue(projectId),
    queryFn: () => renderingService.getRetryQueue(projectId).then((response) => response.data),
    enabled: !!projectId,
    refetchInterval: 10000,
  });
}

export function useRenderWorkers(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.rendering.workers(projectId),
    queryFn: () => renderingService.getWorkers(projectId).then((response) => response.data),
    enabled: !!projectId,
    refetchInterval: 15000,
  });
}

export function useGpuStatus(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.rendering.gpu(projectId),
    queryFn: () => renderingService.getGpus(projectId).then((response) => response.data),
    enabled: !!projectId,
    refetchInterval: 12000,
  });
}

export function useFfmpegJobs(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.rendering.ffmpeg(projectId),
    queryFn: () => renderingService.getFfmpegJobs(projectId).then((response) => response.data),
    enabled: !!projectId,
    refetchInterval: 5000,
  });
}

export function useJobHistory(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.rendering.history(projectId),
    queryFn: () => renderingService.getHistory(projectId).then((response) => response.data),
    enabled: !!projectId,
  });
}

export function useQueueMonitoring(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.rendering.monitoring(projectId),
    queryFn: () => renderingService.getMonitoring(projectId).then((response) => response.data),
    enabled: !!projectId,
    refetchInterval: 15000,
  });
}

export function useRetryRenderJob(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RetryJobPayload) => renderingService.retryJob(projectId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.rendering.queue(projectId) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.rendering.retryQueue(projectId) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.rendering.overview(projectId) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.rendering.history(projectId) });
    },
  });
}

export function useCancelRenderJob(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CancelJobPayload) => renderingService.cancelJob(projectId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.rendering.queue(projectId) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.rendering.overview(projectId) });
    },
  });
}

export type RenderingMutationError = ApiError;
