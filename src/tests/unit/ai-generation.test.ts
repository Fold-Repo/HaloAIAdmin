import { describe, expect, it } from 'vitest';

import {
  formatUsd,
  getAiGenerationPath,
  isAgentSection,
  isAiGenerationSection,
} from '@/features/ai-generation/utils/ai-generation.utils';
import {
  promptBuilderSchema,
  runAgentSchema,
} from '@/features/ai-generation/schemas/ai-generation.schemas';

describe('ai generation utils', () => {
  it('builds ai generation paths', () => {
    expect(getAiGenerationPath('proj-1')).toBe('/studio/projects/proj-1/ai/dashboard');
    expect(getAiGenerationPath('proj-1', 'script')).toBe(
      '/studio/projects/proj-1/ai/script',
    );
  });

  it('validates section ids', () => {
    expect(isAiGenerationSection('dashboard')).toBe(true);
    expect(isAiGenerationSection('invalid')).toBe(false);
  });

  it('identifies agent sections', () => {
    expect(isAgentSection('script')).toBe(true);
    expect(isAgentSection('dashboard')).toBe(false);
    expect(isAgentSection('logs')).toBe(false);
  });

  it('formats usd amounts', () => {
    expect(formatUsd(12.5)).toBe('$12.50');
  });
});

describe('ai generation schemas', () => {
  it('validates run agent form', () => {
    const result = runAgentSchema.safeParse({ prompt: 'test prompt' });
    expect(result.success).toBe(true);
  });

  it('validates prompt builder form', () => {
    const result = promptBuilderSchema.safeParse({
      agentId: 'script',
      basePrompt: 'Write episode 1',
      style: 'cinematic',
      constraints: '60 seconds',
    });
    expect(result.success).toBe(true);
  });
});
