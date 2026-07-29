import { z } from 'zod';

export const jobActionSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
});

export type JobActionFormValues = z.infer<typeof jobActionSchema>;
