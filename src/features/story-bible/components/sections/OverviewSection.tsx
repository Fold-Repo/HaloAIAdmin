import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SectionShell } from '@/features/story-bible/components/SectionShell';
import { useUpdateStoryOverview } from '@/features/story-bible/hooks/useStoryBible';
import {
  storyOverviewSchema,
  type StoryOverviewFormValues,
} from '@/features/story-bible/schemas/story-bible.schemas';
import {
  formatThemesOutput,
  parseThemesInput,
} from '@/features/story-bible/utils/story-bible.utils';
import type { StoryOverview } from '@/types';

type OverviewSectionProps = {
  projectId: string;
  overview: StoryOverview;
};

export function OverviewSection({ projectId, overview }: OverviewSectionProps) {
  const mutation = useUpdateStoryOverview(projectId);

  const form = useForm<StoryOverviewFormValues>({
    resolver: zodResolver(storyOverviewSchema),
    defaultValues: {
      logline: overview.logline,
      synopsis: overview.synopsis,
      themes: formatThemesOutput(overview.themes),
      tone: overview.tone,
      targetAudience: overview.targetAudience,
    },
  });

  useEffect(() => {
    form.reset({
      logline: overview.logline,
      synopsis: overview.synopsis,
      themes: formatThemesOutput(overview.themes),
      tone: overview.tone,
      targetAudience: overview.targetAudience,
    });
  }, [overview, form]);

  const onSubmit = form.handleSubmit((values) => {
    mutation.mutate({
      ...values,
      themes: parseThemesInput(values.themes),
    });
  });

  return (
    <SectionShell
      title="Story overview"
      description="Core narrative foundation for AI script and character generation."
      action={
        <Button type="submit" form="overview-form" size="sm" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : 'Save overview'}
        </Button>
      }
    >
      <form id="overview-form" className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="logline">Logline</Label>
          <Textarea id="logline" rows={2} {...form.register('logline')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="synopsis">Synopsis</Label>
          <Textarea id="synopsis" rows={5} {...form.register('synopsis')} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="themes">Themes (comma-separated)</Label>
            <Input id="themes" {...form.register('themes')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tone">Tone</Label>
            <Input id="tone" {...form.register('tone')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetAudience">Target audience</Label>
            <Input id="targetAudience" {...form.register('targetAudience')} />
          </div>
        </div>
      </form>
    </SectionShell>
  );
}
