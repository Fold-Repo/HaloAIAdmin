import { apiGet, apiPut } from '@/api';
import type { AiSettingsResponse, ApiResponse, UpdateAiSettingsPayload } from '@/types';

const BASE = '/creator/ai/settings';

export const aiSettingsService = {
  getSettings: () => apiGet<ApiResponse<AiSettingsResponse>>(BASE),

  updateSettings: (payload: UpdateAiSettingsPayload) =>
    apiPut<ApiResponse<AiSettingsResponse>, UpdateAiSettingsPayload>(BASE, payload),
};
