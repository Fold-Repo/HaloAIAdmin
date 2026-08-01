import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ManualUploadWorkspace } from '@/features/creator/components/ManualUploadWorkspace';
import { useCreateProject } from '@/features/creator/hooks/useCreatorMutations';
import { useSeriesList } from '@/features/creator/hooks/useCreatorQueries';
import {
  projectWizardSchema,
  type ProjectWizardValues,
} from '@/features/creator/schemas/creator.schemas';
import { cn } from '@/utils/cn';

const MODE_OPTIONS = [
  {
    value: 'ai_generated' as const,
    title: 'AI generation',
    description: 'Describe a story — Claude plans episodes and scenes for you.',
  },
  {
    value: 'manual_upload' as const,
    title: 'Upload ready videos',
    description: 'Create episode slots and upload finished MP4s yourself.',
  },
];

const ASSIGNMENT_OPTIONS = [
  {
    value: 'standalone' as const,
    title: 'Standalone project',
    description: 'Not part of a series.',
    advancesImmediately: true,
  },
  {
    value: 'existing' as const,
    title: 'Add to existing series',
    description: 'Attach this project to a series you already have.',
    advancesImmediately: false,
  },
  {
    value: 'new-series' as const,
    title: 'Create new series',
    description: 'Start a series and Season 1 with this project.',
    advancesImmediately: false,
  },
];

const DEFAULT_VALUES: ProjectWizardValues = {
  creationMode: 'ai_generated',
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
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const { data: seriesList = [] } = useSeriesList();
  const createProject = useCreateProject();

  const form = useForm<ProjectWizardValues>({
    resolver: zodResolver(projectWizardSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
  });

  const values = form.watch();
  const isManual = values.creationMode === 'manual_upload';

  const steps = useMemo(
    () => [
      { id: 'mode', title: 'Mode', hint: 'AI generation or upload ready videos' },
      {
        id: 'story',
        title: isManual ? 'Project' : 'Story',
        hint: isManual ? 'Title, format, and episode count' : 'Title, premise, and format',
      },
      { id: 'series', title: 'Series', hint: 'Standalone or attach to a series' },
      { id: 'review', title: 'Review', hint: 'Confirm and create' },
    ],
    [isManual],
  );

  const fieldsByStep: Array<Array<keyof ProjectWizardValues>> = [
    ['creationMode'],
    ['title', 'premise', 'genre', 'targetFormat', 'episodeLength', 'episodeCount'],
    ['assignmentMode', 'seriesId', 'seasonId', 'newSeriesTitle', 'newSeasonTitle'],
    [],
  ];

  const advanceTo = useCallback((next: number) => {
    setStep(next);
  }, []);

  const finishStep = useCallback(async () => {
    const valid = await form.trigger(fieldsByStep[step]);
    if (!valid) return false;

    if (step < steps.length - 1) {
      advanceTo(step + 1);
      return true;
    }

    const result = await createProject.mutateAsync(form.getValues());
    if (form.getValues('creationMode') === 'manual_upload') {
      setCreatedProjectId(result.data.id);
    }
    return true;
  }, [advanceTo, createProject, form, step, steps.length]);

  const selectMode = (mode: ProjectWizardValues['creationMode']) => {
    form.setValue('creationMode', mode, { shouldValidate: true });
    advanceTo(1);
  };

  const selectAssignment = async (mode: ProjectWizardValues['assignmentMode']) => {
    form.setValue('assignmentMode', mode, { shouldValidate: true });

    if (mode === 'standalone') {
      form.setValue('seriesId', '');
      form.setValue('seasonId', '');
      form.setValue('newSeriesTitle', '');
      const valid = await form.trigger(fieldsByStep[2]);
      if (valid) advanceTo(3);
      return;
    }

    if (mode === 'existing') {
      form.setValue('newSeriesTitle', '');
      return;
    }

    form.setValue('seriesId', '');
    form.setValue('seasonId', '');
  };

  const onExistingSeriesPicked = async (seriesId: string) => {
    form.setValue('seriesId', seriesId, { shouldValidate: true });
    if (!seriesId) return;
    const valid = await form.trigger(fieldsByStep[2]);
    if (valid) advanceTo(3);
  };

  const seriesSummary = () => {
    if (values.assignmentMode === 'standalone') return 'Standalone project';
    if (values.assignmentMode === 'existing') {
      const series = seriesList.find((item) => item.id === values.seriesId);
      return series ? `Series: ${series.title}` : 'Existing series';
    }
    return `New series: ${values.newSeriesTitle || 'Untitled'}`;
  };

  const stepSummary = (index: number) => {
    if (index === 0) {
      return values.creationMode === 'manual_upload' ? 'Upload ready videos' : 'AI generation';
    }
    if (index === 1) {
      return values.title
        ? `${values.title} · ${values.episodeCount} eps · ${values.targetFormat}`
        : 'Not started';
    }
    if (index === 2) return seriesSummary();
    return isManual ? 'Ready to create & upload' : 'Ready to create';
  };

  if (createdProjectId) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Project created</h1>
          <p className="text-muted-foreground text-sm">
            {values.title} is ready — upload an MP4 for each episode below.
          </p>
          <div className="bg-muted h-2 overflow-hidden rounded-full">
            <div className="bg-primary h-full w-full" />
          </div>
        </div>
        <ManualUploadWorkspace projectId={createdProjectId} projectTitle={values.title} embedded />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">New project wizard</h1>
        <p className="text-muted-foreground text-sm">
          Stay in this flow — finish each step and the next one opens automatically.
        </p>
        <div className="bg-muted h-2 overflow-hidden rounded-full">
          <div
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((item, index) => {
          const isActive = index === step;
          const isDone = index < step;
          const isLocked = index > step;

          return (
            <section
              key={item.id}
              className={cn(
                'rounded-xl border transition-colors',
                isActive && 'bg-card border-primary/40 shadow-sm',
                isDone && 'bg-muted/40 border-border',
                isLocked && 'bg-muted/20 border-dashed opacity-60',
              )}
            >
              <button
                type="button"
                className={cn(
                  'flex w-full items-center gap-3 px-4 py-3 text-left',
                  isLocked && 'cursor-not-allowed',
                )}
                disabled={isLocked || createProject.isPending}
                onClick={() => {
                  if (isDone) setStep(index);
                }}
                aria-expanded={isActive}
              >
                <span
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                    isDone && 'bg-primary text-primary-foreground',
                    isActive && 'bg-primary/15 text-primary',
                    isLocked && 'bg-muted text-muted-foreground',
                  )}
                >
                  {isDone ? <Check className="h-4 w-4" /> : index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{item.title}</span>
                  <span className="text-muted-foreground block truncate text-xs">
                    {isActive ? item.hint : stepSummary(index)}
                  </span>
                </span>
                {isDone && (
                  <span className="text-muted-foreground text-xs whitespace-nowrap">Edit</span>
                )}
              </button>

              <AnimatePresence initial={false}>
                {isActive && (
                  <motion.div
                    key={item.id}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-4 border-t px-4 pt-4 pb-5">
                      {index === 0 && (
                        <div className="grid gap-3">
                          {MODE_OPTIONS.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              className={cn(
                                'rounded-lg border px-4 py-3 text-left transition-colors',
                                values.creationMode === option.value
                                  ? 'border-primary bg-primary/5'
                                  : 'hover:bg-muted/50 border-border',
                              )}
                              onClick={() => selectMode(option.value)}
                            >
                              <span className="block text-sm font-medium">{option.title}</span>
                              <span className="text-muted-foreground mt-0.5 block text-xs">
                                {option.description} Opens the next step automatically.
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {index === 1 && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="title">Project title</Label>
                            <Input id="title" autoFocus {...form.register('title')} />
                            {form.formState.errors.title && (
                              <p className="text-destructive text-sm">
                                {form.formState.errors.title.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="premise">
                              {isManual ? 'Description (optional)' : 'Story premise'}
                            </Label>
                            <Textarea
                              id="premise"
                              rows={isManual ? 3 : 6}
                              placeholder={
                                isManual
                                  ? 'Optional short description for this project...'
                                  : 'What is the story about? Characters, conflict, tone, setting...'
                              }
                              {...form.register('premise')}
                            />
                            {form.formState.errors.premise && (
                              <p className="text-destructive text-sm">
                                {form.formState.errors.premise.message}
                              </p>
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
                              <Input
                                id="episodeLength"
                                type="number"
                                {...form.register('episodeLength', { valueAsNumber: true })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="episodeCount">Episodes</Label>
                              <Input
                                id="episodeCount"
                                type="number"
                                {...form.register('episodeCount', { valueAsNumber: true })}
                              />
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <Button
                              type="button"
                              disabled={createProject.isPending}
                              onClick={() => void finishStep()}
                            >
                              Continue
                            </Button>
                          </div>
                        </>
                      )}

                      {index === 2 && (
                        <>
                          <div className="grid gap-3">
                            {ASSIGNMENT_OPTIONS.map((option) => {
                              const selected = values.assignmentMode === option.value;
                              return (
                                <button
                                  key={option.value}
                                  type="button"
                                  className={cn(
                                    'rounded-lg border px-4 py-3 text-left transition-colors',
                                    selected
                                      ? 'border-primary bg-primary/5'
                                      : 'hover:bg-muted/50 border-border',
                                  )}
                                  onClick={() => void selectAssignment(option.value)}
                                >
                                  <span className="block text-sm font-medium">{option.title}</span>
                                  <span className="text-muted-foreground mt-0.5 block text-xs">
                                    {option.description}
                                    {option.advancesImmediately
                                      ? ' Opens review automatically.'
                                      : ''}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          {values.assignmentMode === 'existing' && (
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="seriesId">Series</Label>
                                <select
                                  id="seriesId"
                                  className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm"
                                  value={values.seriesId ?? ''}
                                  onChange={(event) =>
                                    void onExistingSeriesPicked(event.target.value)
                                  }
                                >
                                  <option value="">Select series</option>
                                  {seriesList.map((series) => (
                                    <option key={series.id} value={series.id}>
                                      {series.title}
                                    </option>
                                  ))}
                                </select>
                                {form.formState.errors.seriesId && (
                                  <p className="text-destructive text-sm">
                                    {form.formState.errors.seriesId.message}
                                  </p>
                                )}
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="seasonId">Season ID (optional)</Label>
                                <Input
                                  id="seasonId"
                                  placeholder="season-1"
                                  {...form.register('seasonId')}
                                />
                              </div>
                            </div>
                          )}

                          {values.assignmentMode === 'new-series' && (
                            <>
                              <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                  <Label htmlFor="newSeriesTitle">New series title</Label>
                                  <Input
                                    id="newSeriesTitle"
                                    autoFocus
                                    {...form.register('newSeriesTitle')}
                                  />
                                  {form.formState.errors.newSeriesTitle && (
                                    <p className="text-destructive text-sm">
                                      {form.formState.errors.newSeriesTitle.message}
                                    </p>
                                  )}
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="newSeasonTitle">First season title</Label>
                                  <Input id="newSeasonTitle" {...form.register('newSeasonTitle')} />
                                </div>
                              </div>
                              <div className="flex justify-end">
                                <Button
                                  type="button"
                                  disabled={createProject.isPending}
                                  onClick={() => void finishStep()}
                                >
                                  Continue to review
                                </Button>
                              </div>
                            </>
                          )}
                        </>
                      )}

                      {index === 3 && (
                        <>
                          <div className="space-y-3 text-sm">
                            <p>
                              <span className="text-muted-foreground">Mode:</span>{' '}
                              {isManual ? 'Upload ready videos' : 'AI generation'}
                            </p>
                            <p>
                              <span className="text-muted-foreground">Title:</span> {values.title}
                            </p>
                            <p>
                              <span className="text-muted-foreground">Format:</span>{' '}
                              {values.targetFormat} · {values.episodeLength}s ·{' '}
                              {values.episodeCount} episodes
                            </p>
                            <p>
                              <span className="text-muted-foreground">Series:</span>{' '}
                              {seriesSummary()}
                            </p>
                            {values.premise.trim() && (
                              <p>
                                <span className="text-muted-foreground">
                                  {isManual ? 'Description:' : 'Premise:'}
                                </span>{' '}
                                {values.premise}
                              </p>
                            )}
                            <p className="text-muted-foreground">
                              {isManual
                                ? 'After creation, you will upload MP4 files for each episode in this same flow.'
                                : 'After creation, Story Composer will generate your story bible, episodes, and scenes with Claude.'}
                            </p>
                          </div>

                          {createProject.error && (
                            <p className="text-destructive text-sm" role="alert">
                              {createProject.error.message}
                            </p>
                          )}

                          <div className="flex justify-between gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              disabled={createProject.isPending}
                              onClick={() => setStep(2)}
                            >
                              Back
                            </Button>
                            <Button
                              type="button"
                              disabled={createProject.isPending}
                              onClick={() => void finishStep()}
                            >
                              {createProject.isPending
                                ? 'Creating...'
                                : isManual
                                  ? 'Create & upload videos'
                                  : 'Create & generate story'}
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          );
        })}
      </div>
    </div>
  );
}
