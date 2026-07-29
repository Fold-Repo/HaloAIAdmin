import { describe, expect, it } from 'vitest';

import {
  STORY_BIBLE_SECTIONS,
  getStoryBiblePath,
  parseThemesInput,
} from '@/features/story-bible/utils/story-bible.utils';
import { storyOverviewSchema } from '@/features/story-bible/schemas/story-bible.schemas';

describe('story bible utils', () => {
  it('builds section paths', () => {
    expect(getStoryBiblePath('proj-1', 'characters')).toBe(
      '/studio/projects/proj-1/story-bible/characters',
    );
  });

  it('parses themes input', () => {
    expect(parseThemesInput('Identity, Truth, Connection')).toEqual([
      'Identity',
      'Truth',
      'Connection',
    ]);
  });

  it('includes all required sections', () => {
    expect(STORY_BIBLE_SECTIONS.map((section) => section.id)).toEqual([
      'overview',
      'episode-plan',
      'characters',
      'relationships',
      'timeline',
      'lore',
      'locations',
      'props',
      'wardrobe',
      'season-arc',
      'ending',
      'editor',
      'versions',
    ]);
  });
});

describe('story overview schema', () => {
  it('validates overview form', () => {
    const result = storyOverviewSchema.safeParse({
      logline: 'A photographer discovers a signal hidden in reflections.',
      synopsis:
        'Kemi follows visual clues through Lagos until she must decide whether to share a message from the future.',
      themes: 'Identity, Truth',
      tone: 'Noir mystery',
      targetAudience: '18-34 viewers',
    });

    expect(result.success).toBe(true);
  });
});
