import { describe, expect, it } from 'vitest';

import { jobActionSchema } from '@/features/rendering/schemas/rendering.schemas';
import {
  formatDuration,
  formatRenderTime,
  getRenderingPath,
  isRenderingSection,
} from '@/features/rendering/utils/rendering.utils';

describe('rendering utils', () => {
  it('builds rendering paths', () => {
    expect(getRenderingPath('proj-1')).toBe('/studio/projects/proj-1/rendering/progress');
    expect(getRenderingPath('proj-1', 'queue')).toBe(
      '/studio/projects/proj-1/rendering/queue',
    );
  });

  it('validates section ids', () => {
    expect(isRenderingSection('ffmpeg')).toBe(true);
    expect(isRenderingSection('invalid')).toBe(false);
  });

  it('formats durations', () => {
    expect(formatDuration(45)).toBe('45s');
    expect(formatDuration(125)).toBe('2m 05s');
    expect(formatRenderTime(342)).toBe('5m 42s');
  });
});

describe('rendering schemas', () => {
  it('validates job action form', () => {
    const result = jobActionSchema.safeParse({ jobId: 'render-1' });
    expect(result.success).toBe(true);
  });
});
