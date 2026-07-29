import { z } from 'zod';

export const generateEpisodesSchema = z.object({
  count: z.coerce.number().min(1).max(12),
  targetRuntimeSec: z.coerce.number().min(15).max(600),
  useStoryBible: z.boolean(),
});

export const episodeEditorSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  synopsis: z.string().min(10, 'Synopsis is required'),
  cliffhanger: z.string().min(5, 'Cliffhanger is required'),
  targetRuntimeSec: z.coerce.number().min(15).max(600),
});

export const sceneFormSchema = z.object({
  title: z.string().min(2, 'Scene title is required'),
  description: z.string().min(5, 'Description is required'),
  location: z.string().optional(),
  characters: z.string().min(2, 'Add at least one character'),
  durationSec: z.coerce.number().min(3).max(180),
});

export const cliffhangerGeneratorSchema = z.object({
  tone: z.string().min(2, 'Tone is required'),
});

export type GenerateEpisodesFormValues = z.infer<typeof generateEpisodesSchema>;
export type EpisodeEditorFormValues = z.infer<typeof episodeEditorSchema>;
export type SceneFormValues = z.infer<typeof sceneFormSchema>;
export type CliffhangerGeneratorFormValues = z.infer<typeof cliffhangerGeneratorSchema>;
