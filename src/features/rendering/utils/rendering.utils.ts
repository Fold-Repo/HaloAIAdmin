import type { RenderingSection } from '@/types';

export const RENDERING_SECTIONS: Array<{
  id: RenderingSection;
  label: string;
  description: string;
}> = [
  { id: 'progress', label: 'Progress', description: 'Rendering progress dashboard' },
  { id: 'queue', label: 'Render Queue', description: 'Active and pending render jobs' },
  { id: 'workers', label: 'Workers', description: 'FFmpeg worker pool status' },
  { id: 'retry', label: 'Retry Queue', description: 'Failed jobs awaiting retry' },
  { id: 'gpu', label: 'GPU', description: 'GPU node utilization and health' },
  { id: 'ffmpeg', label: 'FFmpeg', description: 'Live FFmpeg job status and logs' },
  { id: 'history', label: 'History', description: 'Completed and failed job history' },
  { id: 'monitoring', label: 'Monitoring', description: 'Queue depth and throughput metrics' },
];

export const RENDER_JOB_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  queued: 'Queued',
  processing: 'Processing',
  encoding: 'Encoding',
  completed: 'Completed',
  failed: 'Failed',
  retrying: 'Retrying',
};

export const QUEUE_HEALTH_LABELS: Record<string, string> = {
  healthy: 'Healthy',
  degraded: 'Degraded',
  critical: 'Critical',
};

export const WORKER_STATUS_LABELS: Record<string, string> = {
  online: 'Online',
  offline: 'Offline',
  busy: 'Busy',
  draining: 'Draining',
};

export const GPU_STATUS_LABELS: Record<string, string> = {
  available: 'Available',
  busy: 'Busy',
  overheated: 'Overheated',
  offline: 'Offline',
};

export function getRenderingPath(projectId: string, section: RenderingSection = 'progress') {
  return `/studio/projects/${projectId}/rendering/${section}`;
}

export function isRenderingSection(value: string | undefined): value is RenderingSection {
  return RENDERING_SECTIONS.some((section) => section.id === value);
}

export function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs.toString().padStart(2, '0')}s`;
}

export function formatRenderTime(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}
