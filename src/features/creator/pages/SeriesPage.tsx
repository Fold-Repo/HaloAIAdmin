import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LoadingScreen, QueryError } from '@/components/common';
import { SeriesGrid } from '@/features/creator/components/SeriesManagement';
import { useCreateSeries } from '@/features/creator/hooks/useCreatorMutations';
import { useSeriesList } from '@/features/creator/hooks/useCreatorQueries';
import {
  seriesSchema,
  type SeriesFormValues,
} from '@/features/creator/schemas/creator.schemas';

export function SeriesPage() {
  const [showForm, setShowForm] = useState(false);
  const { data: series = [], isLoading, isError, error, refetch } = useSeriesList();
  const createSeries = useCreateSeries();

  const form = useForm<SeriesFormValues>({
    resolver: zodResolver(seriesSchema),
    defaultValues: { title: '', description: '', genre: 'Drama' },
  });

  if (isLoading) {
    return <LoadingScreen message="Loading series..." />;
  }

  if (isError) {
    return (
      <QueryError
        title="Unable to load series"
        message={error?.message ?? 'Something went wrong while loading series.'}
        onRetry={() => void refetch()}
      />
    );
  }

  const onSubmit = form.handleSubmit((values) => {
    createSeries.mutate(values, {
      onSuccess: () => {
        form.reset();
        setShowForm(false);
      },
    });
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Series management</h1>
          <p className="text-muted-foreground mt-1">
            Organize long-form vertical content into series and seasons.
          </p>
        </div>
        <Button type="button" onClick={() => setShowForm((current) => !current)}>
          {showForm ? 'Cancel' : 'New series'}
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={onSubmit}
          className="bg-card space-y-4 rounded-xl border p-6"
        >
          <div className="space-y-2">
            <Label htmlFor="series-title">Title</Label>
            <Input id="series-title" {...form.register('title')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="series-description">Description</Label>
            <Textarea id="series-description" {...form.register('description')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="series-genre">Genre</Label>
            <Input id="series-genre" {...form.register('genre')} />
          </div>
          {createSeries.error && (
            <QueryError
              title="Unable to create series"
              message={createSeries.error.message}
              className="py-6"
            />
          )}
          <Button type="submit" disabled={createSeries.isPending}>
            {createSeries.isPending ? 'Creating...' : 'Create series'}
          </Button>
        </form>
      )}

      <SeriesGrid series={series} />
    </div>
  );
}
