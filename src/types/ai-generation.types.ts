export type AiAgentId =
  | 'story-planner'
  | 'script'
  | 'character'
  | 'video'
  | 'voice'
  | 'subtitle'
  | 'music';

export type AiGenerationSection =
  | 'dashboard'
  | 'story-planner'
  | 'script'
  | 'character'
  | 'video'
  | 'voice'
  | 'subtitle'
  | 'music'
  | 'prompt-builder'
  | 'cost'
  | 'logs';

export type AiAgentStatus = 'idle' | 'queued' | 'running' | 'completed' | 'failed';

export type AiLogLevel = 'info' | 'success' | 'warning' | 'error';

export type AiAgent = {
  id: AiAgentId;
  name: string;
  description: string;
  model: string;
  provider: string;
  status: AiAgentStatus;
  progress: number;
  lastRunAt?: string;
  estimatedCostUsd: number;
  outputPreview?: string;
};

export type AiDirectorOverview = {
  projectId: string;
  pipelineStage: string;
  overallProgress: number;
  totalCostUsd: number;
  estimatedRemainingCostUsd: number;
  agents: AiAgent[];
};

export type PromptTemplate = {
  id: string;
  agentId: AiAgentId;
  name: string;
  template: string;
  variables: string[];
};

export type CostLineItem = {
  agentId: AiAgentId;
  label: string;
  units: number;
  unitCostUsd: number;
  totalUsd: number;
};

export type CostEstimate = {
  projectId: string;
  items: CostLineItem[];
  subtotalUsd: number;
  bufferUsd: number;
  totalUsd: number;
};

export type AiLogEntry = {
  id: string;
  projectId: string;
  agentId: AiAgentId;
  level: AiLogLevel;
  message: string;
  metadata?: Record<string, string>;
  createdAt: string;
};

export type RunAgentPayload = {
  agentId: AiAgentId;
  prompt?: string;
  episodeId?: string;
  sceneId?: string;
  sceneIds?: string[];
  runAllScenes?: boolean;
  modelId?: string;
};

export type RunAgentBatchPayload = {
  agentId: AiAgentId;
  sceneIds: string[];
  prompt?: string;
  episodeId?: string;
  modelId?: string;
};

export type ScenePreviewItem = {
  id: string;
  episodeId: string;
  projectId: string;
  order: number;
  title: string;
  description: string;
  location?: string;
  characters: string[];
  durationSec: number;
  status: import('./episode-planner.types').SceneStatus;
  videoUrl?: string;
  videos?: import('./episode-planner.types').SceneVideo[];
  contextPreview: string;
};

export type ScenePreviewEpisode = {
  id: string;
  number: number;
  title: string;
  synopsis: string;
  scenes: ScenePreviewItem[];
};

export type ScenePreview = {
  projectId: string;
  storyContext: {
    logline: string;
    synopsis: string;
    tone: string;
  };
  episodes: ScenePreviewEpisode[];
};

export type PromptBuilderPayload = {
  agentId: AiAgentId;
  basePrompt: string;
  style: string;
  constraints: string;
};

export type PromptBuilderResult = {
  prompt: string;
  agentId: AiAgentId;
};

export type RunAgentResult = {
  agentId: AiAgentId;
  jobId: string;
  status: AiAgentStatus;
  message: string;
  sceneId?: string;
  sceneContextPreview?: string;
  sceneCount?: number;
  jobs?: RunAgentResult[];
  modelId?: string;
  provider?: string;
  outputPreview?: string;
  selectionReason?: string;
  videoUrl?: string;
};
