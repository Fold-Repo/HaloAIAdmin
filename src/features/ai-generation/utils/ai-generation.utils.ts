import type { AiAgentId, AiGenerationSection } from '@/types';

export const AI_GENERATION_SECTIONS: Array<{
  id: AiGenerationSection;
  label: string;
  description: string;
}> = [
  { id: 'dashboard', label: 'Director', description: 'AI Director Dashboard overview' },
  { id: 'story-planner', label: 'Story Planner', description: 'Narrative arc planning agent' },
  { id: 'script', label: 'Script', description: 'Screenplay generation agent' },
  { id: 'character', label: 'Character', description: 'Character consistency agent' },
  { id: 'video', label: 'Video', description: 'Vertical scene video agent' },
  { id: 'voice', label: 'Voice', description: 'Dialogue synthesis agent' },
  { id: 'subtitle', label: 'Subtitle', description: 'Caption generation agent' },
  { id: 'music', label: 'Music', description: 'Score and SFX agent' },
  { id: 'prompt-builder', label: 'Prompt Builder', description: 'Compose agent prompts' },
  { id: 'cost', label: 'Cost', description: 'Generation cost estimator' },
  { id: 'logs', label: 'Logs', description: 'AI execution logs' },
];

export const AGENT_STATUS_LABELS: Record<string, string> = {
  idle: 'Idle',
  queued: 'Queued',
  running: 'Running',
  completed: 'Completed',
  failed: 'Failed',
};

export const PIPELINE_STEPS = [
  'Story Planner',
  'Script',
  'Character',
  'Storyboard',
  'Video',
  'Voice',
  'Music + SFX',
  'Subtitle',
  'Render',
] as const;

export function getAiGenerationPath(projectId: string, section: AiGenerationSection = 'dashboard') {
  return `/studio/projects/${projectId}/ai/${section}`;
}

export function isAiGenerationSection(value: string | undefined): value is AiGenerationSection {
  return AI_GENERATION_SECTIONS.some((section) => section.id === value);
}

export function isAgentSection(section: AiGenerationSection): section is AiAgentId {
  return [
    'story-planner',
    'script',
    'character',
    'video',
    'voice',
    'subtitle',
    'music',
  ].includes(section);
}

export function formatUsd(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}
