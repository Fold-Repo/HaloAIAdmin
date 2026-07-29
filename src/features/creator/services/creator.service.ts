import { apiDelete, apiGet, apiPatch, apiPost } from '@/api';
import { aiRequestConfig } from '@/api/request-timeouts';
import type {
  AiJob,
  ApiResponse,
  CreateProjectPayload,
  CreateSeasonPayload,
  CreateSeriesPayload,
  CreatorDashboardStats,
  CreatorNotification,
  CreatorProject,
  GenerateCoverResult,
  Season,
  Series,
  UpdateSeasonPayload,
  UpdateSeriesPayload,
} from '@/types';

const CREATOR_BASE = '/creator';

export const creatorService = {
  getDashboardStats: () =>
    apiGet<ApiResponse<CreatorDashboardStats>>(`${CREATOR_BASE}/dashboard/stats`),

  getProjects: () => apiGet<ApiResponse<CreatorProject[]>>(`${CREATOR_BASE}/projects`),

  getProject: (projectId: string) =>
    apiGet<ApiResponse<CreatorProject>>(`${CREATOR_BASE}/projects/${projectId}`),

  createProject: (payload: CreateProjectPayload) =>
    apiPost<ApiResponse<CreatorProject>, CreateProjectPayload>(
      `${CREATOR_BASE}/projects`,
      payload,
    ),

  generateProjectCover: (projectId: string, payload?: { regenerate?: boolean }) =>
    apiPost<ApiResponse<GenerateCoverResult>, { regenerate?: boolean }>(
      `${CREATOR_BASE}/projects/${projectId}/generate-cover`,
      payload ?? {},
      aiRequestConfig,
    ),

  generateSeriesCover: (seriesId: string, payload?: { regenerate?: boolean }) =>
    apiPost<ApiResponse<GenerateCoverResult>, { regenerate?: boolean }>(
      `${CREATOR_BASE}/series/${seriesId}/generate-cover`,
      payload ?? {},
      aiRequestConfig,
    ),

  getSeries: () => apiGet<ApiResponse<Series[]>>(`${CREATOR_BASE}/series`),

  getSeriesById: (seriesId: string) =>
    apiGet<ApiResponse<Series>>(`${CREATOR_BASE}/series/${seriesId}`),

  createSeries: (payload: CreateSeriesPayload) =>
    apiPost<ApiResponse<Series>, CreateSeriesPayload>(`${CREATOR_BASE}/series`, payload),

  updateSeries: (seriesId: string, payload: UpdateSeriesPayload) =>
    apiPatch<ApiResponse<Series>, UpdateSeriesPayload>(
      `${CREATOR_BASE}/series/${seriesId}`,
      payload,
    ),

  deleteSeries: (seriesId: string) =>
    apiDelete<ApiResponse<null>>(`${CREATOR_BASE}/series/${seriesId}`),

  getSeasons: (seriesId: string) =>
    apiGet<ApiResponse<Season[]>>(`${CREATOR_BASE}/series/${seriesId}/seasons`),

  createSeason: (payload: CreateSeasonPayload) =>
    apiPost<ApiResponse<Season>, CreateSeasonPayload>(
      `${CREATOR_BASE}/series/${payload.seriesId}/seasons`,
      payload,
    ),

  updateSeason: (seriesId: string, seasonId: string, payload: UpdateSeasonPayload) =>
    apiPatch<ApiResponse<Season>, UpdateSeasonPayload>(
      `${CREATOR_BASE}/series/${seriesId}/seasons/${seasonId}`,
      payload,
    ),

  getAiJobs: () => apiGet<ApiResponse<AiJob[]>>(`${CREATOR_BASE}/jobs`),

  getNotifications: () =>
    apiGet<ApiResponse<CreatorNotification[]>>(`${CREATOR_BASE}/notifications`),

  markNotificationRead: (notificationId: string) =>
    apiPatch<ApiResponse<CreatorNotification>>(
      `${CREATOR_BASE}/notifications/${notificationId}/read`,
    ),

  markAllNotificationsRead: () =>
    apiPost<ApiResponse<null>>(`${CREATOR_BASE}/notifications/read-all`),
};
