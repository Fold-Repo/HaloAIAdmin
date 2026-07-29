import type { Episode } from './episode-planner.types';

export type ComposerNextStep =
  | 'compose'
  | 'review-bible'
  | 'generate-episodes'
  | 'review-episodes'
  | 'complete-scenes'
  | 'generate-video'
  | 'done';

export type EpisodePlanPreview = {
  number: number;
  title: string;
  actPhase: string;
  generated: boolean;
};

export type ComposerBatchInfo = {
  start: number;
  end: number;
  size: number;
  isFinale: boolean;
};

export type ComposerStatus = {
  projectId: string;
  hasStoryOverview: boolean;
  hasDocument: boolean;
  hasEpisodePlan: boolean;
  plannedEpisodeCount: number;
  generatedEpisodeCount: number;
  generatedFromPlan: number;
  pendingEpisodeCount: number;
  episodeCount: number;
  scenesTotal: number;
  scenesReady: number;
  videoUnlocked: boolean;
  summarySyncedAt?: string;
  nextStep: ComposerNextStep;
  nextBatch: ComposerBatchInfo | null;
  episodePlanPreview: EpisodePlanPreview[];
  overview: {
    logline: string;
    synopsis: string;
    tone: string;
  } | null;
};

export type ComposeStoryPayload = {
  premise: string;
  episodeCount: number;
  episodeLengthSec?: number;
  seriesContext?: string;
  mode?: 'replace' | 'merge';
};

export type ComposeStoryResult = {
  overview: ComposerStatus['overview'] & {
    themes?: string[];
    targetAudience?: string;
  };
  plannedEpisodes: number;
  episodesCreated: number;
  scenesCreated: number;
  batch: ComposerBatchInfo;
  episodes: Episode[];
  composerStatus: ComposerStatus;
};

export type GenerateEpisodeBatchPayload = {
  count?: number;
  forceFinale?: boolean;
};

export type GenerateEpisodeBatchResult = {
  episodesCreated: number;
  scenesCreated: number;
  batch: ComposerBatchInfo;
  episodes: Episode[];
  composerStatus: ComposerStatus;
};

export type ExpandEpisodesPayload = {
  count: number;
  direction?: string;
  finale?: boolean;
};

export type ExpandEpisodesResult = {
  added: number;
  batch: ComposerBatchInfo;
  episodes: Episode[];
  composerStatus: ComposerStatus;
};

export type SyncStorySummaryResult = {
  overview: NonNullable<ComposerStatus['overview']>;
  composerStatus: ComposerStatus;
};
