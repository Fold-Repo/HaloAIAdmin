import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { AiJob, AiJobStatus, AiJobType } from '@/types';

const JOB_TYPE_LABELS: Record<AiJobType, string> = {
  script: 'Script AI',
  character: 'Character AI',
  video: 'Video AI',
  voice: 'Voice AI',
  subtitle: 'Subtitle AI',
  render: 'Render',
};

const JOB_STATUS_VARIANTS: Record<
  AiJobStatus,
  'secondary' | 'warning' | 'success' | 'destructive'
> = {
  queued: 'secondary',
  running: 'warning',
  completed: 'success',
  failed: 'destructive',
  cancelled: 'secondary',
};

export function AiJobStatusBadge({ status }: { status: AiJobStatus }) {
  return (
    <Badge variant={JOB_STATUS_VARIANTS[status]} className="capitalize">
      {status}
    </Badge>
  );
}

type AiJobStatusPanelProps = {
  jobs: AiJob[];
  compact?: boolean;
};

export function AiJobStatusPanel({ jobs, compact = false }: AiJobStatusPanelProps) {
  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="text-muted-foreground py-8 text-center text-sm">
          No active AI jobs. Start a project to kick off generation.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className={compact ? 'pb-3' : undefined}>
        <CardTitle className={compact ? 'text-base' : undefined}>AI job status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {jobs.map((job) => (
          <div key={job.id} className="space-y-2 rounded-lg border p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{job.projectTitle}</p>
                <p className="text-muted-foreground text-xs">{JOB_TYPE_LABELS[job.type]}</p>
              </div>
              <AiJobStatusBadge status={job.status} />
            </div>
            {job.message && (
              <p className="text-muted-foreground text-xs">{job.message}</p>
            )}
            {(job.status === 'running' || job.status === 'queued') && (
              <Progress value={job.progress} />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
