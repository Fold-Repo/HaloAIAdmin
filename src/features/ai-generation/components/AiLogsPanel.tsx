import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatRelativeDate } from '@/features/creator/utils/creator.utils';
import type { AiLogEntry } from '@/types';

const LEVEL_VARIANTS: Record<AiLogEntry['level'], 'secondary' | 'success' | 'warning' | 'destructive'> = {
  info: 'secondary',
  success: 'success',
  warning: 'warning',
  error: 'destructive',
};

export function AiLogsPanel({ logs }: { logs: AiLogEntry[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">AI logs</CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-muted-foreground rounded-lg border border-dashed px-4 py-10 text-center text-sm">
            No AI logs yet. Run an agent to see execution history.
          </p>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="rounded-lg border p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={LEVEL_VARIANTS[log.level]}>{log.level}</Badge>
                  <Badge variant="outline">{log.agentId}</Badge>
                  <span className="text-muted-foreground text-xs">
                    {formatRelativeDate(log.createdAt)}
                  </span>
                </div>
                <p className="mt-2 text-sm">{log.message}</p>
                {log.metadata && (
                  <p className="text-muted-foreground mt-1 text-xs">
                    {Object.entries(log.metadata)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join(' · ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
