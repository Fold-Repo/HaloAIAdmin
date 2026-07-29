import { describe, expect, it } from 'vitest';

import {
  calculateRuntimeDelta,
  calculateSceneProgress,
  formatRuntime,
  getEpisodeDetailPath,
} from '@/features/episode-planner/utils/episode-planner.utils';
import { generateEpisodesSchema } from '@/features/episode-planner/schemas/episode-planner.schemas';

describe('episode planner utils', () => {
  it('formats runtime labels', () => {
    expect(formatRuntime(60)).toBe('1m 00s');
    expect(formatRuntime(15)).toBe('15s');
  });

  it('calculates runtime delta', () => {
    const result = calculateRuntimeDelta(70, 60);
    expect(result.isOver).toBe(true);
    expect(result.label).toContain('over target');
  });

  it('calculates scene progress', () => {
    expect(
      calculateSceneProgress([
        { status: 'draft' },
        { status: 'approved' },
      ]),
    ).toBe(50);
  });

  it('builds episode detail paths', () => {
    expect(getEpisodeDetailPath('proj-1', 'ep-1')).toBe(
      '/studio/projects/proj-1/episodes/ep-1',
    );
  });
});

describe('generate episodes schema', () => {
  it('validates generator form', () => {
    const result = generateEpisodesSchema.safeParse({
      count: 3,
      targetRuntimeSec: 60,
      useStoryBible: true,
    });
    expect(result.success).toBe(true);
  });
});
