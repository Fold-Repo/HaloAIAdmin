import { Link, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingScreen } from '@/components/common';
import { CoverImageBanner } from '@/features/creator/components/CoverImageBanner';
import { useGenerateSeriesCover } from '@/features/creator/hooks/useCreatorMutations';
import { useSeries } from '@/features/creator/hooks/useCreatorQueries';
import { ROUTES } from '@/constants';

export function SeriesDetailPage() {
  const { seriesId = '' } = useParams();
  const { data: series, isLoading } = useSeries(seriesId);
  const generateCover = useGenerateSeriesCover(seriesId);

  if (isLoading) {
    return <LoadingScreen message="Loading series..." />;
  }

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

  return (
    <div className="space-y-6">
      <CoverImageBanner
        kind="series"
        entityId={seriesId}
        title={series.title}
        landscapeUrl={series.coverUrl}
        portraitUrl={series.coverPortraitUrl}
        isGenerating={generateCover.isPending}
        errorMessage={generateCover.error?.message}
        onGenerate={(regenerate) => void generateCover.mutateAsync(regenerate)}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{series.title}</h1>
          <p className="text-muted-foreground mt-1">{series.genre}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to={ROUTES.STUDIO.SEASONS.replace(':seriesId', series.id)}>
              Manage seasons
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to={ROUTES.STUDIO.SERIES}>All series</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>{series.description}</p>
          <p className="text-muted-foreground">
            {series.seasonCount} seasons · {series.projectCount} projects · Status:{' '}
            {series.status}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
