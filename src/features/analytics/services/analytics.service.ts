import { apiGet, apiPost } from '@/api';
import type {
  AnalyticsOverview,
  ApiResponse,
  CohortAnalysis,
  CompletionMetrics,
  CostMetrics,
  CreatorEarnings,
  ExportReportPayload,
  ExportReportResult,
  GrowthMetrics,
  RetentionMetrics,
  RevenueMetrics,
  WatchTimeMetrics,
} from '@/types';

const BASE = (projectId: string) => `/creator/projects/${projectId}/analytics`;

export const analyticsService = {
  getOverview: (projectId: string) =>
    apiGet<ApiResponse<AnalyticsOverview>>(`${BASE(projectId)}/overview`),

  getRevenue: (projectId: string) =>
    apiGet<ApiResponse<RevenueMetrics>>(`${BASE(projectId)}/revenue`),

  getEarnings: (projectId: string) =>
    apiGet<ApiResponse<CreatorEarnings>>(`${BASE(projectId)}/earnings`),

  getWatchTime: (projectId: string) =>
    apiGet<ApiResponse<WatchTimeMetrics>>(`${BASE(projectId)}/watch-time`),

  getCompletion: (projectId: string) =>
    apiGet<ApiResponse<CompletionMetrics>>(`${BASE(projectId)}/completion`),

  getAiCost: (projectId: string) =>
    apiGet<ApiResponse<CostMetrics>>(`${BASE(projectId)}/ai-cost`),

  getRenderCost: (projectId: string) =>
    apiGet<ApiResponse<CostMetrics>>(`${BASE(projectId)}/render-cost`),

  getGrowth: (projectId: string) =>
    apiGet<ApiResponse<GrowthMetrics>>(`${BASE(projectId)}/growth`),

  getRetention: (projectId: string) =>
    apiGet<ApiResponse<RetentionMetrics>>(`${BASE(projectId)}/retention`),

  getCohorts: (projectId: string) =>
    apiGet<ApiResponse<CohortAnalysis>>(`${BASE(projectId)}/cohorts`),

  exportReport: (projectId: string, payload: ExportReportPayload) =>
    apiPost<ApiResponse<ExportReportResult>, ExportReportPayload>(
      `${BASE(projectId)}/export`,
      payload,
    ),
};
