import { CheckCircle2, Circle, Rocket } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PUBLISH_STATUS_LABELS } from '@/features/publishing/utils/publishing.utils';
import { usePublishProject } from '@/features/publishing/hooks/usePublishing';
import type { PublishOverview } from '@/types';

function statusVariant(status: PublishOverview['publishStatus']) {
  switch (status) {
    case 'published':
      return 'success' as const;
    case 'ready':
    case 'scheduled':
      return 'warning' as const;
    case 'failed':
      return 'destructive' as const;
    default:
      return 'secondary' as const;
  }
}

type PublishWizardPanelProps = {
  projectId: string;
  overview: PublishOverview;
};

export function PublishWizardPanel({ projectId, overview }: PublishWizardPanelProps) {
  const publishProject = usePublishProject(projectId);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Publish status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={statusVariant(overview.publishStatus)}>
              {PUBLISH_STATUS_LABELS[overview.publishStatus]}
            </Badge>
            <Progress className="mt-3" value={overview.overallProgress} />
            <p className="text-muted-foreground mt-2 text-xs">
              {overview.overallProgress}% wizard complete
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Publish action</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              disabled={!overview.readyToPublish || publishProject.isPending}
              onClick={() => publishProject.mutate({})}
            >
              <Rocket className="size-4" />
              {publishProject.isPending ? 'Publishing...' : 'Publish now'}
            </Button>
            {!overview.readyToPublish && (
              <p className="text-muted-foreground mt-2 text-xs">
                Complete required wizard steps before publishing.
              </p>
            )}
            {publishProject.data && (
              <p className="text-muted-foreground mt-2 text-xs">
                {publishProject.data.data.message}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Publish wizard steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {overview.steps.map((step) => (
            <div key={step.id} className="flex items-start gap-3 rounded-lg border p-3">
              {step.completed ? (
                <CheckCircle2 className="mt-0.5 size-4 text-emerald-600" />
              ) : (
                <Circle className="text-muted-foreground mt-0.5 size-4" />
              )}
              <div>
                <p className="text-sm font-medium">{step.label}</p>
                <p className="text-muted-foreground text-xs">
                  {step.required ? 'Required' : 'Optional'}
                  {step.completed ? ' · Complete' : ' · Incomplete'}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
