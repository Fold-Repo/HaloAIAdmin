import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/constants';
import { adminService } from '@/features/admin/services/admin.service';
import type {
  ApiError,
  ModerationActionPayload,
  ToggleFeatureFlagPayload,
  UpdateCreatorStatusPayload,
  UpdateUserStatusPayload,
} from '@/types';

export function useAdminOverview() {
  return useQuery({
    queryKey: QUERY_KEYS.adminPortal.overview,
    queryFn: () => adminService.getOverview().then((response) => response.data),
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: QUERY_KEYS.adminPortal.users,
    queryFn: () => adminService.getUsers().then((response) => response.data),
  });
}

export function useAdminCreators() {
  return useQuery({
    queryKey: QUERY_KEYS.adminPortal.creators,
    queryFn: () => adminService.getCreators().then((response) => response.data),
  });
}

export function useModerationQueue() {
  return useQuery({
    queryKey: QUERY_KEYS.adminPortal.moderation,
    queryFn: () => adminService.getModerationQueue().then((response) => response.data),
    refetchInterval: 15000,
  });
}

export function useAdminAiUsage() {
  return useQuery({
    queryKey: QUERY_KEYS.adminPortal.aiUsage,
    queryFn: () => adminService.getAiUsage().then((response) => response.data),
  });
}

export function useAdminSubscriptions() {
  return useQuery({
    queryKey: QUERY_KEYS.adminPortal.subscriptions,
    queryFn: () => adminService.getSubscriptions().then((response) => response.data),
  });
}

export function useAdminRewardedAds() {
  return useQuery({
    queryKey: QUERY_KEYS.adminPortal.rewardedAds,
    queryFn: () => adminService.getRewardedAds().then((response) => response.data),
  });
}

export function useAdminCoinEconomy() {
  return useQuery({
    queryKey: QUERY_KEYS.adminPortal.coins,
    queryFn: () => adminService.getCoinEconomy().then((response) => response.data),
  });
}

export function useAdminReports() {
  return useQuery({
    queryKey: QUERY_KEYS.adminPortal.reports,
    queryFn: () => adminService.getReports().then((response) => response.data),
  });
}

export function useAdminAuditLogs() {
  return useQuery({
    queryKey: QUERY_KEYS.adminPortal.auditLogs,
    queryFn: () => adminService.getAuditLogs().then((response) => response.data),
    refetchInterval: 20000,
  });
}

export function useAdminFeatureFlags() {
  return useQuery({
    queryKey: QUERY_KEYS.adminPortal.featureFlags,
    queryFn: () => adminService.getFeatureFlags().then((response) => response.data),
  });
}

export function useAdminSystemHealth() {
  return useQuery({
    queryKey: QUERY_KEYS.adminPortal.systemHealth,
    queryFn: () => adminService.getSystemHealth().then((response) => response.data),
    refetchInterval: 10000,
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateUserStatusPayload) => adminService.updateUserStatus(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminPortal.users });
    },
  });
}

export function useUpdateCreatorStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateCreatorStatusPayload) => adminService.updateCreatorStatus(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminPortal.creators });
    },
  });
}

export function useModerationAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ModerationActionPayload) => adminService.moderateItem(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminPortal.moderation });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminPortal.overview });
    },
  });
}

export function useToggleFeatureFlag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ToggleFeatureFlagPayload) => adminService.toggleFeatureFlag(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminPortal.featureFlags });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminPortal.auditLogs });
    },
  });
}

export type AdminMutationError = ApiError;
