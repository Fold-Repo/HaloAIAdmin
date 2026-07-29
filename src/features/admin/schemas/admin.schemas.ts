import { z } from 'zod';

export const updateUserStatusSchema = z.object({
  userId: z.string().min(1),
  status: z.enum(['active', 'suspended', 'pending']),
});

export const moderationActionSchema = z.object({
  itemId: z.string().min(1),
  action: z.enum(['approve', 'reject']),
});

export const toggleFeatureFlagSchema = z.object({
  flagId: z.string().min(1),
  enabled: z.boolean(),
});

export type UpdateUserStatusFormValues = z.infer<typeof updateUserStatusSchema>;
export type ModerationActionFormValues = z.infer<typeof moderationActionSchema>;
export type ToggleFeatureFlagFormValues = z.infer<typeof toggleFeatureFlagSchema>;
