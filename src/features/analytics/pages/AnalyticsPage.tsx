import { BarChart3 } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';

import { EmptyState, LoadingScreen, QueryError } from '@/components/common';
import { Button } from '@/components/ui/button';
import { AnalyticsDashboard } from '@/features/analytics/components/AnalyticsDashboard';
import {
  AnalyticsNav,
  getAnalyticsSectionMeta,
} from '@/features/analytics/components/AnalyticsNav';
import { CohortAnalysisPanel } from '@/features/analytics/components/CohortAnalysisPanel';
import { CompletionRatePanel } from '@/features/analytics/components/CompletionRatePanel';
import { CostMetricsPanel } from '@/features/analytics/components/CostMetricsPanel';
import { CreatorEarningsPanel } from '@/features/analytics/components/CreatorEarningsPanel';
import { ExportReportsPanel } from '@/features/analytics/components/ExportReportsPanel';
import { RetentionPanel } from '@/features/analytics/components/RetentionPanel';
import { RevenueChartsPanel } from '@/features/analytics/components/RevenueChartsPanel';
import { UserGrowthPanel } from '@/features/analytics/components/UserGrowthPanel';
import { WatchTimePanel } from '@/features/analytics/components/WatchTimePanel';
import {
  useAiCostMetrics,
  useAnalyticsOverview,
  useCohortAnalysis,
  useCompletionMetrics,
  useCreatorEarnings,
  useGrowthMetrics,
  useRenderCostMetrics,
  useRetentionMetrics,
  useRevenueMetrics,
  useWatchTimeMetrics,
} from '@/features/analytics/hooks/useAnalytics';
import {
  getAnalyticsPath,
  isAnalyticsSection,
} from '@/features/analytics/utils/analytics.utils';
import { useProject } from '@/features/creator/hooks/useCreatorQueries';
import { ROUTES } from '@/constants';
import { combineQueryState } from '@/utils';

export function AnalyticsPage() {
  const { projectId = '', section = 'dashboard' } = useParams();
  const projectQuery = useProject(projectId);
  const overviewQuery = useAnalyticsOverview(projectId);
  const revenueQuery = useRevenueMetrics(projectId);
  const earningsQuery = useCreatorEarnings(projectId);
  const watchTimeQuery = useWatchTimeMetrics(projectId);
  const completionQuery = useCompletionMetrics(projectId);
  const aiCostQuery = useAiCostMetrics(projectId);
  const renderCostQuery = useRenderCostMetrics(projectId);
  const growthQuery = useGrowthMetrics(projectId);
  const retentionQuery = useRetentionMetrics(projectId);
  const cohortsQuery = useCohortAnalysis(projectId);

  if (!isAnalyticsSection(section)) {
    return <Navigate to={getAnalyticsPath(projectId, 'dashboard')} replace />;
  }

  const activeQueries = [
    projectQuery,
    ...(section === 'dashboard' ? [overviewQuery] : []),
    ...(section === 'revenue' ? [revenueQuery] : []),
    ...(section === 'earnings' ? [earningsQuery] : []),
    ...(section === 'watch-time' ? [watchTimeQuery] : []),
    ...(section === 'completion' ? [completionQuery] : []),
    ...(section === 'ai-cost' ? [aiCostQuery] : []),
    ...(section === 'render-cost' ? [renderCostQuery] : []),
    ...(section === 'growth' ? [growthQuery] : []),
    ...(section === 'retention' ? [retentionQuery] : []),
    ...(section === 'cohorts' ? [cohortsQuery] : []),
  ];
  const queryState = combineQueryState(activeQueries);

  if (queryState.isLoading) {
    return <LoadingScreen message="Loading analytics..." />;
  }

  if (queryState.isError) {
    return (
      <QueryError
        title="Unable to load analytics"
        message={queryState.error?.message ?? 'Something went wrong while loading analytics.'}
        onRetry={() => void queryState.refetch()}
      />
    );
  }

  const project = projectQuery.data;
  const sectionMeta = getAnalyticsSectionMeta(section);

  if (!project) {
    return (
      <EmptyState
        title="Analytics unavailable"
        description="We couldn't find this project."
        action={
          <Button asChild>
            <Link to={ROUTES.STUDIO.PROJECTS}>Back to projects</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-muted-foreground mb-1 flex items-center gap-2 text-sm">
            <BarChart3 className="size-4" />
            Analytics
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
          <p className="text-muted-foreground mt-1">{sectionMeta.description}</p>
        </div>
        <Button asChild variant="outline">
          <Link to={ROUTES.STUDIO.PROJECT_DETAIL.replace(':projectId', projectId)}>
            Back to project
          </Link>
        </Button>
      </div>

      <AnalyticsNav />

      {section === 'dashboard' && overviewQuery.data && (
        <AnalyticsDashboard overview={overviewQuery.data} />
      )}

      {section === 'revenue' && revenueQuery.data && (
        <RevenueChartsPanel metrics={revenueQuery.data} />
      )}

      {section === 'earnings' && earningsQuery.data && (
        <CreatorEarningsPanel earnings={earningsQuery.data} />
      )}

      {section === 'watch-time' && watchTimeQuery.data && (
        <WatchTimePanel metrics={watchTimeQuery.data} />
      )}

      {section === 'completion' && completionQuery.data && (
        <CompletionRatePanel metrics={completionQuery.data} />
      )}

      {section === 'ai-cost' && aiCostQuery.data && (
        <CostMetricsPanel title="AI cost" metrics={aiCostQuery.data} />
      )}

      {section === 'render-cost' && renderCostQuery.data && (
        <CostMetricsPanel title="Render cost" metrics={renderCostQuery.data} />
      )}

      {section === 'growth' && growthQuery.data && (
        <UserGrowthPanel metrics={growthQuery.data} />
      )}

      {section === 'retention' && retentionQuery.data && (
        <RetentionPanel metrics={retentionQuery.data} />
      )}

      {section === 'cohorts' && cohortsQuery.data && (
        <CohortAnalysisPanel analysis={cohortsQuery.data} />
      )}

      {section === 'export' && <ExportReportsPanel projectId={projectId} />}
    </div>
  );
}
