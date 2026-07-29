import { Bell } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PushNotificationPreview } from '@/types';

export function PushNotificationPreviewPanel({ preview }: { preview: PushNotificationPreview }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Push notification preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs font-medium">Title</p>
            <p>{preview.title}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-medium">Body</p>
            <p>{preview.body}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-medium">Deep link</p>
            <p className="font-mono text-xs break-all">{preview.deepLink}</p>
          </div>
          <Badge variant="outline">{preview.audience}</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Device preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mx-auto max-w-sm rounded-2xl border bg-zinc-950 p-4 text-white shadow-lg">
            <div className="mb-3 flex items-center gap-2 text-xs text-zinc-400">
              <Bell className="size-3" />
              Creator Studio · now
            </div>
            <div className="flex gap-3">
              {preview.imageUrl && (
                <div className="size-12 shrink-0 rounded-lg bg-zinc-800" aria-hidden />
              )}
              <div>
                <p className="text-sm font-semibold">{preview.title}</p>
                <p className="mt-1 text-xs text-zinc-300">{preview.body}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
