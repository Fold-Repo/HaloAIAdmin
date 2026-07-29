export type PublishingSection =
  | 'wizard'
  | 'scheduler'
  | 'hls'
  | 'categories'
  | 'tags'
  | 'visibility'
  | 'monetization'
  | 'notifications';

export type PublishVisibility = 'public' | 'unlisted' | 'private' | 'scheduled';

export type HlsPackagingStatus = 'pending' | 'processing' | 'ready' | 'failed';

export type PublishStatus = 'draft' | 'ready' | 'scheduled' | 'published' | 'failed';

export type ReleaseScheduleStatus = 'scheduled' | 'published' | 'cancelled';

export type PublishSettings = {
  projectId: string;
  visibility: PublishVisibility;
  categories: string[];
  tags: string[];
  isPremium: boolean;
  rewardedAdsEnabled: boolean;
  coinUnlockEnabled: boolean;
  coinPrice: number;
  scheduledAt?: string;
};

export type ReleaseScheduleItem = {
  id: string;
  projectId: string;
  episodeId: string;
  episodeTitle: string;
  scheduledAt: string;
  timezone: string;
  status: ReleaseScheduleStatus;
};

export type HlsPackage = {
  episodeId: string;
  episodeTitle: string;
  status: HlsPackagingStatus;
  progress: number;
  manifestUrl?: string;
  variants: string[];
  errorMessage?: string;
};

export type PublishWizardStep = {
  id: string;
  label: string;
  completed: boolean;
  required: boolean;
};

export type PublishOverview = {
  projectId: string;
  publishStatus: PublishStatus;
  overallProgress: number;
  steps: PublishWizardStep[];
  readyToPublish: boolean;
};

export type PushNotificationPreview = {
  title: string;
  body: string;
  imageUrl?: string;
  deepLink: string;
  audience: string;
};

export type UpdatePublishSettingsPayload = Partial<
  Pick<
    PublishSettings,
    | 'visibility'
    | 'categories'
    | 'tags'
    | 'isPremium'
    | 'rewardedAdsEnabled'
    | 'coinUnlockEnabled'
    | 'coinPrice'
    | 'scheduledAt'
  >
>;

export type ScheduleReleasePayload = {
  episodeId: string;
  scheduledAt: string;
  timezone: string;
};

export type PublishProjectPayload = {
  episodeIds?: string[];
};

export type PublishActionResult = {
  status: PublishStatus;
  message: string;
  publishedAt?: string;
};

export type CategoryOption = {
  id: string;
  label: string;
  description: string;
};
