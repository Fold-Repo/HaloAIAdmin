import type { UserRole } from '@/types';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  OTP_VERIFICATION: '/verify-otp',
  ONBOARDING: '/onboarding',
  DASHBOARD: '/dashboard',
  TUTORIAL: '/tutorial',
  ADMIN: '/admin',
  ADMIN_SECTION: '/admin/:section',
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '*',
  STUDIO: {
    PROJECTS: '/studio/projects',
    PROJECT_NEW: '/studio/projects/new',
    PROJECT_DETAIL: '/studio/projects/:projectId',
    PROJECT_MANUAL_UPLOAD: '/studio/projects/:projectId/manual-upload',
    SERIES: '/studio/series',
    SERIES_DETAIL: '/studio/series/:seriesId',
    SEASONS: '/studio/series/:seriesId/seasons',
    NOTIFICATIONS: '/studio/notifications',
    TUTORIAL: '/studio/tutorial',
    AI_SETTINGS: '/studio/settings/ai',
    STORY_BIBLE: '/studio/projects/:projectId/story-bible',
    STORY_BIBLE_SECTION: '/studio/projects/:projectId/story-bible/:section',
    STORY_COMPOSER: '/studio/projects/:projectId/composer',
    EPISODES: '/studio/projects/:projectId/episodes',
    EPISODE_DETAIL: '/studio/projects/:projectId/episodes/:episodeId',
    AI: '/studio/projects/:projectId/ai',
    AI_SECTION: '/studio/projects/:projectId/ai/:section',
    RENDERING: '/studio/projects/:projectId/rendering',
    RENDERING_SECTION: '/studio/projects/:projectId/rendering/:section',
    PUBLISHING: '/studio/projects/:projectId/publishing',
    PUBLISHING_SECTION: '/studio/projects/:projectId/publishing/:section',
    ANALYTICS: '/studio/projects/:projectId/analytics',
    ANALYTICS_SECTION: '/studio/projects/:projectId/analytics/:section',
  },
} as const;

export const CREATOR_NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: 'layout-dashboard' },
  { label: 'Projects', path: '/studio/projects', icon: 'folder-kanban' },
  { label: 'Series', path: '/studio/series', icon: 'library-big' },
  { label: 'Notifications', path: '/studio/notifications', icon: 'bell' },
  { label: 'Tutorial', path: '/studio/tutorial', icon: 'graduation-cap' },
  { label: 'AI Settings', path: '/studio/settings/ai', icon: 'settings' },
] as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  CREATOR: 'creator',
  VIEWER: 'viewer',
} as const satisfies Record<string, UserRole>;

export const ROLE_HOME_ROUTES: Record<UserRole, string> = {
  admin: ROUTES.ADMIN,
  creator: ROUTES.DASHBOARD,
  viewer: ROUTES.DASHBOARD,
};

export const QUERY_KEYS = {
  auth: {
    session: ['auth', 'session'] as const,
    user: ['auth', 'user'] as const,
  },
  creator: {
    dashboard: ['creator', 'dashboard'] as const,
    projects: ['creator', 'projects'] as const,
    project: (id: string) => ['creator', 'projects', id] as const,
    series: ['creator', 'series'] as const,
    seriesDetail: (id: string) => ['creator', 'series', id] as const,
    seasons: (seriesId: string) => ['creator', 'series', seriesId, 'seasons'] as const,
    jobs: ['creator', 'jobs'] as const,
    notifications: ['creator', 'notifications'] as const,
  },
  storyBible: {
    detail: (projectId: string) => ['story-bible', projectId] as const,
  },
  storyComposer: {
    status: (projectId: string) => ['story-composer', projectId, 'status'] as const,
  },
  episodePlanner: {
    summary: (projectId: string) => ['episode-planner', projectId, 'summary'] as const,
    episodes: (projectId: string) => ['episode-planner', projectId, 'episodes'] as const,
    episode: (projectId: string, episodeId: string) =>
      ['episode-planner', projectId, 'episodes', episodeId] as const,
  },
  aiSettings: {
    detail: () => ['ai-settings'] as const,
  },
  aiGeneration: {
    director: (projectId: string) => ['ai-generation', projectId, 'director'] as const,
    agent: (projectId: string, agentId: string) =>
      ['ai-generation', projectId, 'agents', agentId] as const,
    scenePreview: (projectId: string, episodeId?: string) =>
      ['ai-generation', projectId, 'scene-preview', episodeId ?? 'all'] as const,
    templates: (projectId: string) => ['ai-generation', projectId, 'templates'] as const,
    cost: (projectId: string) => ['ai-generation', projectId, 'cost'] as const,
    logs: (projectId: string) => ['ai-generation', projectId, 'logs'] as const,
  },
  rendering: {
    overview: (projectId: string) => ['rendering', projectId, 'overview'] as const,
    queue: (projectId: string) => ['rendering', projectId, 'queue'] as const,
    retryQueue: (projectId: string) => ['rendering', projectId, 'retry-queue'] as const,
    workers: (projectId: string) => ['rendering', projectId, 'workers'] as const,
    gpu: (projectId: string) => ['rendering', projectId, 'gpu'] as const,
    ffmpeg: (projectId: string) => ['rendering', projectId, 'ffmpeg'] as const,
    history: (projectId: string) => ['rendering', projectId, 'history'] as const,
    monitoring: (projectId: string) => ['rendering', projectId, 'monitoring'] as const,
  },
  publishing: {
    overview: (projectId: string) => ['publishing', projectId, 'overview'] as const,
    settings: (projectId: string) => ['publishing', projectId, 'settings'] as const,
    schedule: (projectId: string) => ['publishing', projectId, 'schedule'] as const,
    hls: (projectId: string) => ['publishing', projectId, 'hls'] as const,
    categories: ['publishing', 'categories'] as const,
    pushPreview: (projectId: string) => ['publishing', projectId, 'push-preview'] as const,
  },
  analytics: {
    overview: (projectId: string) => ['analytics', projectId, 'overview'] as const,
    revenue: (projectId: string) => ['analytics', projectId, 'revenue'] as const,
    earnings: (projectId: string) => ['analytics', projectId, 'earnings'] as const,
    watchTime: (projectId: string) => ['analytics', projectId, 'watch-time'] as const,
    completion: (projectId: string) => ['analytics', projectId, 'completion'] as const,
    aiCost: (projectId: string) => ['analytics', projectId, 'ai-cost'] as const,
    renderCost: (projectId: string) => ['analytics', projectId, 'render-cost'] as const,
    growth: (projectId: string) => ['analytics', projectId, 'growth'] as const,
    retention: (projectId: string) => ['analytics', projectId, 'retention'] as const,
    cohorts: (projectId: string) => ['analytics', projectId, 'cohorts'] as const,
  },
  adminPortal: {
    overview: ['admin', 'overview'] as const,
    users: ['admin', 'users'] as const,
    creators: ['admin', 'creators'] as const,
    moderation: ['admin', 'moderation'] as const,
    aiUsage: ['admin', 'ai-usage'] as const,
    subscriptions: ['admin', 'subscriptions'] as const,
    rewardedAds: ['admin', 'rewarded-ads'] as const,
    coins: ['admin', 'coins'] as const,
    reports: ['admin', 'reports'] as const,
    auditLogs: ['admin', 'audit-logs'] as const,
    featureFlags: ['admin', 'feature-flags'] as const,
    systemHealth: ['admin', 'system-health'] as const,
  },
} as const;

export const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
} as const;

export const SOCIAL_PROVIDERS = [
  { id: 'google' as const, label: 'Google' },
  { id: 'github' as const, label: 'GitHub' },
  { id: 'apple' as const, label: 'Apple' },
];
