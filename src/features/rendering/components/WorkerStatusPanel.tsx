import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  WORKER_STATUS_LABELS,
} from '@/features/rendering/utils/rendering.utils';
import { formatRelativeDate } from '@/features/creator/utils/creator.utils';
import type { RenderWorker } from '@/types';

function statusVariant(status: RenderWorker['status']) {
  switch (status) {
    case 'online':
      return 'success' as const;
    case 'busy':
      return 'warning' as const;
    case 'draining':
      return 'secondary' as const;
    default:
      return 'outline' as const;
  }
}

export function WorkerStatusPanel({ workers }: { workers: RenderWorker[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {workers.map((worker) => (
        <Card key={worker.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-base">{worker.name}</CardTitle>
              <Badge variant={statusVariant(worker.status)}>
                {WORKER_STATUS_LABELS[worker.status]}
              </Badge>
            </div>
            <p className="text-muted-foreground text-xs">{worker.region}</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {worker.currentJobId && (
              <p className="text-sm">
                Current job: <span className="font-mono text-xs">{worker.currentJobId}</span>
              </p>
            )}
            <div className="space-y-2">
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span>CPU</span>
                  <span>{worker.cpuUsage}%</span>
                </div>
                <Progress value={worker.cpuUsage} />
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span>Memory</span>
                  <span>{worker.memoryUsage}%</span>
                </div>
                <Progress value={worker.memoryUsage} />
              </div>
            </div>
            <p className="text-muted-foreground text-xs">
              Queue depth {worker.queueDepth} · Last heartbeat{' '}
              {formatRelativeDate(worker.lastHeartbeat)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
