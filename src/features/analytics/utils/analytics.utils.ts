import type { AnalyticsSection } from '@/types';

export const ANALYTICS_SECTIONS: Array<{
  id: AnalyticsSection;
  label: string;
  description: string;
}> = [
  { id: 'dashboard', label: 'Dashboard', description: 'Analytics overview and KPIs' },
  { id: 'revenue', label: 'Revenue', description: 'Revenue charts and breakdown' },
  { id: 'earnings', label: 'Earnings', description: 'Creator earnings and payouts' },
  { id: 'watch-time', label: 'Watch Time', description: 'Viewing hours and sessions' },
  { id: 'completion', label: 'Completion', description: 'Episode completion rates' },
  { id: 'ai-cost', label: 'AI Cost', description: 'AI generation spend' },
  { id: 'render-cost', label: 'Render Cost', description: 'Rendering pipeline spend' },
  { id: 'growth', label: 'Growth', description: 'User growth trends' },
  { id: 'retention', label: 'Retention', description: 'Viewer retention curves' },
  { id: 'cohorts', label: 'Cohorts', description: 'Cohort retention analysis' },
  { id: 'export', label: 'Export', description: 'Export analytics reports' },
];

export function getAnalyticsPath(projectId: string, section: AnalyticsSection = 'dashboard') {
  return `/studio/projects/${projectId}/analytics/${section}`;
}

export function isAnalyticsSection(value: string | undefined): value is AnalyticsSection {
  return ANALYTICS_SECTIONS.some((section) => section.id === value);
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

export function formatChangePct(value: number) {
  const prefix = value >= 0 ? '+' : '';
  return `${prefix}${value.toFixed(1)}%`;
}

export function formatHours(hours: number) {
  if (hours >= 1000) return `${(hours / 1000).toFixed(1)}k hrs`;
  return `${formatNumber(hours)} hrs`;
}
