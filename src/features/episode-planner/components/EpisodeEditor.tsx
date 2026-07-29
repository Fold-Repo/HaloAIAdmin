import { zodResolver } from '@hookform/resolvers/zod';
import { Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  useGenerateCliffhanger,
  useUpdateEpisode,
} from '@/features/episode-planner/hooks/useEpisodePlanner';
import {
  episodeEditorSchema,
  type EpisodeEditorFormValues,
} from '@/features/episode-planner/schemas/episode-planner.schemas';
import {
  CLIFFHANGER_PRESETS,
  CLIFFHANGER_TONE_OPTIONS,
} from '@/features/episode-planner/utils/episode-planner.utils';
import type { Episode } from '@/types';

type EpisodeEditorProps = {
  projectId: string;
  episode: Episode;
};

export function EpisodeEditor({ projectId, episode }: EpisodeEditorProps) {
  const mutation = useUpdateEpisode(projectId, episode.id);
  const generateCliffhanger = useGenerateCliffhanger(projectId, episode.id);
  const [presetId, setPresetId] = useState('');
  const [generateTone, setGenerateTone] = useState<string>(CLIFFHANGER_TONE_OPTIONS[0].value);

  const form = useForm<EpisodeEditorFormValues>({
    resolver: zodResolver(episodeEditorSchema),
    defaultValues: {
      title: episode.title,
      synopsis: episode.synopsis,
      cliffhanger: episode.cliffhanger,
      targetRuntimeSec: episode.targetRuntimeSec,
    },
  });

  useEffect(() => {
    form.reset({
      title: episode.title,
      synopsis: episode.synopsis,
      cliffhanger: episode.cliffhanger,
      targetRuntimeSec: episode.targetRuntimeSec,
    });
    const matchingPreset = CLIFFHANGER_PRESETS.find(
      (preset) => preset.text === episode.cliffhanger,
    );
    setPresetId(matchingPreset?.id ?? '');
  }, [episode, form]);

  const handlePresetChange = (nextPresetId: string) => {
    setPresetId(nextPresetId);
    const preset = CLIFFHANGER_PRESETS.find((item) => item.id === nextPresetId);
    if (preset) {
      form.setValue('cliffhanger', preset.text, { shouldDirty: true, shouldValidate: true });
    }
  };

  const handleCliffhangerChange = (value: string) => {
    form.setValue('cliffhanger', value, { shouldDirty: true, shouldValidate: true });
    const matchingPreset = CLIFFHANGER_PRESETS.find((preset) => preset.text === value);
    setPresetId(matchingPreset?.id ?? '');
  };

  const handleGenerateCliffhanger = () => {
    generateCliffhanger.mutate(
      { tone: generateTone },
      {
        onSuccess: (response) => {
          handleCliffhangerChange(response.data.text);
        },
      },
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Episode editor</CardTitle>
        <Button type="submit" form="episode-editor-form" size="sm" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : 'Save episode'}
        </Button>
      </CardHeader>
      <CardContent>
        <form
          id="episode-editor-form"
          className="grid gap-4 md:grid-cols-2"
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        >
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...form.register('title')} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="synopsis">Synopsis</Label>
            <Textarea id="synopsis" rows={4} {...form.register('synopsis')} />
          </div>
          <div className="space-y-3 md:col-span-2">
            <div className="space-y-2">
              <Label htmlFor="cliffhanger-preset">Cliffhanger preset</Label>
              <select
                id="cliffhanger-preset"
                className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm"
                value={presetId}
                onChange={(event) => handlePresetChange(event.target.value)}
              >
                <option value="">Choose a preset (optional)...</option>
                {CLIFFHANGER_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label}
                  </option>
                ))}
              </select>
              <p className="text-muted-foreground text-xs">
                Pick a starting line, then edit the text below before you save.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cliffhanger">Cliffhanger</Label>
              <Textarea
                id="cliffhanger"
                rows={3}
                value={form.watch('cliffhanger')}
                onChange={(event) => handleCliffhangerChange(event.target.value)}
              />
              {form.formState.errors.cliffhanger && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.cliffhanger.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="cliffhanger-tone">Generate with AI (tone)</Label>
                <select
                  id="cliffhanger-tone"
                  className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm"
                  value={generateTone}
                  onChange={(event) => setGenerateTone(event.target.value)}
                >
                  {CLIFFHANGER_TONE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                type="button"
                variant="secondary"
                disabled={generateCliffhanger.isPending}
                onClick={handleGenerateCliffhanger}
              >
                <Sparkles className="size-4" />
                {generateCliffhanger.isPending ? 'Generating...' : 'Suggest cliffhanger'}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetRuntimeSec">Target runtime (sec)</Label>
            <Input id="targetRuntimeSec" type="number" {...form.register('targetRuntimeSec')} />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
