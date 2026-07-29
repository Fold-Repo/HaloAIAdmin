import { cn } from '@/utils';
import { appConfig } from '@/config';
import type { ProjectStatus } from '@/types';

const STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: 'Draft',
  generating: 'Generating',
  ready: 'Ready',
  rendering: 'Rendering',
  published: 'Published',
  failed: 'Failed',
};

const STATUS_VARIANTS: Record<
  ProjectStatus,
  'secondary' | 'default' | 'success' | 'warning' | 'destructive'
> = {
  draft: 'secondary',
  generating: 'warning',
  ready: 'success',
  rendering: 'warning',
  published: 'success',
  failed: 'destructive',
};

export function getProjectStatusLabel(status: ProjectStatus) {
  return STATUS_LABELS[status];
}

export function getProjectStatusVariant(status: ProjectStatus) {
  return STATUS_VARIANTS[status];
}

export function formatRelativeDate(value: string) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function creatorRoute(path: string, params: Record<string, string>) {
  return Object.entries(params).reduce(
    (resolved, [key, value]) => resolved.replace(`:${key}`, value),
    path,
  );
}

export function cnCreator(...inputs: Parameters<typeof cn>) {
  return cn(...inputs);
}

export function getProjectCoverApiUrl(projectId: string) {
  return `${appConfig.api.baseUrl}/creator/projects/${projectId}/cover-image`;
}

export function getProjectCoverPortraitApiUrl(projectId: string) {
  return `${appConfig.api.baseUrl}/creator/projects/${projectId}/cover-image/portrait`;
}

export function getSeriesCoverApiUrl(seriesId: string) {
  return `${appConfig.api.baseUrl}/creator/series/${seriesId}/cover-image`;
}

export function getSeriesCoverPortraitApiUrl(seriesId: string) {
  return `${appConfig.api.baseUrl}/creator/series/${seriesId}/cover-image/portrait`;
}
