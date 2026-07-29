import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatRenderTime } from '@/features/rendering/utils/rendering.utils';
import type { QueueMetrics } from '@/types';

export function QueueMonitoringPanel({ metrics }: { metrics: QueueMetrics }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Queue depth</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{metrics.queueDepth}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Throughput</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{metrics.throughputPerHour}/hr</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg wait</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatRenderTime(metrics.avgWaitTimeSec)}</p>
            <p className="text-muted-foreground mt-1 text-xs">
              p95 {formatRenderTime(metrics.p95WaitTimeSec)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Workers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{metrics.activeWorkers}</p>
            <p className="text-muted-foreground mt-1 text-xs">
              {metrics.idleWorkers} idle · {metrics.failedLast24h} failed (24h)
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Queue samples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {metrics.samples.map((sample) => (
              <div
                key={sample.timestamp}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
              >
                <span className="text-muted-foreground text-xs">
                  {new Date(sample.timestamp).toLocaleTimeString()}
                </span>
                <div className="flex gap-2">
                  <Badge variant="secondary">depth {sample.depth}</Badge>
                  <Badge variant="outline">{sample.throughput}/hr</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
