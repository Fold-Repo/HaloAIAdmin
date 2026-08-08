import { useState } from 'react';
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
import { useDeleteProject } from '@/features/creator/hooks/useCreatorMutations';

type DeleteProjectDialogProps = {
  projectId: string;
  projectTitle: string;
};

export function DeleteProjectDialog({ projectId, projectTitle }: DeleteProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const deleteProject = useDeleteProject(projectId);

  const canDelete = confirmation.trim() === 'delete';
  const errorMessage = deleteProject.error?.message;

  const handleDelete = async () => {
    if (!canDelete) return;
    await deleteProject.mutateAsync(confirmation.trim());
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setConfirmation('');
          deleteProject.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="size-4" />
          Delete project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete “{projectTitle}”?</DialogTitle>
          <DialogDescription asChild>
            <div className="text-muted-foreground space-y-3 text-sm">
              <p className="text-destructive font-medium">Warning: this cannot be recovered.</p>
              <p>
                Permanently deletes this project and all associated data — episodes, scenes, story
                bible, AI jobs, covers, uploaded/assembled videos, and mobile watchlist / progress
                for this title.
              </p>
              <p>
                Type <span className="text-foreground font-mono font-semibold">delete</span> below
                to confirm.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="delete-confirm">Confirmation</Label>
          <Input
            id="delete-confirm"
            autoComplete="off"
            placeholder="delete"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            disabled={deleteProject.isPending}
          />
        </div>

        {errorMessage ? <p className="text-destructive text-sm">{errorMessage}</p> : null}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={deleteProject.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!canDelete || deleteProject.isPending}
            onClick={() => void handleDelete()}
          >
            {deleteProject.isPending ? 'Deleting…' : 'Delete forever'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
