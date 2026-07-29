import { Link } from 'react-router-dom';
import { Layers, MoreHorizontal } from 'lucide-react';

import { EmptyState } from '@/components/common';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SeriesCoverArt } from '@/features/creator/components/CoverArt';
import { ROUTES } from '@/constants';
import { formatRelativeDate } from '@/features/creator/utils/creator.utils';
import type { Series } from '@/types';

type SeriesCardProps = {
  series: Series;
};

export function SeriesCard({ series }: SeriesCardProps) {
  return (
    <Card className="overflow-hidden">
      <SeriesCoverArt
        seriesId={series.id}
        title={series.title}
        landscapeUrl={series.coverUrl}
        portraitUrl={series.coverPortraitUrl}
        variant="card"
      />
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">{series.title}</CardTitle>
            <CardDescription>{series.genre}</CardDescription>
          </div>
          <Badge variant={series.status === 'active' ? 'success' : 'secondary'}>
            {series.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-muted-foreground line-clamp-2 text-sm">{series.description}</p>
        <p className="text-muted-foreground text-xs">
          {series.seasonCount} seasons · {series.projectCount} projects · Updated{' '}
          {formatRelativeDate(series.updatedAt)}
        </p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link to={ROUTES.STUDIO.SERIES_DETAIL.replace(':seriesId', series.id)}>
            Manage series
          </Link>
        </Button>
        <Button asChild variant="ghost" size="icon" aria-label="Manage seasons">
          <Link to={ROUTES.STUDIO.SEASONS.replace(':seriesId', series.id)}>
            <Layers className="size-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

type SeriesGridProps = {
  series: Series[];
};

export function SeriesGrid({ series }: SeriesGridProps) {
  if (series.length === 0) {
    return (
      <EmptyState
        title="No series yet"
        description="Create one when starting a new project or from this page."
        className="py-16"
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
      {series.map((item) => (
        <SeriesCard key={item.id} series={item} />
      ))}
    </div>
  );
}

type SeasonListProps = {
  seasons: import('@/types').Season[];
};

export function SeasonList({ seasons }: SeasonListProps) {
  if (seasons.length === 0) {
    return (
      <EmptyState
        title="No seasons yet"
        description="Add the first season for this series."
        className="py-12"
      />
    );
  }

  return (
    <div className="space-y-3">
      {seasons.map((season) => (
        <div
          key={season.id}
          className="flex items-center justify-between rounded-lg border px-4 py-3"
        >
          <div>
            <p className="font-medium">
              {season.title} <span className="text-muted-foreground">· S{season.number}</span>
            </p>
            <p className="text-muted-foreground text-sm">
              {season.episodeCount} episodes · {season.status.replace('-', ' ')}
            </p>
          </div>
          <Button variant="ghost" size="icon" aria-label={`Season ${season.number} actions`}>
            <MoreHorizontal className="size-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
