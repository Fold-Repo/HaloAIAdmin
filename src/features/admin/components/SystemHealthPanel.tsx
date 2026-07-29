import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HEALTH_LABELS } from '@/features/admin/utils/admin.utils';
import type { SystemHealthStatus } from '@/types';

function statusVariant(status: SystemHealthStatus['overall'] | 'up' | 'degraded' | 'down') {
  switch (status) {
    case 'healthy':
    case 'up':
      return 'success' as const;
    case 'degraded':
      return 'warning' as const;
    case 'critical':
    case 'down':
      return 'destructive' as const;
    default:
      return 'secondary' as const;
  }
}

export function SystemHealthPanel({ health }: { health: SystemHealthStatus }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Overall status</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant={statusVariant(health.overall)}>{HEALTH_LABELS[health.overall]}</Badge>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {health.services.map((service) => (
          <Card key={service.name}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">{service.name}</CardTitle>
                <Badge variant={statusVariant(service.status)}>{HEALTH_LABELS[service.status]}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">{service.latencyMs}ms latency</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
