import type { AdminPortalSection } from '@/types';

export const ADMIN_SECTIONS: Array<{
  id: AdminPortalSection;
  label: string;
  description: string;
}> = [
  { id: 'overview', label: 'Overview', description: 'Platform admin overview' },
  { id: 'users', label: 'Users', description: 'User management' },
  { id: 'creators', label: 'Creators', description: 'Creator management' },
  { id: 'moderation', label: 'Moderation', description: 'Content moderation queue' },
  { id: 'ai-usage', label: 'AI Usage', description: 'AI usage and spend dashboard' },
  { id: 'subscriptions', label: 'Subscriptions', description: 'Subscription metrics' },
  { id: 'rewarded-ads', label: 'Rewarded Ads', description: 'Rewarded ads performance' },
  { id: 'coins', label: 'Coins', description: 'Coin economy dashboard' },
  { id: 'reports', label: 'Reports', description: 'Platform reports' },
  { id: 'audit-logs', label: 'Audit Logs', description: 'Admin audit trail' },
  { id: 'feature-flags', label: 'Feature Flags', description: 'Feature flag controls' },
  { id: 'system-health', label: 'System Health', description: 'Service health monitoring' },
];

export const USER_STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  suspended: 'Suspended',
  pending: 'Pending',
};

export const CREATOR_STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  review: 'Under review',
  suspended: 'Suspended',
};

export const HEALTH_LABELS: Record<string, string> = {
  healthy: 'Healthy',
  degraded: 'Degraded',
  critical: 'Critical',
  up: 'Up',
  down: 'Down',
};

export function getAdminPath(section: AdminPortalSection = 'overview') {
  return `/admin/${section}`;
}

export function isAdminSection(value: string | undefined): value is AdminPortalSection {
  return ADMIN_SECTIONS.some((section) => section.id === value);
}

export function formatUsd(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatPercent(value: number, digits = 1) {
  return `${value.toFixed(digits)}%`;
}
