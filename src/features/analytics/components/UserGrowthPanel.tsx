import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricLineChart } from '@/features/analytics/components/MetricLineChart';
import { formatChangePct, formatNumber } from '@/features/analytics/utils/analytics.utils';
import type { GrowthMetrics } from '@/types';

export function UserGrowthPanel({ metrics }: { metrics: GrowthMetrics }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatNumber(metrics.totalUsers)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">New users (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatNumber(metrics.newUsers30d)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Growth rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatChangePct(metrics.growthRatePct)}</p>
            <Badge variant="success" className="mt-2">
              Trending up
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">User growth</CardTitle>
        </CardHeader>
        <CardContent>
          <MetricLineChart data={metrics.series} />
        </CardContent>
      </Card>
    </div>
  );
}
