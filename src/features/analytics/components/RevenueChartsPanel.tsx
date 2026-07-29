import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricBarChart } from '@/features/analytics/components/MetricBarChart';
import { formatUsd } from '@/features/analytics/utils/analytics.utils';
import type { RevenueMetrics } from '@/types';

export function RevenueChartsPanel({ metrics }: { metrics: RevenueMetrics }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatUsd(metrics.totalUsd)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Premium</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatUsd(metrics.premiumUsd)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ads</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatUsd(metrics.adsUsd)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Coins</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatUsd(metrics.coinsUsd)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Revenue charts</CardTitle>
        </CardHeader>
        <CardContent>
          <MetricBarChart
            data={metrics.series}
            xKey="date"
            bars={[
              { dataKey: 'premium', fill: '#6366f1', name: 'Premium' },
              { dataKey: 'ads', fill: '#f59e0b', name: 'Ads' },
              { dataKey: 'coins', fill: '#10b981', name: 'Coins' },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
