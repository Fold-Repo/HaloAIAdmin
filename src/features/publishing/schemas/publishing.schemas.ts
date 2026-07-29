import { z } from 'zod';

export const updatePublishSettingsSchema = z.object({
  visibility: z.enum(['public', 'unlisted', 'private', 'scheduled']).optional(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  isPremium: z.boolean().optional(),
  rewardedAdsEnabled: z.boolean().optional(),
  coinUnlockEnabled: z.boolean().optional(),
  coinPrice: z.number().min(0).max(9999).optional(),
  scheduledAt: z.string().optional(),
});

export const scheduleReleaseSchema = z.object({
  episodeId: z.string().min(1, 'Episode is required'),
  scheduledAt: z.string().min(1, 'Schedule date is required'),
  timezone: z.string().min(1, 'Timezone is required'),
});

export const tagsFormSchema = z.object({
  tags: z.string().min(1, 'Enter at least one tag'),
});

export type UpdatePublishSettingsFormValues = z.infer<typeof updatePublishSettingsSchema>;
export type ScheduleReleaseFormValues = z.infer<typeof scheduleReleaseSchema>;
export type TagsFormValues = z.infer<typeof tagsFormSchema>;
