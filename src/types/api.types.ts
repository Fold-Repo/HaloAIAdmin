export type ApiResponse<T> = {
  data: T;
  message?: string;
  success: boolean;
};

export type PaginatedResponse<T> = ApiResponse<T[]> & {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type ApiError = {
  message: string;
  code?: string;
  status?: number;
  errors?: Record<string, string[]>;
};

export type RequestConfig = {
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};
