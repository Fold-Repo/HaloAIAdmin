import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MetricLineChart } from '@/features/analytics/components/MetricLineChart';
import { formatHours, formatNumber } from '@/features/analytics/utils/analytics.utils';
import type { WatchTimeMetrics } from '@/types';

export function WatchTimePanel({ metrics }: { metrics: WatchTimeMetrics }) {
  const maxHours = Math.max(...metrics.byEpisode.map((episode) => episode.hours));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total watch time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatHours(metrics.totalHours)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg session</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{metrics.avgSessionMinutes.toFixed(1)} min</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Watch time trend</CardTitle>
        </CardHeader>
        <CardContent>
          <MetricLineChart data={metrics.series} valueFormatter={(value) => `${value} hrs`} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">By episode</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {metrics.byEpisode.map((episode) => (
            <div key={episode.episodeId}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{episode.title}</span>
                <span className="text-muted-foreground">
                  {formatHours(episode.hours)} · {formatNumber(episode.views)} views
                </span>
              </div>
              <Progress value={(episode.hours / maxHours) * 100} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
