import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricLineChart } from '@/features/analytics/components/MetricLineChart';
import { formatUsd } from '@/features/analytics/utils/analytics.utils';
import type { CostMetrics } from '@/types';

type CostMetricsPanelProps = {
  title: string;
  metrics: CostMetrics;
};

export function CostMetricsPanel({ title, metrics }: CostMetricsPanelProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{formatUsd(metrics.totalUsd)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cost trend</CardTitle>
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
          <CardTitle className="text-base">Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.byCategory.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm">{item.label}</span>
                <span className="font-medium">{formatUsd(item.amountUsd)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
