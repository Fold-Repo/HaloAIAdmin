import { z } from 'zod';

export const storyOverviewSchema = z.object({
  logline: z.string().min(10, 'Logline is required'),
  synopsis: z.string().min(20, 'Synopsis is required'),
  themes: z.string().min(2, 'Add at least one theme'),
  tone: z.string().min(2, 'Tone is required'),
  targetAudience: z.string().min(2, 'Target audience is required'),
});

export const storyCharacterSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  role: z.enum(['protagonist', 'antagonist', 'supporting', 'minor']),
  description: z.string().min(5),
  motivation: z.string().min(5),
  backstory: z.string().min(5),
  visualNotes: z.string().min(5),
  voiceNotes: z.string().optional(),
});

export const storyEndingSchema = z.object({
  finaleType: z.string().min(2),
  description: z.string().min(10),
  cliffhanger: z.string().min(5),
  sequelHook: z.string().min(5),
});

export const storyDocumentSchema = z.object({
  content: z.string().min(1, 'Story content cannot be empty'),
  format: z.enum(['markdown', 'screenplay']),
});

export type StoryOverviewFormValues = z.infer<typeof storyOverviewSchema>;
export type StoryCharacterFormValues = z.infer<typeof storyCharacterSchema>;
export type StoryEndingFormValues = z.infer<typeof storyEndingSchema>;
export type StoryDocumentFormValues = z.infer<typeof storyDocumentSchema>;
