import { Film } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEpisodes } from '@/features/episode-planner/hooks/useEpisodePlanner';
import { getEpisodeDetailPath } from '@/features/episode-planner/utils/episode-planner.utils';

type EpisodeAssemblyOverviewProps = {
  projectId: string;
};

export function EpisodeAssemblyOverview({ projectId }: EpisodeAssemblyOverviewProps) {
  const episodesQuery = useEpisodes(projectId);

  if (episodesQuery.isLoading || !episodesQuery.data?.length) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Episode assembly</CardTitle>
        <p className="text-muted-foreground text-sm">
          Combine scene videos into a full episode MP4 from each episode page, or open an episode
          below.
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {episodesQuery.data.map((episode) => (
          <div
            key={episode.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
          >
            <div>
              <p className="font-medium">
                Episode {episode.number}: {episode.title}
              </p>
              <p className="text-muted-foreground text-xs">
                {episode.sceneCount} scene{episode.sceneCount === 1 ? '' : 's'}
                {episode.assembledAt
                  ? ` · assembled ${new Date(episode.assembledAt).toLocaleDateString()}`
                  : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {episode.assembledVideoUrl ? (
                <Badge variant="default" className="gap-1">
                  <Film className="size-3" />
                  Assembled
                </Badge>
              ) : (
                <Badge variant="secondary">Not assembled</Badge>
              )}
              <Button asChild variant="outline" size="sm">
                <Link to={getEpisodeDetailPath(projectId, episode.id)}>Assemble</Link>
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
