export type ProjectStatus = 'draft' | 'generating' | 'ready' | 'rendering' | 'published' | 'failed';

export type SeriesStatus = 'active' | 'archived';

export type SeasonStatus = 'planning' | 'in-production' | 'complete';

export type AiJobType = 'script' | 'character' | 'video' | 'voice' | 'subtitle' | 'render';

export type AiJobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export type ProjectCreationMode = 'ai_generated' | 'manual_upload';

export type EpisodeSourceType = 'ai_assembled' | 'manual_upload';

export type CreatorProject = {
  id: string;
  title: string;
  description: string;
  prompt: string;
  status: ProjectStatus;
  creationMode?: ProjectCreationMode;
  seriesId?: string;
  seriesTitle?: string;
  seasonId?: string;
  seasonTitle?: string;
  thumbnailUrl?: string;
  thumbnailPortraitUrl?: string;
  episodeCount: number;
  episodeLength: number;
  progress: number;
  createdAt: string;
  updatedAt: string;
};

export type Series = {
  id: string;
  title: string;
  description: string;
  genre: string;
  status: SeriesStatus;
  seasonCount: number;
  projectCount: number;
  coverUrl?: string;
  coverPortraitUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type Season = {
  id: string;
  seriesId: string;
  title: string;
  number: number;
  description?: string;
  episodeCount: number;
  status: SeasonStatus;
  createdAt: string;
};

export type AiJob = {
  id: string;
  projectId: string;
  projectTitle: string;
  type: AiJobType;
  status: AiJobStatus;
  progress: number;
  message?: string;
  startedAt?: string;
  completedAt?: string;
};

export type CreatorNotification = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  link?: string;
};

export type CreatorDashboardStats = {
  totalProjects: number;
  activeJobs: number;
  publishedEpisodes: number;
  seriesCount: number;
};

export type CreateProjectPayload = {
  title: string;
  description: string;
  prompt: string;
  genre: string;
  targetFormat: 'vertical-short' | 'vertical-series' | 'horizontal';
  episodeLength: number;
  episodeCount: number;
  creationMode?: ProjectCreationMode;
  seriesId?: string;
  seasonId?: string;
  createNewSeries?: boolean;
  newSeriesTitle?: string;
  newSeasonTitle?: string;
};

export type GenerateCoverResult = {
  coverUrl: string;
  coverPortraitUrl: string;
  provider: 'xai';
  model: string;
  reused: boolean;
};

export type CreateSeriesPayload = {
  title: string;
  description: string;
  genre: string;
};

export type CreateSeasonPayload = {
  seriesId: string;
  title: string;
  number: number;
  description?: string;
};

export type UpdateSeriesPayload = Partial<CreateSeriesPayload> & { status?: SeriesStatus };

export type UpdateSeasonPayload = Partial<Omit<CreateSeasonPayload, 'seriesId'>> & {
  status?: SeasonStatus;
};
