import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  formatChangePct,
  formatHours,
  formatNumber,
  formatPercent,
  formatUsd,
} from '@/features/analytics/utils/analytics.utils';
import type { AnalyticsOverview } from '@/types';

export function AnalyticsDashboard({ overview }: { overview: AnalyticsOverview }) {
  const cards = [
    { label: 'Total views', value: formatNumber(overview.totalViews), change: overview.viewsChangePct },
    { label: 'Revenue', value: formatUsd(overview.totalRevenueUsd), change: overview.revenueChangePct },
    { label: 'Watch time', value: formatHours(overview.totalWatchTimeHours), change: overview.watchTimeChangePct ?? 0 },
    { label: 'Completion rate', value: formatPercent(overview.avgCompletionRate), change: overview.completionChangePct ?? 0 },
    { label: 'AI cost', value: formatUsd(overview.totalAiCostUsd), change: overview.aiCostChangePct ?? 0 },
    { label: 'Render cost', value: formatUsd(overview.totalRenderCostUsd), change: overview.renderCostChangePct ?? 0 },
    { label: 'Active users', value: formatNumber(overview.activeUsers), change: overview.activeUsersChangePct ?? 0 },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{card.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{card.value}</p>
            <Badge variant={card.change >= 0 ? 'success' : 'secondary'} className="mt-2">
              {formatChangePct(card.change)} vs last period
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
