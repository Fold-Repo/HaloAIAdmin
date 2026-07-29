import type { UserRole } from './auth.types';

export type AdminPortalSection =
  | 'overview'
  | 'users'
  | 'creators'
  | 'moderation'
  | 'ai-usage'
  | 'subscriptions'
  | 'rewarded-ads'
  | 'coins'
  | 'reports'
  | 'audit-logs'
  | 'feature-flags'
  | 'system-health';

export type AdminUserStatus = 'active' | 'suspended' | 'pending';

export type AdminCreatorStatus = 'active' | 'review' | 'suspended';

export type ModerationStatus = 'pending' | 'approved' | 'rejected';

export type SystemHealthLevel = 'healthy' | 'degraded' | 'critical';

export type ServiceStatus = 'up' | 'degraded' | 'down';

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: AdminUserStatus;
  createdAt: string;
  lastActiveAt: string;
};

export type AdminCreator = {
  id: string;
  name: string;
  email: string;
  seriesCount: number;
  subscriberCount: number;
  revenueUsd: number;
  status: AdminCreatorStatus;
  joinedAt: string;
};

export type ModerationItem = {
  id: string;
  contentType: 'episode' | 'project' | 'comment';
  title: string;
  creatorName: string;
  reason: string;
  status: ModerationStatus;
  flaggedAt: string;
};

export type AdminOverview = {
  totalUsers: number;
  totalCreators: number;
  pendingModeration: number;
  aiSpendUsd: number;
  activeSubscriptions: number;
  coinTransactions24h: number;
  systemHealth: SystemHealthLevel;
};

export type AiUsageMetrics = {
  totalTokens: number;
  totalCostUsd: number;
  requests24h: number;
  byAgent: Array<{ agent: string; costUsd: number; requests: number }>;
  series: Array<{ date: string; value: number }>;
};

export type SubscriptionMetrics = {
  active: number;
  churnRate: number;
  mrrUsd: number;
  newSubscriptions30d: number;
  series: Array<{ date: string; value: number }>;
};

export type RewardedAdsMetrics = {
  impressions24h: number;
  completions24h: number;
  revenueUsd: number;
  fillRate: number;
  series: Array<{ date: string; value: number }>;
};

export type CoinEconomyMetrics = {
  coinsInCirculation: number;
  purchases24h: number;
  unlocks24h: number;
  revenueUsd: number;
  topPackages: Array<{ label: string; sales: number; revenueUsd: number }>;
};

export type AdminReport = {
  id: string;
  title: string;
  type: string;
  status: 'ready' | 'generating' | 'failed';
  createdAt: string;
};

export type AuditLogEntry = {
  id: string;
  actor: string;
  action: string;
  resource: string;
  level: 'info' | 'warning' | 'critical';
  createdAt: string;
};

export type FeatureFlag = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  environment: 'production' | 'staging' | 'all';
};

export type SystemHealthStatus = {
  overall: SystemHealthLevel;
  services: Array<{ name: string; status: ServiceStatus; latencyMs: number }>;
};

export type UpdateUserStatusPayload = {
  userId: string;
  status: AdminUserStatus;
};

export type UpdateCreatorStatusPayload = {
  creatorId: string;
  status: AdminCreatorStatus;
};

export type ModerationActionPayload = {
  itemId: string;
  action: 'approve' | 'reject';
};

export type ToggleFeatureFlagPayload = {
  flagId: string;
  enabled: boolean;
};

export type AdminActionResult = {
  success: boolean;
  message: string;
};
