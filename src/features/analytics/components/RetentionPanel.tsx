import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MetricLineChart } from '@/features/analytics/components/MetricLineChart';
import { formatPercent } from '@/features/analytics/utils/analytics.utils';
import type { RetentionMetrics } from '@/types';

export function RetentionPanel({ metrics }: { metrics: RetentionMetrics }) {
  const summary = [
    { label: 'Day 1', value: metrics.day1 },
    { label: 'Day 7', value: metrics.day7 },
    { label: 'Day 30', value: metrics.day30 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {summary.map((item) => (
          <Card key={item.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{item.label} retention</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatPercent(item.value)}</p>
              <Progress className="mt-3" value={item.value} />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Retention curve</CardTitle>
        </CardHeader>
        <CardContent>
          <MetricLineChart
            data={metrics.series.map((point) => ({ date: point.period, value: point.rate }))}
            valueFormatter={(value) => formatPercent(value)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
