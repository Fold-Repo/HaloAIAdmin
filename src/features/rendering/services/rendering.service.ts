import { apiGet, apiPost } from '@/api';
import type {
  ApiResponse,
  CancelJobPayload,
  FfmpegJobDetail,
  GpuNode,
  JobActionResult,
  QueueMetrics,
  RenderJob,
  RenderingOverview,
  RenderWorker,
  RetryJobPayload,
} from '@/types';

const BASE = (projectId: string) => `/creator/projects/${projectId}/rendering`;

export const renderingService = {
  getOverview: (projectId: string) =>
    apiGet<ApiResponse<RenderingOverview>>(`${BASE(projectId)}/overview`),

  getQueue: (projectId: string) =>
    apiGet<ApiResponse<RenderJob[]>>(`${BASE(projectId)}/queue`),

  getRetryQueue: (projectId: string) =>
    apiGet<ApiResponse<RenderJob[]>>(`${BASE(projectId)}/retry-queue`),

  getWorkers: (projectId: string) =>
    apiGet<ApiResponse<RenderWorker[]>>(`${BASE(projectId)}/workers`),

  getGpus: (projectId: string) =>
    apiGet<ApiResponse<GpuNode[]>>(`${BASE(projectId)}/gpu`),

  getFfmpegJobs: (projectId: string) =>
    apiGet<ApiResponse<FfmpegJobDetail[]>>(`${BASE(projectId)}/ffmpeg`),

  getHistory: (projectId: string) =>
    apiGet<ApiResponse<RenderJob[]>>(`${BASE(projectId)}/history`),

  getMonitoring: (projectId: string) =>
    apiGet<ApiResponse<QueueMetrics>>(`${BASE(projectId)}/monitoring`),

  retryJob: (projectId: string, payload: RetryJobPayload) =>
    apiPost<ApiResponse<JobActionResult>, RetryJobPayload>(
      `${BASE(projectId)}/retry`,
      payload,
    ),

  cancelJob: (projectId: string, payload: CancelJobPayload) =>
    apiPost<ApiResponse<JobActionResult>, CancelJobPayload>(
      `${BASE(projectId)}/cancel`,
      payload,
    ),

  getJob: (projectId: string, jobId: string) =>
    apiGet<ApiResponse<RenderJob>>(`${BASE(projectId)}/jobs/${jobId}`),
};
