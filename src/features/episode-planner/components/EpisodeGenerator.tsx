import { zodResolver } from '@hookform/resolvers/zod';
import { Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGenerateEpisodes } from '@/features/episode-planner/hooks/useEpisodePlanner';
import {
  generateEpisodesSchema,
  type GenerateEpisodesFormValues,
} from '@/features/episode-planner/schemas/episode-planner.schemas';

type EpisodeGeneratorProps = {
  projectId: string;
};

export function EpisodeGenerator({ projectId }: EpisodeGeneratorProps) {
  const mutation = useGenerateEpisodes(projectId);

  const form = useForm<GenerateEpisodesFormValues>({
    resolver: zodResolver(generateEpisodesSchema),
    defaultValues: {
      count: 3,
      targetRuntimeSec: 60,
      useStoryBible: true,
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="size-4" />
          Episode generator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4 md:grid-cols-4"
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        >
          <div className="space-y-2">
            <Label htmlFor="count">Episode count</Label>
            <Input id="count" type="number" {...form.register('count')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetRuntimeSec">Target runtime (sec)</Label>
            <Input id="targetRuntimeSec" type="number" {...form.register('targetRuntimeSec')} />
          </div>
          <label className="flex items-end gap-2 pb-2 text-sm">
            <input type="checkbox" {...form.register('useStoryBible')} />
            Use story bible
          </label>
          <div className="flex items-end">
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? 'Generating...' : 'Generate episodes'}
            </Button>
          </div>
        </form>
        <p className="text-muted-foreground mt-3 text-xs">
          Runs the Episode Splitter step from the automation pipeline: AI Script → episodes →
          scenes.
        </p>
      </CardContent>
    </Card>
  );
}
