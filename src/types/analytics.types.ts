export type AnalyticsSection =
  | 'dashboard'
  | 'revenue'
  | 'earnings'
  | 'watch-time'
  | 'completion'
  | 'ai-cost'
  | 'render-cost'
  | 'growth'
  | 'retention'
  | 'cohorts'
  | 'export';

export type TimeSeriesPoint = {
  date: string;
  value: number;
};

export type AnalyticsOverview = {
  projectId: string;
  totalViews: number;
  totalRevenueUsd: number;
  totalWatchTimeHours: number;
  avgCompletionRate: number;
  totalAiCostUsd: number;
  totalRenderCostUsd: number;
  activeUsers: number;
  revenueChangePct: number;
  viewsChangePct: number;
  watchTimeChangePct: number;
  completionChangePct: number;
  aiCostChangePct: number;
  renderCostChangePct: number;
  activeUsersChangePct: number;
};

export type RevenueMetrics = {
  projectId: string;
  totalUsd: number;
  premiumUsd: number;
  adsUsd: number;
  coinsUsd: number;
  series: Array<{
    date: string;
    revenue: number;
    premium: number;
    ads: number;
    coins: number;
  }>;
};

export type CreatorEarnings = {
  projectId: string;
  grossUsd: number;
  platformFeeUsd: number;
  netUsd: number;
  payoutPendingUsd: number;
  payoutNextDate: string;
  breakdown: Array<{ source: string; amountUsd: number }>;
};

export type WatchTimeMetrics = {
  projectId: string;
  totalHours: number;
  avgSessionMinutes: number;
  byEpisode: Array<{ episodeId: string; title: string; hours: number; views: number }>;
  series: TimeSeriesPoint[];
};

export type CompletionMetrics = {
  projectId: string;
  overallRate: number;
  byEpisode: Array<{ episodeId: string; title: string; rate: number; dropOffSec: number }>;
};

export type CostMetrics = {
  projectId: string;
  totalUsd: number;
  byCategory: Array<{ label: string; amountUsd: number }>;
  series: TimeSeriesPoint[];
};

export type GrowthMetrics = {
  projectId: string;
  totalUsers: number;
  newUsers30d: number;
  growthRatePct: number;
  series: TimeSeriesPoint[];
};

export type RetentionMetrics = {
  projectId: string;
  day1: number;
  day7: number;
  day30: number;
  series: Array<{ period: string; rate: number }>;
};

export type CohortRow = {
  cohort: string;
  size: number;
  week0: number;
  week1: number;
  week2: number;
  week3: number;
  week4: number;
};

export type CohortAnalysis = {
  projectId: string;
  cohorts: CohortRow[];
};

export type ExportReportFormat = 'csv' | 'json' | 'pdf';

export type ExportReportPayload = {
  format: ExportReportFormat;
  sections: AnalyticsSection[];
  dateFrom: string;
  dateTo: string;
};

export type ExportReportResult = {
  reportId: string;
  downloadUrl: string;
  expiresAt: string;
};
