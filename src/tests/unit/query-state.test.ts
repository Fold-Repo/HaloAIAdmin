import { describe, expect, it, vi } from 'vitest';

import { combineQueryState } from '@/utils/query-state';

function mockQuery(
  overrides: Partial<{
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => Promise<unknown>;
  }> = {},
) {
  return {
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('combineQueryState', () => {
  it('returns loading when any query is loading', () => {
    const state = combineQueryState([
      mockQuery(),
      mockQuery({ isLoading: true }),
    ]);

    expect(state.isLoading).toBe(true);
    expect(state.isError).toBe(false);
  });

  it('returns error when any query failed', () => {
    const error = new Error('Network error');
    const state = combineQueryState([
      mockQuery(),
      mockQuery({ isError: true, error }),
    ]);

    expect(state.isError).toBe(true);
    expect(state.error).toBe(error);
  });

  it('refetches only failed queries', async () => {
    const failedRefetch = vi.fn().mockResolvedValue(undefined);
    const successRefetch = vi.fn().mockResolvedValue(undefined);

    await combineQueryState([
      mockQuery({ refetch: successRefetch }),
      mockQuery({ isError: true, error: new Error('fail'), refetch: failedRefetch }),
    ]).refetch();

    expect(failedRefetch).toHaveBeenCalledOnce();
    expect(successRefetch).not.toHaveBeenCalled();
  });
});
