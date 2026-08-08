import { appConfig } from '@/config';

export function formatRuntime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs.toString().padStart(2, '0')}s`;
}

export function calculateRuntimeDelta(estimated: number, target: number) {
  const delta = estimated - target;
  return {
    delta,
    isOver: delta > 0,
    isUnder: delta < 0,
    label:
      delta === 0
        ? 'On target'
        : delta > 0
          ? `${formatRuntime(delta)} over target`
          : `${formatRuntime(Math.abs(delta))} under target`,
  };
}

export function calculateSceneProgress(
  scenes: Array<{ videoUrl?: string | null }>,
  assembledVideoUrl?: string | null,
) {
  const total = scenes.length;
  const withVideo = scenes.filter((scene) => Boolean(scene.videoUrl?.trim())).length;
  const assembled = Boolean(assembledVideoUrl?.trim());

  if (total === 0) return assembled ? 100 : 0;
  return Math.round(((withVideo + (assembled ? 1 : 0)) / (total + 1)) * 100);
}

export function getEpisodePlannerPath(projectId: string) {
  return `/studio/projects/${projectId}/episodes`;
}

export function getEpisodeDetailPath(projectId: string, episodeId: string) {
  return `/studio/projects/${projectId}/episodes/${episodeId}`;
}

export function getAssembledVideoApiUrl(projectId: string, episodeId: string) {
  return `${appConfig.api.baseUrl}/creator/projects/${projectId}/episodes/${episodeId}/assembled-video`;
}

export const EPISODE_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  planning: 'Planning',
  'in-production': 'In production',
  ready: 'Ready',
  published: 'Published',
};

export const SCENE_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  planned: 'Planned',
  generated: 'Generated',
  approved: 'Approved',
};

export function parseCharactersInput(value: string) {
  return value
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean);
}

export function formatCharactersOutput(characters: string[]) {
  return characters.join(', ');
}

export type CliffhangerPreset = {
  id: string;
  label: string;
  text: string;
};

export const CLIFFHANGER_PRESETS: CliffhangerPreset[] = [
  {
    id: 'suspenseful-reveal',
    label: 'Suspenseful reveal',
    text: 'The truth surfaces — but not everyone survives hearing it.',
  },
  {
    id: 'emotional-twist',
    label: 'Emotional twist',
    text: 'Someone they trust was watching the whole time, and the confession changes everything.',
  },
  {
    id: 'shocking-betrayal',
    label: 'Shocking betrayal',
    text: 'The ally they counted on just made the call that ends the episode on a knife edge.',
  },
  {
    id: 'mystery-hook',
    label: 'Mystery hook',
    text: 'A message arrives from someone who should not be alive — and the screen cuts to black.',
  },
  {
    id: 'danger-escalation',
    label: 'Danger escalation',
    text: 'The door opens to the one person they were running from, and there is nowhere left to go.',
  },
  {
    id: 'secret-exposed',
    label: 'Secret exposed',
    text: 'The hidden recording plays aloud in front of everyone — and silence is worse than the scream.',
  },
];

export const CLIFFHANGER_TONE_OPTIONS = [
  { value: 'suspenseful', label: 'Suspenseful' },
  { value: 'emotional', label: 'Emotional' },
  { value: 'shocking', label: 'Shocking' },
  { value: 'romantic', label: 'Romantic tension' },
  { value: 'tragic', label: 'Tragic' },
] as const;
