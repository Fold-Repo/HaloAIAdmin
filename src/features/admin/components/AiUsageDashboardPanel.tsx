import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricLineChart } from '@/features/analytics/components/MetricLineChart';
import { formatNumber, formatUsd } from '@/features/admin/utils/admin.utils';
import type { AiUsageMetrics } from '@/types';

export function AiUsageDashboardPanel({ metrics }: { metrics: AiUsageMetrics }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatNumber(metrics.totalTokens)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total cost</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatUsd(metrics.totalCostUsd)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Requests (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatNumber(metrics.requests24h)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daily AI spend</CardTitle>
        </CardHeader>
        <CardContent>
          <MetricLineChart
            data={metrics.series}
            valueFormatter={(value) => formatUsd(value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">By agent</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {metrics.byAgent.map((agent) => (
            <div key={agent.agent} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">{agent.agent}</p>
                <p className="text-muted-foreground text-xs">
                  {formatNumber(agent.requests)} requests
                </p>
              </div>
              <span className="font-medium">{formatUsd(agent.costUsd)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
