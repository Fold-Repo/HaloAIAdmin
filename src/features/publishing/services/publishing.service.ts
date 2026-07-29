import { apiGet, apiPost, apiPut } from '@/api';
import type {
  ApiResponse,
  CategoryOption,
  HlsPackage,
  PublishActionResult,
  PublishOverview,
  PublishProjectPayload,
  PublishSettings,
  PushNotificationPreview,
  ReleaseScheduleItem,
  ScheduleReleasePayload,
  UpdatePublishSettingsPayload,
} from '@/types';

const BASE = (projectId: string) => `/creator/projects/${projectId}/publishing`;

export const publishingService = {
  getOverview: (projectId: string) =>
    apiGet<ApiResponse<PublishOverview>>(`${BASE(projectId)}/overview`),

  getSettings: (projectId: string) =>
    apiGet<ApiResponse<PublishSettings>>(`${BASE(projectId)}/settings`),

  updateSettings: (projectId: string, payload: UpdatePublishSettingsPayload) =>
    apiPut<ApiResponse<PublishSettings>, UpdatePublishSettingsPayload>(
      `${BASE(projectId)}/settings`,
      payload,
    ),

  getSchedule: (projectId: string) =>
    apiGet<ApiResponse<ReleaseScheduleItem[]>>(`${BASE(projectId)}/schedule`),

  scheduleRelease: (projectId: string, payload: ScheduleReleasePayload) =>
    apiPost<ApiResponse<ReleaseScheduleItem>, ScheduleReleasePayload>(
      `${BASE(projectId)}/schedule`,
      payload,
    ),

  getHlsPackages: (projectId: string) =>
    apiGet<ApiResponse<HlsPackage[]>>(`${BASE(projectId)}/hls`),

  getCategories: () => apiGet<ApiResponse<CategoryOption[]>>('/creator/publishing/categories'),

  getPushPreview: (projectId: string) =>
    apiGet<ApiResponse<PushNotificationPreview>>(`${BASE(projectId)}/notifications/preview`),

  publish: (projectId: string, payload: PublishProjectPayload = {}) =>
    apiPost<ApiResponse<PublishActionResult>, PublishProjectPayload>(
      `${BASE(projectId)}/publish`,
      payload,
    ),
};
