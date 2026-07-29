// Feature module placeholders — business logic to be implemented in subsequent prompts

export const FEATURE_MODULES = [
  'authentication',
  'dashboard',
  'creator',
  'story',
  'story-bible',
  'character',
  'episode',
  'scene',
  'render',
  'publish',
  'analytics',
  'admin',
] as const;

export type FeatureModule = (typeof FEATURE_MODULES)[number];
