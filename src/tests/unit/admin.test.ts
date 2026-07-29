import { describe, expect, it } from 'vitest';

import { moderationActionSchema } from '@/features/admin/schemas/admin.schemas';
import {
  formatUsd,
  getAdminPath,
  isAdminSection,
} from '@/features/admin/utils/admin.utils';

describe('admin utils', () => {
  it('builds admin paths', () => {
    expect(getAdminPath()).toBe('/admin/overview');
    expect(getAdminPath('moderation')).toBe('/admin/moderation');
  });

  it('validates section ids', () => {
    expect(isAdminSection('feature-flags')).toBe(true);
    expect(isAdminSection('invalid')).toBe(false);
  });

  it('formats currency', () => {
    expect(formatUsd(12480.5)).toBe('$12,480.50');
  });
});

describe('admin schemas', () => {
  it('validates moderation action', () => {
    const result = moderationActionSchema.safeParse({
      itemId: 'mod-1',
      action: 'approve',
    });
    expect(result.success).toBe(true);
  });
});
