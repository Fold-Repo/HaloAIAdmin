import { z } from 'zod';

export const runAgentSchema = z.object({
  prompt: z.string().optional(),
  episodeId: z.string().optional(),
  sceneId: z.string().optional(),
});

export const promptBuilderSchema = z.object({
  agentId: z.enum([
    'story-planner',
    'script',
    'character',
    'video',
    'voice',
    'subtitle',
    'music',
  ]),
  basePrompt: z.string().min(10, 'Base prompt is required'),
  style: z.string().min(2, 'Style is required'),
  constraints: z.string().min(2, 'Constraints are required'),
});

export type RunAgentFormValues = z.infer<typeof runAgentSchema>;
export type PromptBuilderFormValues = z.infer<typeof promptBuilderSchema>;
