import { useState } from 'react';
import { CheckCircle2, Circle, Rocket } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { usePublishProject } from '@/features/publishing/hooks/usePublishing';
import { PUBLISH_STATUS_LABELS } from '@/features/publishing/utils/publishing.utils';
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
  projectTitle: string;
  overview: PublishOverview;
};

export function PublishWizardPanel({ projectId, projectTitle, overview }: PublishWizardPanelProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const publishProject = usePublishProject(projectId);
  const episodeCount = overview.episodesWithVideo ?? 0;
  const errorMessage =
    publishProject.error &&
    typeof publishProject.error === 'object' &&
    'message' in publishProject.error
      ? String(publishProject.error.message)
      : null;

  const handleConfirm = async () => {
    try {
      await publishProject.mutateAsync({});
      setConfirmOpen(false);
    } catch {
      // The dialog stays open and shows the API message.
    }
  };

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
              onClick={() => setConfirmOpen(true)}
            >
              <Rocket className="size-4" />
              {publishProject.isPending ? 'Publishing...' : 'Publish now'}
            </Button>
            {overview.readyToPublish ? (
              <p className="text-muted-foreground mt-2 text-xs">
                {episodeCount} episode{episodeCount === 1 ? '' : 's'} with video can be published.
                Uploaded and generated episodes are both included.
              </p>
            ) : (
              <p className="text-muted-foreground mt-2 text-xs">
                Upload or generate at least one episode video before publishing.
              </p>
            )}
            {publishProject.data && (
              <p className="text-muted-foreground mt-2 text-xs">
                {publishProject.data.data.message}
              </p>
            )}
            {errorMessage && !confirmOpen ? (
              <p className="text-destructive mt-2 text-xs">{errorMessage}</p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={confirmOpen}
        onOpenChange={(next) => {
          if (publishProject.isPending) return;
          setConfirmOpen(next);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Are you sure you want to publish?</DialogTitle>
            <DialogDescription>
              “{projectTitle}” will go live on the catalog. {episodeCount} episode
              {episodeCount === 1 ? '' : 's'} with a video — uploaded or generated — will be
              published. Episodes without a video stay unpublished.
            </DialogDescription>
          </DialogHeader>
          {errorMessage ? <p className="text-destructive text-sm">{errorMessage}</p> : null}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={publishProject.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void handleConfirm()}
              disabled={publishProject.isPending}
            >
              {publishProject.isPending ? 'Publishing...' : 'Yes, publish'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
