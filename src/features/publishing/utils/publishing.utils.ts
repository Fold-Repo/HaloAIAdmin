import type { PublishingSection } from '@/types';

export const PUBLISHING_SECTIONS: Array<{
  id: PublishingSection;
  label: string;
  description: string;
}> = [
  { id: 'wizard', label: 'Wizard', description: 'Step-by-step publish wizard' },
  { id: 'scheduler', label: 'Scheduler', description: 'Release schedule for episodes' },
  { id: 'hls', label: 'HLS', description: 'HLS packaging status' },
  { id: 'categories', label: 'Categories', description: 'Content category selection' },
  { id: 'tags', label: 'Tags', description: 'Discovery tags and keywords' },
  { id: 'visibility', label: 'Visibility', description: 'Who can see published content' },
  { id: 'monetization', label: 'Monetization', description: 'Premium, ads, and coin unlock' },
  { id: 'notifications', label: 'Notifications', description: 'Push notification preview' },
];

export const PUBLISH_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  ready: 'Ready',
  scheduled: 'Scheduled',
  published: 'Published',
  failed: 'Failed',
};

export const HLS_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  ready: 'Ready',
  failed: 'Failed',
};

export const VISIBILITY_LABELS: Record<string, string> = {
  public: 'Public',
  unlisted: 'Unlisted',
  private: 'Private',
  scheduled: 'Scheduled release',
};

export const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public', description: 'Visible to everyone on the platform' },
  { value: 'unlisted', label: 'Unlisted', description: 'Accessible via direct link only' },
  { value: 'private', label: 'Private', description: 'Only you and collaborators can view' },
  { value: 'scheduled', label: 'Scheduled', description: 'Publish automatically at scheduled time' },
] as const;

export function getPublishingPath(projectId: string, section: PublishingSection = 'wizard') {
  return `/studio/projects/${projectId}/publishing/${section}`;
}

export function isPublishingSection(value: string | undefined): value is PublishingSection {
  return PUBLISHING_SECTIONS.some((section) => section.id === value);
}

export function formatScheduleDate(value: string, timezone: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: timezone,
  }).format(new Date(value));
}
