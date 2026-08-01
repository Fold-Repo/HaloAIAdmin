import { apiClient, apiGet, apiPatch, apiPost } from '@/api';
import { assembleRequestConfig, uploadRequestConfig } from '@/api/request-timeouts';
import type {
  ApiResponse,
  AssembleEpisodeResult,
  CliffhangerSuggestion,
  Episode,
  EpisodePlannerSummary,
  EpisodeWithScenes,
  GenerateCliffhangerPayload,
  GenerateEpisodesPayload,
  ManualEpisodeUploadResult,
  ReorderScenesPayload,
  Scene,
  SelectSceneVideoPayload,
  UpdateEpisodePayload,
  UpsertScenePayload,
} from '@/types';

const BASE = (projectId: string) => `/creator/projects/${projectId}/episodes`;

export const episodePlannerService = {
  getSummary: (projectId: string) =>
    apiGet<ApiResponse<EpisodePlannerSummary>>(`${BASE(projectId)}/summary`),

  getEpisodes: (projectId: string) => apiGet<ApiResponse<Episode[]>>(BASE(projectId)),

  getEpisode: (projectId: string, episodeId: string) =>
    apiGet<ApiResponse<EpisodeWithScenes>>(`${BASE(projectId)}/${episodeId}`),

  generateEpisodes: (projectId: string, payload: GenerateEpisodesPayload) =>
    apiPost<ApiResponse<Episode[]>, GenerateEpisodesPayload>(
      `${BASE(projectId)}/generate`,
      payload,
    ),

  updateEpisode: (projectId: string, episodeId: string, payload: UpdateEpisodePayload) =>
    apiPatch<ApiResponse<Episode>, UpdateEpisodePayload>(
      `${BASE(projectId)}/${episodeId}`,
      payload,
    ),

  generateCliffhanger: (
    projectId: string,
    episodeId: string,
    payload: GenerateCliffhangerPayload,
  ) =>
    apiPost<ApiResponse<CliffhangerSuggestion>, GenerateCliffhangerPayload>(
      `${BASE(projectId)}/${episodeId}/cliffhanger/generate`,
      payload,
    ),

  createScene: (projectId: string, episodeId: string, payload: UpsertScenePayload) =>
    apiPost<ApiResponse<Scene>, UpsertScenePayload>(
      `${BASE(projectId)}/${episodeId}/scenes`,
      payload,
    ),

  reorderScenes: (projectId: string, episodeId: string, payload: ReorderScenesPayload) =>
    apiPatch<ApiResponse<Scene[]>, ReorderScenesPayload>(
      `${BASE(projectId)}/${episodeId}/scenes/reorder`,
      payload,
    ),

  selectSceneVideo: (
    projectId: string,
    episodeId: string,
    sceneId: string,
    payload: SelectSceneVideoPayload,
  ) =>
    apiPatch<ApiResponse<Scene>, SelectSceneVideoPayload>(
      `${BASE(projectId)}/${episodeId}/scenes/${sceneId}/video/select`,
      payload,
    ),

  assembleEpisode: (projectId: string, episodeId: string) =>
    apiPost<ApiResponse<AssembleEpisodeResult>, Record<string, never>>(
      `${BASE(projectId)}/${episodeId}/assemble`,
      {},
      assembleRequestConfig,
    ),

  uploadEpisodeVideo: (
    projectId: string,
    episodeId: string,
    file: File,
    onProgress?: (percent: number) => void,
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient
      .post<ApiResponse<ManualEpisodeUploadResult>>(
        `${BASE(projectId)}/${episodeId}/video`,
        formData,
        {
          ...uploadRequestConfig,
          headers: {
            // Let the browser set multipart boundary (do not force application/json).
            'Content-Type': false as unknown as string,
          },
          onUploadProgress: (event) => {
            if (!onProgress || !event.total) return;
            onProgress(Math.round((event.loaded / event.total) * 100));
          },
        },
      )
      .then((response) => response.data);
  },
};
