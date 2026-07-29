import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/constants';
import { useAuthQueryEnabled } from '@/features/authentication/hooks/useAuthQueryEnabled';
import { creatorService } from '@/features/creator/services/creator.service';

export function useDashboardStats() {
  const enabled = useAuthQueryEnabled();

  return useQuery({
    queryKey: QUERY_KEYS.creator.dashboard,
    queryFn: () => creatorService.getDashboardStats().then((response) => response.data),
    enabled,
    staleTime: 30_000,
    refetchOnMount: 'always',
  });
}

export function useProjects() {
  const enabled = useAuthQueryEnabled();

  return useQuery({
    queryKey: QUERY_KEYS.creator.projects,
    queryFn: () => creatorService.getProjects().then((response) => response.data),
    enabled,
    staleTime: 30_000,
    refetchOnMount: 'always',
  });
}

export function useProject(projectId: string) {
  const enabled = useAuthQueryEnabled();

  return useQuery({
    queryKey: QUERY_KEYS.creator.project(projectId),
    queryFn: () => creatorService.getProject(projectId).then((response) => response.data),
    enabled: enabled && !!projectId,
  });
}

export function useSeriesList() {
  const enabled = useAuthQueryEnabled();

  return useQuery({
    queryKey: QUERY_KEYS.creator.series,
    queryFn: () => creatorService.getSeries().then((response) => response.data),
    enabled,
  });
}

export function useSeries(seriesId: string) {
  const enabled = useAuthQueryEnabled();

  return useQuery({
    queryKey: QUERY_KEYS.creator.seriesDetail(seriesId),
    queryFn: () => creatorService.getSeriesById(seriesId).then((response) => response.data),
    enabled: enabled && !!seriesId,
  });
}

export function useSeasons(seriesId: string) {
  const enabled = useAuthQueryEnabled();

  return useQuery({
    queryKey: QUERY_KEYS.creator.seasons(seriesId),
    queryFn: () => creatorService.getSeasons(seriesId).then((response) => response.data),
    enabled: enabled && !!seriesId,
  });
}

export function useAiJobs() {
  const enabled = useAuthQueryEnabled();

  return useQuery({
    queryKey: QUERY_KEYS.creator.jobs,
    queryFn: () => creatorService.getAiJobs().then((response) => response.data),
    enabled,
    refetchInterval: enabled ? 15_000 : false,
    staleTime: 10_000,
  });
}

export function useNotifications() {
  const enabled = useAuthQueryEnabled();

  return useQuery({
    queryKey: QUERY_KEYS.creator.notifications,
    queryFn: () => creatorService.getNotifications().then((response) => response.data),
    enabled,
    refetchInterval: enabled ? 30_000 : false,
  });
}
