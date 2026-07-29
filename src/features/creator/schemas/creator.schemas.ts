import { z } from 'zod';

export const projectWizardSchema = z
  .object({
    title: z.string().min(2, 'Project title is required'),
    premise: z.string().min(20, 'Describe your story premise in at least 20 characters'),
    genre: z.string().min(2, 'Select a genre'),
    targetFormat: z.enum(['vertical-short', 'vertical-series', 'horizontal']),
    episodeLength: z.coerce.number().min(15).max(180),
    episodeCount: z.coerce.number().min(1).max(24),
    assignmentMode: z.enum(['standalone', 'existing', 'new-series']),
    seriesId: z.string().optional(),
    seasonId: z.string().optional(),
    newSeriesTitle: z.string().optional(),
    newSeasonTitle: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.assignmentMode === 'existing' && !data.seriesId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Select a series',
        path: ['seriesId'],
      });
    }
    if (data.assignmentMode === 'new-series' && !data.newSeriesTitle?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Series title is required',
        path: ['newSeriesTitle'],
      });
    }
  });

export const seriesSchema = z.object({
  title: z.string().min(2, 'Series title is required'),
  description: z.string().min(10, 'Add a description'),
  genre: z.string().min(2, 'Genre is required'),
});

export const seasonSchema = z.object({
  title: z.string().min(2, 'Season title is required'),
  number: z.coerce.number().min(1, 'Season number must be at least 1'),
  description: z.string().optional(),
});

export type ProjectWizardValues = z.infer<typeof projectWizardSchema>;
export type SeriesFormValues = z.infer<typeof seriesSchema>;
export type SeasonFormValues = z.infer<typeof seasonSchema>;
