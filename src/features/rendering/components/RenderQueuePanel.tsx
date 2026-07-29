import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useCancelRenderJob } from '@/features/rendering/hooks/useRendering';
import {
  RENDER_JOB_STATUS_LABELS,
  formatDuration,
} from '@/features/rendering/utils/rendering.utils';
import { formatRelativeDate } from '@/features/creator/utils/creator.utils';
import type { RenderJob } from '@/types';

function statusVariant(status: RenderJob['status']) {
  switch (status) {
    case 'completed':
      return 'success' as const;
    case 'processing':
    case 'encoding':
    case 'retrying':
      return 'warning' as const;
    case 'failed':
      return 'destructive' as const;
    case 'queued':
    case 'pending':
      return 'secondary' as const;
    default:
      return 'outline' as const;
  }
}

type RenderQueuePanelProps = {
  projectId: string;
  jobs: RenderJob[];
};

export function RenderQueuePanel({ projectId, jobs }: RenderQueuePanelProps) {
  const cancelJob = useCancelRenderJob(projectId);
  const activeJobs = jobs.filter((job) => job.status !== 'completed' && job.status !== 'failed');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Render queue</CardTitle>
      </CardHeader>
      <CardContent>
        {activeJobs.length === 0 ? (
          <p className="text-muted-foreground rounded-lg border border-dashed px-4 py-10 text-center text-sm">
            No jobs in the render queue.
          </p>
        ) : (
          <div className="space-y-3">
            {activeJobs.map((job) => (
              <div key={job.id} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{job.episodeTitle}</p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {job.resolution} · {job.outputFormat.toUpperCase()} ·{' '}
                      {formatDuration(job.durationSec)} · Priority {job.priority}
                    </p>
                  </div>
                  <Badge variant={statusVariant(job.status)}>
                    {RENDER_JOB_STATUS_LABELS[job.status]}
                  </Badge>
                </div>
                {job.progress > 0 && (
                  <div className="mt-3 space-y-1">
                    <Progress value={job.progress} />
                    <p className="text-muted-foreground text-xs">{job.progress}%</p>
                  </div>
                )}
                <div className="text-muted-foreground mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span>
                    {job.workerId ? `Worker ${job.workerId}` : 'Unassigned'} ·{' '}
                    {formatRelativeDate(job.createdAt)}
                  </span>
                  {!['completed', 'failed'].includes(job.status) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={cancelJob.isPending}
                      onClick={() => cancelJob.mutate({ jobId: job.id })}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
