import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateProject } from '@/features/creator/hooks/useCreatorMutations';
import { useSeriesList } from '@/features/creator/hooks/useCreatorQueries';
import {
  projectWizardSchema,
  type ProjectWizardValues,
} from '@/features/creator/schemas/creator.schemas';

const STEPS = ['Story', 'Series', 'Review'] as const;

const DEFAULT_VALUES: ProjectWizardValues = {
  title: '',
  premise: '',
  genre: 'Drama',
  targetFormat: 'vertical-short',
  episodeLength: 60,
  episodeCount: 3,
  assignmentMode: 'standalone',
  seriesId: '',
  seasonId: '',
  newSeriesTitle: '',
  newSeasonTitle: 'Season 1',
};

export function NewProjectWizard() {
  const [step, setStep] = useState(0);
  const { data: seriesList = [] } = useSeriesList();
  const createProject = useCreateProject();

  const form = useForm<ProjectWizardValues>({
    resolver: zodResolver(projectWizardSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
  });

  const fieldsByStep: Array<Array<keyof ProjectWizardValues>> = [
    ['title', 'premise', 'genre', 'targetFormat', 'episodeLength', 'episodeCount'],
    ['assignmentMode', 'seriesId', 'seasonId', 'newSeriesTitle', 'newSeasonTitle'],
    [],
  ];

  const goNext = async () => {
    const valid = await form.trigger(fieldsByStep[step]);
    if (!valid) return;

    if (step < STEPS.length - 1) {
      setStep((current) => current + 1);
      return;
    }

    createProject.mutate(form.getValues());
  };

  const values = form.watch();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">New project wizard</h1>
        <p className="text-muted-foreground text-sm">
          Describe your story idea — Claude will generate episodes and scenes inside the studio.
        </p>
        <div className="bg-muted h-2 overflow-hidden rounded-full">
          <div
            className="bg-primary h-full transition-all"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
        <p className="text-muted-foreground text-xs">
          Step {step + 1} of {STEPS.length}: {STEPS[step]}
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          className="bg-card space-y-4 rounded-xl border p-6"
        >
          {step === 0 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="title">Project title</Label>
                <Input id="title" {...form.register('title')} />
                {form.formState.errors.title && (
                  <p className="text-destructive text-sm">{form.formState.errors.title.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="premise">Story premise</Label>
                <Textarea
                  id="premise"
                  rows={6}
                  placeholder="What is the story about? Characters, conflict, tone, setting..."
                  {...form.register('premise')}
                />
                {form.formState.errors.premise && (
                  <p className="text-destructive text-sm">{form.formState.errors.premise.message}</p>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="genre">Genre</Label>
                  <Input id="genre" {...form.register('genre')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetFormat">Format</Label>
                  <select
                    id="targetFormat"
                    className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm"
                    {...form.register('targetFormat')}
                  >
                    <option value="vertical-short">Vertical short</option>
                    <option value="vertical-series">Vertical series</option>
                    <option value="horizontal">Horizontal</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="episodeLength">Episode length (sec)</Label>
                  <Input id="episodeLength" type="number" {...form.register('episodeLength')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="episodeCount">Episodes</Label>
                  <Input id="episodeCount" type="number" {...form.register('episodeCount')} />
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="assignmentMode">Series assignment</Label>
                <select
                  id="assignmentMode"
                  className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm"
                  {...form.register('assignmentMode')}
                >
                  <option value="standalone">Standalone project</option>
                  <option value="existing">Add to existing series</option>
                  <option value="new-series">Create new series</option>
                </select>
              </div>

              {values.assignmentMode === 'existing' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="seriesId">Series</Label>
                    <select
                      id="seriesId"
                      className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm"
                      {...form.register('seriesId')}
                    >
                      <option value="">Select series</option>
                      {seriesList.map((series) => (
                        <option key={series.id} value={series.id}>
                          {series.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seasonId">Season ID (optional)</Label>
                    <Input id="seasonId" placeholder="season-1" {...form.register('seasonId')} />
                  </div>
                </div>
              )}

              {values.assignmentMode === 'new-series' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="newSeriesTitle">New series title</Label>
                    <Input id="newSeriesTitle" {...form.register('newSeriesTitle')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newSeasonTitle">First season title</Label>
                    <Input id="newSeasonTitle" {...form.register('newSeasonTitle')} />
                  </div>
                </div>
              )}
            </>
          )}

          {step === 2 && (
            <div className="space-y-3 text-sm">
              <p>
                <span className="text-muted-foreground">Title:</span> {values.title}
              </p>
              <p>
                <span className="text-muted-foreground">Format:</span> {values.targetFormat} ·{' '}
                {values.episodeLength}s · {values.episodeCount} episodes
              </p>
              <p>
                <span className="text-muted-foreground">Premise:</span> {values.premise}
              </p>
              <p className="text-muted-foreground">
                After creation, Story Composer will generate your story bible, episodes, and scenes
                with Claude. Video generation unlocks once all scenes are complete.
              </p>
            </div>
          )}

          {createProject.error && (
            <p className="text-destructive text-sm" role="alert">
              {createProject.error.message}
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          disabled={step === 0 || createProject.isPending}
          onClick={() => setStep((current) => current - 1)}
        >
          Back
        </Button>
        <Button type="button" disabled={createProject.isPending} onClick={goNext}>
          {step === STEPS.length - 1
            ? createProject.isPending
              ? 'Creating...'
              : 'Create & generate story'
            : 'Continue'}
        </Button>
      </div>
    </div>
  );
}
