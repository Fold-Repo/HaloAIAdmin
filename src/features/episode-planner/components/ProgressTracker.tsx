import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  formatRuntime,
} from '@/features/episode-planner/utils/episode-planner.utils';
import type { EpisodePlannerSummary } from '@/types';

export function ProgressTracker({ summary }: { summary: EpisodePlannerSummary }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Overall progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-3xl font-bold">{summary.overallProgress}%</p>
          <Progress value={summary.overallProgress} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Episodes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">
            {summary.completedEpisodes}/{summary.totalEpisodes}
          </p>
          <p className="text-muted-foreground text-xs">completed</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Scenes planned</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">
            {summary.plannedScenes}/{summary.totalScenes}
          </p>
          <p className="text-muted-foreground text-xs">scenes ready for generation</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Runtime planned</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{formatRuntime(summary.totalRuntimeSec)}</p>
          <p className="text-muted-foreground text-xs">
            of {formatRuntime(summary.targetRuntimeSec)} target
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function RuntimeEstimator({
  estimatedSec,
  targetSec,
}: {
  estimatedSec: number;
  targetSec: number;
}) {
  const ratio = targetSec > 0 ? Math.min(100, Math.round((estimatedSec / targetSec) * 100)) : 0;
  const delta = estimatedSec - targetSec;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Runtime estimator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold">{formatRuntime(estimatedSec)}</p>
            <p className="text-muted-foreground text-xs">estimated from scenes</p>
          </div>
          <Badge variant={delta > 0 ? 'warning' : delta < 0 ? 'secondary' : 'success'}>
            Target {formatRuntime(targetSec)}
          </Badge>
        </div>
        <Progress value={ratio} />
        <p className="text-muted-foreground text-xs">
          {delta === 0
            ? 'Scene durations match the episode target.'
            : delta > 0
              ? `${formatRuntime(delta)} over target — trim scenes or reduce durations.`
              : `${formatRuntime(Math.abs(delta))} remaining — add scenes or extend beats.`}
        </p>
      </CardContent>
    </Card>
  );
}
