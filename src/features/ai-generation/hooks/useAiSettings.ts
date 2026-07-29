import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/constants';
import { aiSettingsService } from '@/features/ai-generation/services/ai-settings.service';
import type { UpdateAiSettingsPayload } from '@/types';

export function useAiSettings() {
  return useQuery({
    queryKey: QUERY_KEYS.aiSettings.detail(),
    queryFn: () => aiSettingsService.getSettings().then((response) => response.data),
  });
}

export function useUpdateAiSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateAiSettingsPayload) =>
      aiSettingsService.updateSettings(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.aiSettings.detail() });
    },
  });
}

export function useModelsForAgent(agentId: string) {
  const settingsQuery = useAiSettings();
  const taskMap: Record<string, string> = {
    'story-planner': 'story',
    script: 'script',
    character: 'character',
    video: 'video',
    voice: 'voice',
    subtitle: 'subtitle',
    music: 'music',
  };
  const task = taskMap[agentId] ?? 'script';

  const models =
    settingsQuery.data?.models.filter(
      (model) => model.category === task && model.configured && model.enabled,
    ) ?? [];

  return { ...settingsQuery, models, task, settings: settingsQuery.data?.settings };
}
