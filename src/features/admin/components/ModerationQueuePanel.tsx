import { Check, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useModerationAction } from '@/features/admin/hooks/useAdminPortal';
import { formatRelativeDate } from '@/features/creator/utils/creator.utils';
import type { ModerationItem } from '@/types';

export function ModerationQueuePanel({ items }: { items: ModerationItem[] }) {
  const moderate = useModerationAction();
  const pending = items.filter((item) => item.status === 'pending');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Moderation queue</CardTitle>
      </CardHeader>
      <CardContent>
        {pending.length === 0 ? (
          <p className="text-muted-foreground rounded-lg border border-dashed px-4 py-10 text-center text-sm">
            No items awaiting moderation.
          </p>
        ) : (
          <div className="space-y-3">
            {pending.map((item) => (
              <div key={item.id} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {item.contentType} · {item.creatorName} ·{' '}
                      {formatRelativeDate(item.flaggedAt)}
                    </p>
                  </div>
                  <Badge variant="warning">Pending</Badge>
                </div>
                <p className="mt-3 text-sm">{item.reason}</p>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    disabled={moderate.isPending}
                    onClick={() => moderate.mutate({ itemId: item.id, action: 'approve' })}
                  >
                    <Check className="size-3" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={moderate.isPending}
                    onClick={() => moderate.mutate({ itemId: item.id, action: 'reject' })}
                  >
                    <X className="size-3" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
