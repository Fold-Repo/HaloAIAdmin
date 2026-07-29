import { apiGet, apiPost, apiPut } from '@/api';
import type {
  AdminActionResult,
  AdminCreator,
  AdminOverview,
  AdminReport,
  AdminUser,
  AiUsageMetrics,
  ApiResponse,
  AuditLogEntry,
  CoinEconomyMetrics,
  FeatureFlag,
  ModerationActionPayload,
  ModerationItem,
  RewardedAdsMetrics,
  SubscriptionMetrics,
  SystemHealthStatus,
  ToggleFeatureFlagPayload,
  UpdateCreatorStatusPayload,
  UpdateUserStatusPayload,
} from '@/types';

const BASE = '/admin';

export const adminService = {
  getOverview: () => apiGet<ApiResponse<AdminOverview>>(`${BASE}/overview`),

  getUsers: () => apiGet<ApiResponse<AdminUser[]>>(`${BASE}/users`),

  updateUserStatus: (payload: UpdateUserStatusPayload) =>
    apiPut<ApiResponse<AdminActionResult>, UpdateUserStatusPayload>(
      `${BASE}/users/status`,
      payload,
    ),

  getCreators: () => apiGet<ApiResponse<AdminCreator[]>>(`${BASE}/creators`),

  updateCreatorStatus: (payload: UpdateCreatorStatusPayload) =>
    apiPut<ApiResponse<AdminActionResult>, UpdateCreatorStatusPayload>(
      `${BASE}/creators/status`,
      payload,
    ),

  getModerationQueue: () => apiGet<ApiResponse<ModerationItem[]>>(`${BASE}/moderation`),

  moderateItem: (payload: ModerationActionPayload) =>
    apiPost<ApiResponse<AdminActionResult>, ModerationActionPayload>(
      `${BASE}/moderation/action`,
      payload,
    ),

  getAiUsage: () => apiGet<ApiResponse<AiUsageMetrics>>(`${BASE}/ai-usage`),

  getSubscriptions: () => apiGet<ApiResponse<SubscriptionMetrics>>(`${BASE}/subscriptions`),

  getRewardedAds: () => apiGet<ApiResponse<RewardedAdsMetrics>>(`${BASE}/rewarded-ads`),

  getCoinEconomy: () => apiGet<ApiResponse<CoinEconomyMetrics>>(`${BASE}/coins`),

  getReports: () => apiGet<ApiResponse<AdminReport[]>>(`${BASE}/reports`),

  getAuditLogs: () => apiGet<ApiResponse<AuditLogEntry[]>>(`${BASE}/audit-logs`),

  getFeatureFlags: () => apiGet<ApiResponse<FeatureFlag[]>>(`${BASE}/feature-flags`),

  toggleFeatureFlag: (payload: ToggleFeatureFlagPayload) =>
    apiPut<ApiResponse<AdminActionResult>, ToggleFeatureFlagPayload>(
      `${BASE}/feature-flags`,
      payload,
    ),

  getSystemHealth: () => apiGet<ApiResponse<SystemHealthStatus>>(`${BASE}/system-health`),
};
