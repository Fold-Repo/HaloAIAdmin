import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatPercent } from '@/features/analytics/utils/analytics.utils';
import type { CompletionMetrics } from '@/types';

export function CompletionRatePanel({ metrics }: { metrics: CompletionMetrics }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Overall completion rate</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{formatPercent(metrics.overallRate)}</p>
          <Progress className="mt-3" value={metrics.overallRate} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Completion by episode</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {metrics.byEpisode.map((episode) => (
            <div key={episode.episodeId} className="rounded-lg border p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{episode.title}</p>
                <p className="text-sm font-semibold">{formatPercent(episode.rate)}</p>
              </div>
              <Progress value={episode.rate} />
              <p className="text-muted-foreground mt-2 text-xs">
                Avg drop-off at {episode.dropOffSec}s
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
