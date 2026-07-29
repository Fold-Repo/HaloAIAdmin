import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SectionShell } from '@/features/story-bible/components/SectionShell';
import { useUpdateStoryEnding } from '@/features/story-bible/hooks/useStoryBible';
import {
  storyEndingSchema,
  type StoryEndingFormValues,
} from '@/features/story-bible/schemas/story-bible.schemas';
import type { StoryEndingPlan } from '@/types';

type EndingSectionProps = {
  projectId: string;
  ending: StoryEndingPlan;
};

export function EndingSection({ projectId, ending }: EndingSectionProps) {
  const mutation = useUpdateStoryEnding(projectId);

  const form = useForm<StoryEndingFormValues>({
    resolver: zodResolver(storyEndingSchema),
    defaultValues: {
      finaleType: ending.finaleType,
      description: ending.description,
      cliffhanger: ending.cliffhanger,
      sequelHook: ending.sequelHook,
    },
  });

  useEffect(() => {
    form.reset({
      finaleType: ending.finaleType,
      description: ending.description,
      cliffhanger: ending.cliffhanger,
      sequelHook: ending.sequelHook,
    });
  }, [ending, form]);

  return (
    <SectionShell
      title="Ending"
      description="Finale design, cliffhangers, and sequel hooks for retention."
      action={
        <Button type="submit" form="ending-form" size="sm" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : 'Save ending'}
        </Button>
      }
    >
      <form
        id="ending-form"
        className="space-y-4"
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      >
        <div className="space-y-2">
          <Label htmlFor="finaleType">Finale type</Label>
          <Input id="finaleType" {...form.register('finaleType')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Finale description</Label>
          <Textarea id="description" rows={4} {...form.register('description')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cliffhanger">Cliffhanger</Label>
          <Textarea id="cliffhanger" rows={3} {...form.register('cliffhanger')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sequelHook">Sequel hook</Label>
          <Textarea id="sequelHook" rows={3} {...form.register('sequelHook')} />
        </div>
      </form>
    </SectionShell>
  );
}
