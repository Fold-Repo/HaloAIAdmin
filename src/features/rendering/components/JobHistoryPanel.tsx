import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    case 'failed':
      return 'destructive' as const;
    default:
      return 'outline' as const;
  }
}

export function JobHistoryPanel({ jobs }: { jobs: RenderJob[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Job history</CardTitle>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
          <p className="text-muted-foreground rounded-lg border border-dashed px-4 py-10 text-center text-sm">
            No completed or failed jobs yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-b text-left">
                  <th className="pb-2 font-medium">Episode</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Duration</th>
                  <th className="pb-2 font-medium">Retries</th>
                  <th className="pb-2 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-b last:border-0">
                    <td className="py-3">{job.episodeTitle}</td>
                    <td className="py-3">
                      <Badge variant={statusVariant(job.status)}>
                        {RENDER_JOB_STATUS_LABELS[job.status]}
                      </Badge>
                    </td>
                    <td className="py-3">{formatDuration(job.durationSec)}</td>
                    <td className="py-3">{job.retryCount}</td>
                    <td className="text-muted-foreground py-3">
                      {formatRelativeDate(job.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
