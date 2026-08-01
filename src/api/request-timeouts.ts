import type { AxiosRequestConfig } from 'axios';

import { appConfig } from '@/config';

/** Use for story compose, script agent runs, etc. */
export const aiRequestConfig: AxiosRequestConfig = {
  timeout: appConfig.api.aiTimeout,
};

/** Grok video polls for up to ~5 minutes on the backend */
export const videoRequestConfig: AxiosRequestConfig = {
  timeout: appConfig.api.videoTimeout,
};

/** FFmpeg download + concat can take several minutes */
export const assembleRequestConfig: AxiosRequestConfig = {
  timeout: appConfig.api.assembleTimeout,
};

/** Manual episode MP4 upload */
export const uploadRequestConfig: AxiosRequestConfig = {
  timeout: appConfig.api.uploadTimeout,
};
