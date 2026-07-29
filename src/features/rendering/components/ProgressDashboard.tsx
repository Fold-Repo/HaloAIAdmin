import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  QUEUE_HEALTH_LABELS,
  formatRenderTime,
} from '@/features/rendering/utils/rendering.utils';
import type { RenderingOverview } from '@/types';

function healthVariant(health: RenderingOverview['queueHealth']) {
  switch (health) {
    case 'healthy':
      return 'success' as const;
    case 'degraded':
      return 'warning' as const;
    case 'critical':
      return 'destructive' as const;
  }
}

export function ProgressDashboard({ overview }: { overview: RenderingOverview }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Queue health</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={healthVariant(overview.queueHealth)}>
              {QUEUE_HEALTH_LABELS[overview.queueHealth]}
            </Badge>
            <Progress className="mt-3" value={overview.overallProgress} />
            <p className="text-muted-foreground mt-2 text-xs">
              {overview.overallProgress}% average job progress
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{overview.activeJobs}</p>
            <p className="text-muted-foreground mt-1 text-xs">
              {overview.queuedJobs} queued
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{overview.completedToday}</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Avg render {formatRenderTime(overview.avgRenderTimeSec)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failures / retries</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{overview.failedJobs}</p>
            <p className="text-muted-foreground mt-1 text-xs">
              {overview.retryPending} pending retry
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
