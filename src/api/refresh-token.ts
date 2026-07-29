import axios from 'axios';

import { appConfig } from '@/config';
import type { ApiResponse, AuthSession } from '@/types';

export async function refreshAccessToken(refreshToken: string): Promise<AuthSession> {
  const response = await axios.post<ApiResponse<AuthSession>>(
    `${appConfig.api.baseUrl}/auth/refresh`,
    { refreshToken },
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: appConfig.api.timeout,
    },
  );

  return response.data.data;
}
