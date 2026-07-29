import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RENDER_JOB_STATUS_LABELS } from '@/features/rendering/utils/rendering.utils';
import type { FfmpegJobDetail } from '@/types';

function statusVariant(status: FfmpegJobDetail['status']) {
  switch (status) {
    case 'encoding':
    case 'processing':
      return 'warning' as const;
    case 'completed':
      return 'success' as const;
    case 'failed':
      return 'destructive' as const;
    default:
      return 'secondary' as const;
  }
}

export function FfmpegJobPanel({ jobs }: { jobs: FfmpegJobDetail[] }) {
  return (
    <div className="space-y-4">
      {jobs.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-10 text-center text-sm">
            No active FFmpeg jobs.
          </CardContent>
        </Card>
      ) : (
        jobs.map((job) => (
          <Card key={job.jobId}>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">{job.episodeTitle}</CardTitle>
                  <p className="text-muted-foreground mt-1 font-mono text-xs">{job.jobId}</p>
                </div>
                <Badge variant={statusVariant(job.status)}>
                  {RENDER_JOB_STATUS_LABELS[job.status]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Progress value={job.progress} />
                <p className="text-muted-foreground mt-1 text-xs">
                  {job.progress}%
                  {job.currentFrame && job.totalFrames
                    ? ` · frame ${job.currentFrame}/${job.totalFrames}`
                    : ''}
                  {job.fps ? ` · ${job.fps} fps` : ''}
                  {job.speed ? ` · ${job.speed}` : ''}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground mb-1 text-xs font-medium">Codec / bitrate</p>
                  <p className="text-sm">
                    {job.codec} · {job.bitrate}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1 text-xs font-medium">Output</p>
                  <p className="font-mono text-sm">{job.outputFile}</p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground mb-1 text-xs font-medium">Command</p>
                <pre className="bg-muted overflow-x-auto rounded-md p-3 text-xs whitespace-pre-wrap">
                  {job.command}
                </pre>
              </div>
              <div>
                <p className="text-muted-foreground mb-1 text-xs font-medium">Log tail</p>
                <pre className="bg-muted overflow-x-auto rounded-md p-3 font-mono text-xs">
                  {job.logTail.join('\n')}
                </pre>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
