import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { GPU_STATUS_LABELS } from '@/features/rendering/utils/rendering.utils';
import type { GpuNode } from '@/types';

function statusVariant(status: GpuNode['status']) {
  switch (status) {
    case 'available':
      return 'success' as const;
    case 'busy':
      return 'warning' as const;
    case 'overheated':
      return 'destructive' as const;
    default:
      return 'outline' as const;
  }
}

export function GpuStatusPanel({ gpus }: { gpus: GpuNode[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {gpus.map((gpu) => (
        <Card key={gpu.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle className="text-base">{gpu.name}</CardTitle>
                <p className="text-muted-foreground text-xs">{gpu.model}</p>
              </div>
              <Badge variant={statusVariant(gpu.status)}>{GPU_STATUS_LABELS[gpu.status]}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span>Utilization</span>
                <span>{gpu.utilization}%</span>
              </div>
              <Progress value={gpu.utilization} />
            </div>
            <p className="text-sm">
              VRAM {gpu.memoryUsedGb} / {gpu.memoryTotalGb} GB
            </p>
            <p className="text-muted-foreground text-xs">
              {gpu.temperatureC > 0 ? `${gpu.temperatureC}°C` : 'Offline'}
              {gpu.assignedJobId ? ` · Job ${gpu.assignedJobId}` : ''}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
