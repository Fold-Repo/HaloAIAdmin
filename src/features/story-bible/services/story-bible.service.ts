import { apiGet, apiPatch, apiPost } from '@/api';
import { aiRequestConfig } from '@/api/request-timeouts';
import type {
  ApiResponse,
  ComposeStoryPayload,
  ComposeStoryResult,
  ComposerStatus,
  ExpandEpisodesPayload,
  ExpandEpisodesResult,
  ExtractEpisodesPreview,
  ExtractEpisodesResult,
  GenerateEpisodeBatchPayload,
  GenerateEpisodeBatchResult,
  GenerateStoryVisualResult,
  StoryBible,
  StoryDocument,
  SyncStorySummaryResult,
  UpdateStoryDocumentPayload,
  UpdateStoryEndingPayload,
  UpdateStoryOverviewPayload,
} from '@/types';

const BASE = (projectId: string) => `/creator/projects/${projectId}/story-bible`;

export const storyBibleService = {
  getStoryBible: (projectId: string) =>
    apiGet<ApiResponse<StoryBible>>(BASE(projectId)),

  updateOverview: (projectId: string, payload: UpdateStoryOverviewPayload) =>
    apiPatch<ApiResponse<StoryBible['overview']>, UpdateStoryOverviewPayload>(
      `${BASE(projectId)}/overview`,
      payload,
    ),

  updateEnding: (projectId: string, payload: UpdateStoryEndingPayload) =>
    apiPatch<ApiResponse<StoryBible['ending']>, UpdateStoryEndingPayload>(
      `${BASE(projectId)}/ending`,
      payload,
    ),

  updateDocument: (projectId: string, payload: UpdateStoryDocumentPayload) =>
    apiPatch<ApiResponse<StoryDocument>, UpdateStoryDocumentPayload>(
      `${BASE(projectId)}/document`,
      payload,
    ),

  saveDocumentVersion: (projectId: string, payload: { label: string; changeSummary: string }) =>
    apiPost<ApiResponse<StoryBible['versions'][number]>>(
      `${BASE(projectId)}/versions`,
      payload,
    ),

  restoreVersion: (projectId: string, versionId: string) =>
    apiPost<ApiResponse<StoryDocument>>(`${BASE(projectId)}/versions/${versionId}/restore`),

  previewExtractEpisodes: (projectId: string, payload?: { content?: string }) =>
    apiPost<ApiResponse<ExtractEpisodesPreview>, { content?: string }>(
      `${BASE(projectId)}/extract-episodes/preview`,
      payload ?? {},
    ),

  extractEpisodes: (projectId: string, payload?: { content?: string; mode?: 'merge' | 'replace' }) =>
    apiPost<ApiResponse<ExtractEpisodesResult>, { content?: string; mode?: 'merge' | 'replace' }>(
      `${BASE(projectId)}/extract-episodes`,
      payload ?? {},
    ),

  getComposerStatus: (projectId: string) =>
    apiGet<ApiResponse<ComposerStatus>>(`${BASE(projectId)}/composer/status`),

  composeStory: (projectId: string, payload: ComposeStoryPayload) =>
    apiPost<ApiResponse<ComposeStoryResult>, ComposeStoryPayload>(
      `${BASE(projectId)}/composer/compose`,
      payload,
      aiRequestConfig,
    ),

  expandEpisodes: (projectId: string, payload: ExpandEpisodesPayload) =>
    apiPost<ApiResponse<ExpandEpisodesResult>, ExpandEpisodesPayload>(
      `${BASE(projectId)}/composer/expand-episodes`,
      payload,
      aiRequestConfig,
    ),

  syncStorySummary: (projectId: string) =>
    apiPost<ApiResponse<SyncStorySummaryResult>>(
      `${BASE(projectId)}/composer/sync-summary`,
      undefined,
      aiRequestConfig,
    ),

  generateEpisodeBatch: (projectId: string, payload?: GenerateEpisodeBatchPayload) =>
    apiPost<ApiResponse<GenerateEpisodeBatchResult>, GenerateEpisodeBatchPayload>(
      `${BASE(projectId)}/composer/generate-episodes`,
      payload ?? {},
      aiRequestConfig,
    ),

  generateCharacterImage: (
    projectId: string,
    characterId: string,
    payload?: { regenerate?: boolean },
  ) =>
    apiPost<ApiResponse<GenerateStoryVisualResult>, { regenerate?: boolean }>(
      `${BASE(projectId)}/characters/${characterId}/generate-image`,
      payload ?? {},
      aiRequestConfig,
    ),

  generateWardrobeImage: (
    projectId: string,
    wardrobeId: string,
    payload?: { regenerate?: boolean },
  ) =>
    apiPost<ApiResponse<GenerateStoryVisualResult>, { regenerate?: boolean }>(
      `${BASE(projectId)}/wardrobe/${wardrobeId}/generate-image`,
      payload ?? {},
      aiRequestConfig,
    ),
};
