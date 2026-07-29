export type EpisodeStatus = 'draft' | 'planning' | 'in-production' | 'ready' | 'published';

export type SceneStatus = 'draft' | 'planned' | 'generated' | 'approved';

export type SceneVideo = {
  id: string;
  videoUrl: string;
  modelId?: string;
  durationSec?: number;
  requestId?: string;
  createdAt: string;
  isSelected: boolean;
};

export type Episode = {
  id: string;
  projectId: string;
  number: number;
  title: string;
  synopsis: string;
  cliffhanger: string;
  targetRuntimeSec: number;
  estimatedRuntimeSec: number;
  status: EpisodeStatus;
  progress: number;
  sceneCount: number;
  assembledVideoUrl?: string;
  assembledAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type Scene = {
  id: string;
  episodeId: string;
  projectId: string;
  order: number;
  title: string;
  description: string;
  location?: string;
  characters: string[];
  durationSec: number;
  status: SceneStatus;
  videoUrl?: string;
  videos?: SceneVideo[];
  dialogueSnippet?: string;
};

export type EpisodePlannerSummary = {
  projectId: string;
  totalEpisodes: number;
  completedEpisodes: number;
  totalScenes: number;
  plannedScenes: number;
  totalRuntimeSec: number;
  targetRuntimeSec: number;
  overallProgress: number;
};

export type EpisodeWithScenes = Episode & {
  scenes: Scene[];
};

export type GenerateEpisodesPayload = {
  count: number;
  targetRuntimeSec: number;
  useStoryBible: boolean;
};

export type GenerateCliffhangerPayload = {
  tone?: string;
};

export type UpdateEpisodePayload = {
  title: string;
  synopsis: string;
  cliffhanger: string;
  targetRuntimeSec: number;
};

export type UpsertScenePayload = {
  title: string;
  description: string;
  location?: string;
  characters: string;
  durationSec: number;
};

export type ReorderScenesPayload = {
  sceneIds: string[];
};

export type SelectSceneVideoPayload = {
  videoId: string;
};

export type AssembleEpisodeResult = {
  episodeId: string;
  projectId: string;
  sceneCount: number;
  assembledVideoUrl: string;
  assembledAt: string;
  message: string;
};

export type CliffhangerSuggestion = {
  text: string;
  tone: string;
};
