import { describe, expect, it } from 'vitest';

import { exportReportSchema } from '@/features/analytics/schemas/analytics.schemas';
import {
  formatChangePct,
  formatUsd,
  getAnalyticsPath,
  isAnalyticsSection,
} from '@/features/analytics/utils/analytics.utils';

describe('analytics utils', () => {
  it('builds analytics paths', () => {
    expect(getAnalyticsPath('proj-1')).toBe('/studio/projects/proj-1/analytics/dashboard');
    expect(getAnalyticsPath('proj-1', 'revenue')).toBe(
      '/studio/projects/proj-1/analytics/revenue',
    );
  });

  it('validates section ids', () => {
    expect(isAnalyticsSection('cohorts')).toBe(true);
    expect(isAnalyticsSection('invalid')).toBe(false);
  });

  it('formats values', () => {
    expect(formatUsd(4820.5)).toBe('$4,820.50');
    expect(formatChangePct(12.4)).toBe('+12.4%');
  });
});

describe('analytics schemas', () => {
  it('validates export report form', () => {
    const result = exportReportSchema.safeParse({
      format: 'csv',
      sections: ['dashboard', 'revenue'],
      dateFrom: '2026-07-01',
      dateTo: '2026-07-27',
    });
    expect(result.success).toBe(true);
  });
});
