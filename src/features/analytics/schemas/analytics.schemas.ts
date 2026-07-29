import { z } from 'zod';

export const exportReportSchema = z.object({
  format: z.enum(['csv', 'json', 'pdf']),
  sections: z.array(
    z.enum([
      'dashboard',
      'revenue',
      'earnings',
      'watch-time',
      'completion',
      'ai-cost',
      'render-cost',
      'growth',
      'retention',
      'cohorts',
      'export',
    ]),
  ).min(1, 'Select at least one section'),
  dateFrom: z.string().min(1, 'Start date is required'),
  dateTo: z.string().min(1, 'End date is required'),
});

export type ExportReportFormValues = z.infer<typeof exportReportSchema>;
