import { apiGet, apiPost } from '@/api';
import { aiRequestConfig } from '@/api/request-timeouts';
import type {
  AiAgent,
  AiDirectorOverview,
  AiLogEntry,
  ApiResponse,
  CostEstimate,
  PromptBuilderPayload,
  PromptBuilderResult,
  PromptTemplate,
  RunAgentBatchPayload,
  RunAgentPayload,
  RunAgentResult,
  ScenePreview,
} from '@/types';

const BASE = (projectId: string) => `/creator/projects/${projectId}/ai`;

export const aiGenerationService = {
  getDirectorOverview: (projectId: string) =>
    apiGet<ApiResponse<AiDirectorOverview>>(`${BASE(projectId)}/director`),

  getAgent: (projectId: string, agentId: string) =>
    apiGet<ApiResponse<AiAgent>>(`${BASE(projectId)}/agents/${agentId}`),

  runAgent: (projectId: string, payload: RunAgentPayload) =>
    apiPost<ApiResponse<RunAgentResult>, RunAgentPayload>(
      `${BASE(projectId)}/agents/run`,
      payload,
      // Video now returns 202 immediately; long Grok work runs in the background.
      aiRequestConfig,
    ),

  runPipeline: (projectId: string) =>
    apiPost<ApiResponse<RunAgentResult[]>>(
      `${BASE(projectId)}/pipeline/run`,
      undefined,
      aiRequestConfig,
    ),

  getPromptTemplates: (projectId: string) =>
    apiGet<ApiResponse<PromptTemplate[]>>(`${BASE(projectId)}/prompts/templates`),

  buildPrompt: (projectId: string, payload: PromptBuilderPayload) =>
    apiPost<ApiResponse<PromptBuilderResult>, PromptBuilderPayload>(
      `${BASE(projectId)}/prompts/build`,
      payload,
    ),

  getCostEstimate: (projectId: string) =>
    apiGet<ApiResponse<CostEstimate>>(`${BASE(projectId)}/cost`),

  getLogs: (projectId: string) => apiGet<ApiResponse<AiLogEntry[]>>(`${BASE(projectId)}/logs`),

  getScenePreview: (projectId: string, episodeId?: string) => {
    const query = episodeId ? `?episodeId=${encodeURIComponent(episodeId)}` : '';
    return apiGet<ApiResponse<ScenePreview>>(`${BASE(projectId)}/scene-preview${query}`);
  },

  runAgentBatch: (projectId: string, payload: RunAgentBatchPayload) =>
    apiPost<ApiResponse<RunAgentResult>, RunAgentBatchPayload>(
      `${BASE(projectId)}/agents/run-batch`,
      payload,
      aiRequestConfig,
    ),
};
