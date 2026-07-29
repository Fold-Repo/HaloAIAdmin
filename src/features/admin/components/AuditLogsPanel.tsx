import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatRelativeDate } from '@/features/creator/utils/creator.utils';
import type { AuditLogEntry } from '@/types';

const LEVEL_VARIANTS: Record<AuditLogEntry['level'], 'secondary' | 'warning' | 'destructive'> = {
  info: 'secondary',
  warning: 'warning',
  critical: 'destructive',
};

export function AuditLogsPanel({ logs }: { logs: AuditLogEntry[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Audit logs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="rounded-lg border p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={LEVEL_VARIANTS[log.level]}>{log.level}</Badge>
                <span className="text-muted-foreground text-xs">
                  {formatRelativeDate(log.createdAt)}
                </span>
              </div>
              <p className="mt-2 text-sm">
                <span className="font-medium">{log.actor}</span> — {log.action}
              </p>
              <p className="text-muted-foreground mt-1 font-mono text-xs">{log.resource}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
