import { describe, expect, it } from 'vitest';

import { resolveHowToUseGuide } from '@/features/how-to-use/content/how-to-use.content';

describe('resolveHowToUseGuide', () => {
  it('matches dashboard', () => {
    expect(resolveHowToUseGuide('/dashboard').id).toBe('dashboard');
  });

  it('matches project composer over project detail', () => {
    expect(resolveHowToUseGuide('/studio/projects/abc/composer').id).toBe('composer');
  });

  it('matches episode detail', () => {
    expect(resolveHowToUseGuide('/studio/projects/abc/episodes/ep1').id).toBe('episode-detail');
  });

  it('matches ai section', () => {
    expect(resolveHowToUseGuide('/studio/projects/abc/ai/video').id).toBe('ai-generation');
  });

  it('falls back for unknown paths', () => {
    expect(resolveHowToUseGuide('/totally/unknown/path').id).toBe('fallback');
  });
});
