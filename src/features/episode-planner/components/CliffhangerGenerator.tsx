import { zodResolver } from '@hookform/resolvers/zod';
import { Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGenerateCliffhanger } from '@/features/episode-planner/hooks/useEpisodePlanner';
import {
  cliffhangerGeneratorSchema,
  type CliffhangerGeneratorFormValues,
} from '@/features/episode-planner/schemas/episode-planner.schemas';

type CliffhangerGeneratorProps = {
  projectId: string;
  episodeId: string;
  onGenerated: (text: string) => void;
};

export function CliffhangerGenerator({
  projectId,
  episodeId,
  onGenerated,
}: CliffhangerGeneratorProps) {
  const mutation = useGenerateCliffhanger(projectId, episodeId);

  const form = useForm<CliffhangerGeneratorFormValues>({
    resolver: zodResolver(cliffhangerGeneratorSchema),
    defaultValues: { tone: 'suspenseful' },
  });

  const onSubmit = form.handleSubmit((values) => {
    mutation.mutate(values, {
      onSuccess: (response) => onGenerated(response.data.text),
    });
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="size-4" />
          Cliffhanger generator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-3 sm:flex-row" onSubmit={onSubmit}>
          <div className="flex-1 space-y-2">
            <Label htmlFor="tone">Tone</Label>
            <Input id="tone" placeholder="suspenseful, emotional, shocking..." {...form.register('tone')} />
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Generating...' : 'Generate cliffhanger'}
            </Button>
          </div>
        </form>
        {mutation.data && (
          <p className="bg-muted mt-3 rounded-md p-3 text-sm">{mutation.data.data.text}</p>
        )}
      </CardContent>
    </Card>
  );
}
