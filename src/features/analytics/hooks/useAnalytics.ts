import { useMutation, useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/constants';
import { analyticsService } from '@/features/analytics/services/analytics.service';
import type { ApiError, ExportReportPayload } from '@/types';

export function useAnalyticsOverview(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.analytics.overview(projectId),
    queryFn: () => analyticsService.getOverview(projectId).then((response) => response.data),
    enabled: !!projectId,
  });
}

export function useRevenueMetrics(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.analytics.revenue(projectId),
    queryFn: () => analyticsService.getRevenue(projectId).then((response) => response.data),
    enabled: !!projectId,
  });
}

export function useCreatorEarnings(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.analytics.earnings(projectId),
    queryFn: () => analyticsService.getEarnings(projectId).then((response) => response.data),
    enabled: !!projectId,
  });
}

export function useWatchTimeMetrics(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.analytics.watchTime(projectId),
    queryFn: () => analyticsService.getWatchTime(projectId).then((response) => response.data),
    enabled: !!projectId,
  });
}

export function useCompletionMetrics(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.analytics.completion(projectId),
    queryFn: () => analyticsService.getCompletion(projectId).then((response) => response.data),
    enabled: !!projectId,
  });
}

export function useAiCostMetrics(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.analytics.aiCost(projectId),
    queryFn: () => analyticsService.getAiCost(projectId).then((response) => response.data),
    enabled: !!projectId,
  });
}

export function useRenderCostMetrics(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.analytics.renderCost(projectId),
    queryFn: () => analyticsService.getRenderCost(projectId).then((response) => response.data),
    enabled: !!projectId,
  });
}

export function useGrowthMetrics(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.analytics.growth(projectId),
    queryFn: () => analyticsService.getGrowth(projectId).then((response) => response.data),
    enabled: !!projectId,
  });
}

export function useRetentionMetrics(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.analytics.retention(projectId),
    queryFn: () => analyticsService.getRetention(projectId).then((response) => response.data),
    enabled: !!projectId,
  });
}

export function useCohortAnalysis(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.analytics.cohorts(projectId),
    queryFn: () => analyticsService.getCohorts(projectId).then((response) => response.data),
    enabled: !!projectId,
  });
}

export function useExportReport(projectId: string) {
  return useMutation({
    mutationFn: (payload: ExportReportPayload) => analyticsService.exportReport(projectId, payload),
  });
}

export type AnalyticsMutationError = ApiError;
