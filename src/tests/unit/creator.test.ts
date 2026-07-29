import { describe, expect, it } from 'vitest';

import {
  getProjectStatusLabel,
  getProjectStatusVariant,
} from '@/features/creator/utils/creator.utils';
import { projectWizardSchema } from '@/features/creator/schemas/creator.schemas';

describe('creator utils', () => {
  it('maps project statuses to labels', () => {
    expect(getProjectStatusLabel('generating')).toBe('Generating');
    expect(getProjectStatusVariant('failed')).toBe('destructive');
  });
});

describe('project wizard schema', () => {
  it('requires series when assignment mode is existing', () => {
    const result = projectWizardSchema.safeParse({
      title: 'Test Project',
      description: 'A valid project description',
      prompt: 'Create a compelling vertical drama about friendship and ambition.',
      genre: 'Drama',
      targetFormat: 'vertical-short',
      episodeLength: 60,
      assignmentMode: 'existing',
      seriesId: '',
    });

    expect(result.success).toBe(false);
  });
});
