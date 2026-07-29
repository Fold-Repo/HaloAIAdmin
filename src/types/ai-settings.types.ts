export type AiSelectionMode = 'auto' | 'manual';

export type AiTaskCategory =
  | 'story'
  | 'script'
  | 'character'
  | 'video'
  | 'voice'
  | 'subtitle'
  | 'music';

export type AiModelCatalogItem = {
  id: string;
  label: string;
  provider: string;
  providerLabel: string;
  category: AiTaskCategory;
  priority: number;
  supportsText: boolean;
  supportsImage: boolean;
  supportsVideo: boolean;
  description: string;
  configured: boolean;
  enabled: boolean;
};

export type UserAiSettings = {
  selectionMode: AiSelectionMode;
  enabledModels: string[];
  manualSelections: Partial<Record<AiTaskCategory, string>>;
  fallbackEnabled: boolean;
};

export type AiSettingsResponse = {
  settings: UserAiSettings;
  models: AiModelCatalogItem[];
  selectionMode: AiSelectionMode;
  fallbackEnabled: boolean;
};

export type UpdateAiSettingsPayload = Partial<UserAiSettings>;
