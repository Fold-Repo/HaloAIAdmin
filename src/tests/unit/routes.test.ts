import { describe, expect, it } from 'vitest';

import { clampProgress, hasAccessibleName } from '@/utils/a11y';
import { ROUTES } from '@/constants';
import { getAdminPath } from '@/features/admin/utils/admin.utils';
import { getAnalyticsPath } from '@/features/analytics/utils/analytics.utils';

describe('production route helpers', () => {
  it('defines core studio and admin routes', () => {
    expect(ROUTES.ADMIN_SECTION).toBe('/admin/:section');
    expect(ROUTES.STUDIO.ANALYTICS_SECTION).toContain(':projectId');
  });

  it('builds lazy-loaded feature paths', () => {
    expect(getAdminPath('overview')).toBe('/admin/overview');
    expect(getAnalyticsPath('proj-1', 'dashboard')).toBe(
      '/studio/projects/proj-1/analytics/dashboard',
    );
  });
});

describe('accessibility utils', () => {
  it('clamps progress values', () => {
    expect(clampProgress(120)).toBe(100);
    expect(clampProgress(-5)).toBe(0);
  });

  it('detects accessible names', () => {
    const button = document.createElement('button');
    button.textContent = 'Save';
    expect(hasAccessibleName(button)).toBe(true);
  });
});
