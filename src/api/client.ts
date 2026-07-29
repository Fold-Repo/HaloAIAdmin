import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';

import { refreshAccessToken } from '@/api/refresh-token';
import { appConfig } from '@/config';
import { useAuthStore } from '@/store';
import type { ApiError } from '@/types';

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function getStoredToken(): string | null {
  return localStorage.getItem(appConfig.auth.tokenKey);
}

function getStoredRefreshToken(): string | null {
  return localStorage.getItem(appConfig.auth.refreshTokenKey);
}

function clearAuthStorage() {
  localStorage.removeItem(appConfig.auth.tokenKey);
  localStorage.removeItem(appConfig.auth.refreshTokenKey);
}

function processRefreshQueue(error: unknown, token: string | null = null) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
      return;
    }
    resolve(token!);
  });
  refreshQueue = [];
}

async function handleTokenRefresh(client: AxiosInstance, originalRequest: RetryableConfig) {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  if (isRefreshing) {
    const token = await new Promise<string>((resolve, reject) => {
      refreshQueue.push({ resolve, reject });
    });
    originalRequest.headers.Authorization = `Bearer ${token}`;
    return client(originalRequest);
  }

  originalRequest._retry = true;
  isRefreshing = true;

  try {
    const session = await refreshAccessToken(refreshToken);
    const { accessToken, refreshToken: nextRefreshToken } = session.tokens;

    localStorage.setItem(appConfig.auth.tokenKey, accessToken);
    localStorage.setItem(appConfig.auth.refreshTokenKey, nextRefreshToken);
    useAuthStore.getState().setSession(session.user, accessToken, nextRefreshToken);

    processRefreshQueue(null, accessToken);
    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
    return client(originalRequest);
  } catch (error) {
    processRefreshQueue(error, null);
    clearAuthStorage();
    useAuthStore.getState().logout();
    throw error;
  } finally {
    isRefreshing = false;
  }
}

export function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: appConfig.api.baseUrl,
    timeout: appConfig.api.timeout,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiError>) => {
      const originalRequest = error.config as RetryableConfig | undefined;
      const isAuthEndpoint = originalRequest?.url?.includes('/auth/');
      const shouldAttemptRefresh =
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        !isAuthEndpoint;

      if (shouldAttemptRefresh) {
        try {
          return await handleTokenRefresh(client, originalRequest);
        } catch (refreshError) {
          const apiError: ApiError = {
            message:
              refreshError instanceof Error ? refreshError.message : 'Session expired',
            status: 401,
          };
          return Promise.reject(apiError);
        }
      }

      if (error.response?.status === 401 && !isAuthEndpoint) {
        clearAuthStorage();
        useAuthStore.getState().logout();
      }

      const apiError: ApiError = {
        message:
          error.code === 'ECONNABORTED'
            ? 'Request timed out. Video generation can take several minutes — check AI logs on the project; the job may still complete on the server.'
            : (error.response?.data?.message ?? error.message ?? 'Request failed'),
        code: error.response?.data?.code,
        status: error.response?.status,
        errors: error.response?.data?.errors,
      };

      return Promise.reject(apiError);
    },
  );

  return client;
}

export const apiClient = createApiClient();

export async function apiGet<T>(url: string, config?: AxiosRequestConfig) {
  const response = await apiClient.get<T>(url, config);
  return response.data;
}

export async function apiPost<T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig,
) {
  const response = await apiClient.post<T>(url, data, config);
  return response.data;
}

export async function apiPut<T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig,
) {
  const response = await apiClient.put<T>(url, data, config);
  return response.data;
}

export async function apiPatch<T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig,
) {
  const response = await apiClient.patch<T>(url, data, config);
  return response.data;
}

export async function apiDelete<T>(url: string, config?: AxiosRequestConfig) {
  const response = await apiClient.delete<T>(url, config);
  return response.data;
}

export async function fetchAuthenticatedBlob(url: string): Promise<string> {
  const token = getStoredToken();
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    throw new Error(`Failed to load media (${response.status})`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
