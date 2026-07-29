type QuerySlice = {
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<unknown>;
};

export function combineQueryState(queries: QuerySlice[]) {
  const isLoading = queries.some((query) => query.isLoading);
  const isError = queries.some((query) => query.isError);
  const error = queries.find((query) => query.isError)?.error;

  const refetch = () =>
    Promise.all(queries.filter((query) => query.isError).map((query) => query.refetch()));

  return { isLoading, isError, error, refetch };
}
