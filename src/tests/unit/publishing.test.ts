import { describe, expect, it } from 'vitest';

import {
  scheduleReleaseSchema,
  updatePublishSettingsSchema,
} from '@/features/publishing/schemas/publishing.schemas';
import {
  getPublishingPath,
  isPublishingSection,
} from '@/features/publishing/utils/publishing.utils';

describe('publishing utils', () => {
  it('builds publishing paths', () => {
    expect(getPublishingPath('proj-1')).toBe('/studio/projects/proj-1/publishing/wizard');
    expect(getPublishingPath('proj-1', 'hls')).toBe(
      '/studio/projects/proj-1/publishing/hls',
    );
  });

  it('validates section ids', () => {
    expect(isPublishingSection('monetization')).toBe(true);
    expect(isPublishingSection('invalid')).toBe(false);
  });
});

describe('publishing schemas', () => {
  it('validates settings update', () => {
    const result = updatePublishSettingsSchema.safeParse({
      visibility: 'public',
      isPremium: true,
    });
    expect(result.success).toBe(true);
  });

  it('validates schedule release', () => {
    const result = scheduleReleaseSchema.safeParse({
      episodeId: 'ep-1',
      scheduledAt: '2026-07-28T20:00',
      timezone: 'Africa/Lagos',
    });
    expect(result.success).toBe(true);
  });
});
