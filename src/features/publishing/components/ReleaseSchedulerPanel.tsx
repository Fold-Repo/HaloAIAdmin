import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useScheduleRelease } from '@/features/publishing/hooks/usePublishing';
import {
  scheduleReleaseSchema,
  type ScheduleReleaseFormValues,
} from '@/features/publishing/schemas/publishing.schemas';
import { formatScheduleDate } from '@/features/publishing/utils/publishing.utils';
import type { ReleaseScheduleItem } from '@/types';

type ReleaseSchedulerPanelProps = {
  projectId: string;
  schedule: ReleaseScheduleItem[];
};

export function ReleaseSchedulerPanel({ projectId, schedule }: ReleaseSchedulerPanelProps) {
  const scheduleRelease = useScheduleRelease(projectId);

  const form = useForm<ScheduleReleaseFormValues>({
    resolver: zodResolver(scheduleReleaseSchema),
    defaultValues: {
      episodeId: 'ep-1',
      scheduledAt: '',
      timezone: 'Africa/Lagos',
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Schedule release</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={form.handleSubmit((values) => scheduleRelease.mutate(values))}
          >
            <div className="space-y-2">
              <Label htmlFor="episodeId">Episode</Label>
              <select
                id="episodeId"
                className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm"
                {...form.register('episodeId')}
              >
                <option value="ep-1">Episode 1 — The Alley</option>
                <option value="ep-2">Episode 2 — Shadows</option>
                <option value="ep-3">Episode 3 — Reckoning</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduledAt">Release date</Label>
              <Input id="scheduledAt" type="datetime-local" {...form.register('scheduledAt')} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" {...form.register('timezone')} />
            </div>
            <Button type="submit" disabled={scheduleRelease.isPending}>
              <CalendarPlus className="size-4" />
              {scheduleRelease.isPending ? 'Scheduling...' : 'Add to schedule'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Release schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {schedule.length === 0 ? (
            <p className="text-muted-foreground rounded-lg border border-dashed px-4 py-10 text-center text-sm">
              No releases scheduled yet.
            </p>
          ) : (
            <div className="space-y-3">
              {schedule.map((item) => (
                <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{item.episodeTitle}</p>
                    <p className="text-muted-foreground text-xs">
                      {formatScheduleDate(item.scheduledAt, item.timezone)} · {item.timezone}
                    </p>
                  </div>
                  <Badge variant={item.status === 'scheduled' ? 'warning' : 'success'}>
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
