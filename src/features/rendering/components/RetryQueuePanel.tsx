import { RotateCcw } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRetryRenderJob } from '@/features/rendering/hooks/useRendering';
import { formatRelativeDate } from '@/features/creator/utils/creator.utils';
import type { RenderJob } from '@/types';

type RetryQueuePanelProps = {
  projectId: string;
  jobs: RenderJob[];
};

export function RetryQueuePanel({ projectId, jobs }: RetryQueuePanelProps) {
  const retryJob = useRetryRenderJob(projectId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Retry queue</CardTitle>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
          <p className="text-muted-foreground rounded-lg border border-dashed px-4 py-10 text-center text-sm">
            No failed jobs awaiting retry.
          </p>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div key={job.id} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{job.episodeTitle}</p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Attempt {job.retryCount + 1} of {job.maxRetries + 1} ·{' '}
                      {formatRelativeDate(job.createdAt)}
                    </p>
                  </div>
                  <Badge variant="destructive">Failed</Badge>
                </div>
                {job.errorMessage && (
                  <p className="bg-destructive/10 text-destructive mt-3 rounded-md p-2 text-xs">
                    {job.errorMessage}
                  </p>
                )}
                <div className="mt-3">
                  <Button
                    size="sm"
                    disabled={retryJob.isPending}
                    onClick={() => retryJob.mutate({ jobId: job.id })}
                  >
                    <RotateCcw className="size-3" />
                    Retry job
                  </Button>
                  {retryJob.data?.data.jobId === job.id && (
                    <p className="text-muted-foreground mt-2 text-xs">
                      {retryJob.data.data.message}
                    </p>
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
