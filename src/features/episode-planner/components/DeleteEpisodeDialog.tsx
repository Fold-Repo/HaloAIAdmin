import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDeleteEpisode } from '@/features/episode-planner/hooks/useEpisodePlanner';
import { getEpisodePlannerPath } from '@/features/episode-planner/utils/episode-planner.utils';

type DeleteEpisodeDialogProps = {
  projectId: string;
  episodeId: string;
  episodeNumber: number;
  episodeTitle: string;
  /** Compact icon trigger for list cards */
  variant?: 'button' | 'icon';
  /** Navigate to episode list after delete (detail page) */
  navigateAway?: boolean;
};

export function DeleteEpisodeDialog({
  projectId,
  episodeId,
  episodeNumber,
  episodeTitle,
  variant = 'button',
  navigateAway = false,
}: DeleteEpisodeDialogProps) {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const navigate = useNavigate();
  const deleteEpisode = useDeleteEpisode(projectId);

  const canDelete = confirmation.trim() === 'delete';
  const errorMessage = deleteEpisode.error?.message;

  const handleDelete = async () => {
    if (!canDelete) return;
    await deleteEpisode.mutateAsync({ episodeId, confirmation: confirmation.trim() });
    setOpen(false);
    if (navigateAway) {
      navigate(getEpisodePlannerPath(projectId));
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setConfirmation('');
          deleteEpisode.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        {variant === 'icon' ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            aria-label={`Delete episode ${episodeNumber}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Trash2 className="size-4" />
          </Button>
        ) : (
          <Button type="button" variant="destructive">
            <Trash2 className="size-4" />
            Delete episode
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>
            Delete episode {episodeNumber}: “{episodeTitle}”?
          </DialogTitle>
          <DialogDescription asChild>
            <div className="text-muted-foreground space-y-3 text-sm">
              <p className="text-destructive font-medium">Warning: this cannot be recovered.</p>
              <p>
                Permanently deletes this episode, its scenes, scene videos, assembled/uploaded
                video, and mobile watch progress for this episode number.
              </p>
              <p>
                Type <span className="text-foreground font-mono font-semibold">delete</span> below
                to confirm.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor={`delete-episode-${episodeId}`}>Confirmation</Label>
          <Input
            id={`delete-episode-${episodeId}`}
            autoComplete="off"
            placeholder="delete"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            disabled={deleteEpisode.isPending}
          />
        </div>

        {errorMessage ? <p className="text-destructive text-sm">{errorMessage}</p> : null}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={deleteEpisode.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!canDelete || deleteEpisode.isPending}
            onClick={() => void handleDelete()}
          >
            {deleteEpisode.isPending ? 'Deleting…' : 'Delete forever'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
