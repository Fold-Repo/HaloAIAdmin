import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateScene } from '@/features/episode-planner/hooks/useEpisodePlanner';
import {
  sceneFormSchema,
  type SceneFormValues,
} from '@/features/episode-planner/schemas/episode-planner.schemas';

type ScenePlannerProps = {
  projectId: string;
  episodeId: string;
};

export function ScenePlanner({ projectId, episodeId }: ScenePlannerProps) {
  const createScene = useCreateScene(projectId, episodeId);

  const form = useForm<SceneFormValues>({
    resolver: zodResolver(sceneFormSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      characters: '',
      durationSec: 15,
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    createScene.mutate(values, {
      onSuccess: () => form.reset(),
    });
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Scene planner</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="scene-title">Scene title</Label>
            <Input id="scene-title" {...form.register('title')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="scene-duration">Duration (sec)</Label>
            <Input id="scene-duration" type="number" {...form.register('durationSec')} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="scene-description">Description</Label>
            <Textarea id="scene-description" rows={3} {...form.register('description')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="scene-location">Location</Label>
            <Input id="scene-location" {...form.register('location')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="scene-characters">Characters (comma-separated)</Label>
            <Input id="scene-characters" {...form.register('characters')} />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={createScene.isPending}>
              {createScene.isPending ? 'Adding scene...' : 'Add scene'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
