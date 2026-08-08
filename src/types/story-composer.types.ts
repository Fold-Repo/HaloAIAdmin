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
  /** Episodes to generate right after planning (1–5). Default 1. */
  firstBatchCount?: number;
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

/** Immediate response when generation runs as a background AiJob (HTTP 202). */
export type GenerateEpisodeBatchAccepted = {
  async: true;
  jobId: string;
  status: 'queued' | 'running' | string;
  message: string;
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

export type SyncEpisodeCountPayload = {
  targetCount: number;
  direction?: string;
  /** Episodes per AI call (1–5). Default 1. */
  batchSize?: number;
  /** Required to expand past the current season plan. */
  confirmExpand?: boolean;
};

export type SyncEpisodeCountResult = {
  targetCount: number;
  availableEpisodes: number;
  remaining: number;
  complete: boolean;
  alreadyComplete?: boolean;
  needsExpandConsent?: boolean;
  plannedEpisodeCount?: number;
  message: string;
  composerStatus?: ComposerStatus;
  /** When true, Claude work runs in the background — poll Jobs / Notifications. */
  async?: true;
  jobId?: string;
};

export type SyncStorySummaryResult = {
  overview: NonNullable<ComposerStatus['overview']>;
  composerStatus: ComposerStatus;
};
