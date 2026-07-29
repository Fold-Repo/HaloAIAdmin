import { Shield } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';

import { LoadingScreen, QueryError } from '@/components/common';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';
import { AdminNav, getAdminSectionMeta } from '@/features/admin/components/AdminNav';
import { AdminOverviewPanel } from '@/features/admin/components/AdminOverviewPanel';
import { AiUsageDashboardPanel } from '@/features/admin/components/AiUsageDashboardPanel';
import { AuditLogsPanel } from '@/features/admin/components/AuditLogsPanel';
import { CoinEconomyPanel } from '@/features/admin/components/CoinEconomyPanel';
import { CreatorManagementPanel } from '@/features/admin/components/CreatorManagementPanel';
import { FeatureFlagsPanel } from '@/features/admin/components/FeatureFlagsPanel';
import { ModerationQueuePanel } from '@/features/admin/components/ModerationQueuePanel';
import { ReportsPanel } from '@/features/admin/components/ReportsPanel';
import { RewardedAdsDashboardPanel } from '@/features/admin/components/RewardedAdsDashboardPanel';
import { SubscriptionDashboardPanel } from '@/features/admin/components/SubscriptionDashboardPanel';
import { SystemHealthPanel } from '@/features/admin/components/SystemHealthPanel';
import { UserManagementPanel } from '@/features/admin/components/UserManagementPanel';
import {
  useAdminAiUsage,
  useAdminAuditLogs,
  useAdminCoinEconomy,
  useAdminCreators,
  useAdminFeatureFlags,
  useAdminOverview,
  useAdminReports,
  useAdminRewardedAds,
  useAdminSubscriptions,
  useAdminSystemHealth,
  useAdminUsers,
  useModerationQueue,
} from '@/features/admin/hooks/useAdminPortal';
import { getAdminPath, isAdminSection } from '@/features/admin/utils/admin.utils';
import { combineQueryState } from '@/utils';

export function AdminPortalPage() {
  const { section = 'overview' } = useParams();
  const overviewQuery = useAdminOverview();
  const usersQuery = useAdminUsers();
  const creatorsQuery = useAdminCreators();
  const moderationQuery = useModerationQueue();
  const aiUsageQuery = useAdminAiUsage();
  const subscriptionsQuery = useAdminSubscriptions();
  const rewardedAdsQuery = useAdminRewardedAds();
  const coinsQuery = useAdminCoinEconomy();
  const reportsQuery = useAdminReports();
  const auditLogsQuery = useAdminAuditLogs();
  const featureFlagsQuery = useAdminFeatureFlags();
  const systemHealthQuery = useAdminSystemHealth();

  if (!isAdminSection(section)) {
    return <Navigate to={getAdminPath('overview')} replace />;
  }

  const activeQueries = [
    ...(section === 'overview' ? [overviewQuery] : []),
    ...(section === 'users' ? [usersQuery] : []),
    ...(section === 'creators' ? [creatorsQuery] : []),
    ...(section === 'moderation' ? [moderationQuery] : []),
    ...(section === 'ai-usage' ? [aiUsageQuery] : []),
    ...(section === 'subscriptions' ? [subscriptionsQuery] : []),
    ...(section === 'rewarded-ads' ? [rewardedAdsQuery] : []),
    ...(section === 'coins' ? [coinsQuery] : []),
    ...(section === 'reports' ? [reportsQuery] : []),
    ...(section === 'audit-logs' ? [auditLogsQuery] : []),
    ...(section === 'feature-flags' ? [featureFlagsQuery] : []),
    ...(section === 'system-health' ? [systemHealthQuery] : []),
  ];
  const queryState = combineQueryState(activeQueries);

  if (queryState.isLoading) {
    return <LoadingScreen message="Loading admin portal..." />;
  }

  if (queryState.isError) {
    return (
      <QueryError
        title="Unable to load admin data"
        message={queryState.error?.message ?? 'Something went wrong while loading admin data.'}
        onRetry={() => void queryState.refetch()}
      />
    );
  }

  const sectionMeta = getAdminSectionMeta(section);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-muted-foreground mb-1 flex items-center gap-2 text-sm">
          <Shield className="size-4" />
          Admin Portal
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{sectionMeta.label}</h1>
        <p className="text-muted-foreground mt-1">{sectionMeta.description}</p>
      </div>

      <AdminNav />

      <div className="flex justify-end">
        <Button asChild variant="outline" size="sm">
          <Link to={ROUTES.TUTORIAL}>Studio Tutorial</Link>
        </Button>
      </div>

      {section === 'overview' && overviewQuery.data && (
        <AdminOverviewPanel overview={overviewQuery.data} />
      )}

      {section === 'users' && usersQuery.data && (
        <UserManagementPanel users={usersQuery.data} />
      )}

      {section === 'creators' && creatorsQuery.data && (
        <CreatorManagementPanel creators={creatorsQuery.data} />
      )}

      {section === 'moderation' && moderationQuery.data && (
        <ModerationQueuePanel items={moderationQuery.data} />
      )}

      {section === 'ai-usage' && aiUsageQuery.data && (
        <AiUsageDashboardPanel metrics={aiUsageQuery.data} />
      )}

      {section === 'subscriptions' && subscriptionsQuery.data && (
        <SubscriptionDashboardPanel metrics={subscriptionsQuery.data} />
      )}

      {section === 'rewarded-ads' && rewardedAdsQuery.data && (
        <RewardedAdsDashboardPanel metrics={rewardedAdsQuery.data} />
      )}

      {section === 'coins' && coinsQuery.data && (
        <CoinEconomyPanel metrics={coinsQuery.data} />
      )}

      {section === 'reports' && reportsQuery.data && (
        <ReportsPanel reports={reportsQuery.data} />
      )}

      {section === 'audit-logs' && auditLogsQuery.data && (
        <AuditLogsPanel logs={auditLogsQuery.data} />
      )}

      {section === 'feature-flags' && featureFlagsQuery.data && (
        <FeatureFlagsPanel flags={featureFlagsQuery.data} />
      )}

      {section === 'system-health' && systemHealthQuery.data && (
        <SystemHealthPanel health={systemHealthQuery.data} />
      )}
    </div>
  );
}
