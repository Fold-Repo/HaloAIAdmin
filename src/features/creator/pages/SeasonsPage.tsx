import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LoadingScreen } from '@/components/common';
import { SeasonList } from '@/features/creator/components/SeriesManagement';
import { useCreateSeason } from '@/features/creator/hooks/useCreatorMutations';
import { useSeasons, useSeries } from '@/features/creator/hooks/useCreatorQueries';
import {
  seasonSchema,
  type SeasonFormValues,
} from '@/features/creator/schemas/creator.schemas';
import { ROUTES } from '@/constants';

export function SeasonsPage() {
  const { seriesId = '' } = useParams();
  const seriesQuery = useSeries(seriesId);
  const seasonsQuery = useSeasons(seriesId);
  const createSeason = useCreateSeason(seriesId);

  const form = useForm<SeasonFormValues>({
    resolver: zodResolver(seasonSchema),
    defaultValues: { title: 'Season 1', number: 1, description: '' },
  });

  if (seriesQuery.isLoading || seasonsQuery.isLoading) {
    return <LoadingScreen message="Loading seasons..." />;
  }

  const series = seriesQuery.data;
  const seasons = seasonsQuery.data ?? [];

  if (!series) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold">Series not found</h1>
        <Button asChild>
          <Link to={ROUTES.STUDIO.SERIES}>Back to series</Link>
        </Button>
      </div>
    );
  }

  const onSubmit = form.handleSubmit((values) => {
    createSeason.mutate(values, {
      onSuccess: () => form.reset({ title: `Season ${values.number + 1}`, number: values.number + 1 }),
    });
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground text-sm">{series.title}</p>
        <h1 className="text-3xl font-bold tracking-tight">Season management</h1>
      </div>

      <form onSubmit={onSubmit} className="bg-card grid gap-4 rounded-xl border p-6 md:grid-cols-4">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="season-title">Season title</Label>
          <Input id="season-title" {...form.register('title')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="season-number">Number</Label>
          <Input id="season-number" type="number" {...form.register('number')} />
        </div>
        <div className="flex items-end">
          <Button type="submit" className="w-full" disabled={createSeason.isPending}>
            {createSeason.isPending ? 'Adding...' : 'Add season'}
          </Button>
        </div>
        <div className="space-y-2 md:col-span-4">
          <Label htmlFor="season-description">Description</Label>
          <Textarea id="season-description" {...form.register('description')} />
        </div>
      </form>

      <SeasonList seasons={seasons} />
    </div>
  );
}
