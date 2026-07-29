import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MetricLineChart } from '@/features/analytics/components/MetricLineChart';
import { formatNumber, formatPercent, formatUsd } from '@/features/admin/utils/admin.utils';
import type { RewardedAdsMetrics } from '@/types';

export function RewardedAdsDashboardPanel({ metrics }: { metrics: RewardedAdsMetrics }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Impressions (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatNumber(metrics.impressions24h)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completions (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatNumber(metrics.completions24h)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatUsd(metrics.revenueUsd)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fill rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatPercent(metrics.fillRate)}</p>
            <Progress className="mt-3" value={metrics.fillRate} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ad revenue trend</CardTitle>
        </CardHeader>
        <CardContent>
          <MetricLineChart
            data={metrics.series}
            valueFormatter={(value) => formatUsd(value)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
