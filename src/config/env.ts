const env = import.meta.env;

function requireEnv(key: keyof ImportMetaEnv, fallback?: string): string {
  const value = env[key] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const appConfig = {
  name: requireEnv('VITE_APP_NAME', 'AI Creator Studio'),
  version: requireEnv('VITE_APP_VERSION', '0.1.0'),
  api: {
    baseUrl: requireEnv('VITE_API_BASE_URL', 'http://localhost:3000/api'),
    timeout: Number(requireEnv('VITE_API_TIMEOUT', '30000')),
    /** Long-running Claude / script generation calls */
    aiTimeout: Number(requireEnv('VITE_API_AI_TIMEOUT', '180000')),
    /** Grok Imagine polling can take several minutes */
    videoTimeout: Number(requireEnv('VITE_API_VIDEO_TIMEOUT', '600000')),
    /** Episode assembly (download scenes + FFmpeg) */
    assembleTimeout: Number(requireEnv('VITE_API_ASSEMBLE_TIMEOUT', '600000')),
    /** Manual MP4 upload can be large */
    uploadTimeout: Number(requireEnv('VITE_API_UPLOAD_TIMEOUT', '600000')),
  },
  auth: {
    tokenKey: requireEnv('VITE_AUTH_TOKEN_KEY', 'ai_creator_auth_token'),
    refreshTokenKey: requireEnv('VITE_AUTH_REFRESH_TOKEN_KEY', 'ai_creator_refresh_token'),
  },
  features: {
    enableDevtools: env.VITE_ENABLE_DEVTOOLS === 'true',
  },
  isDev: env.DEV,
  isProd: env.PROD,
} as const;
