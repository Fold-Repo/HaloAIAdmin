import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Film } from 'lucide-react';

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
import { Progress } from '@/components/ui/progress';
import { DeleteEpisodeDialog } from '@/features/episode-planner/components/DeleteEpisodeDialog';
import { useGenerateEpisodeBatch } from '@/features/story-bible/hooks/useStoryBible';
import {
  EPISODE_STATUS_LABELS,
  formatRuntime,
  getEpisodeDetailPath,
} from '@/features/episode-planner/utils/episode-planner.utils';
import type { Episode } from '@/types';

type EpisodeCardProps = {
  episode: Episode;
  projectId: string;
  generatingScenes?: boolean;
  onGenerateScenes?: () => void;
};

export function EpisodeCard({
  episode,
  projectId,
  generatingScenes = false,
  onGenerateScenes,
}: EpisodeCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">
              Ep {episode.number}: {episode.title}
            </CardTitle>
            <CardDescription className="line-clamp-2">{episode.synopsis}</CardDescription>
          </div>
          <div className="flex items-start gap-1">
            <Badge variant="secondary">{EPISODE_STATUS_LABELS[episode.status]}</Badge>
            <DeleteEpisodeDialog
              projectId={projectId}
              episodeId={episode.id}
              episodeNumber={episode.number}
              episodeTitle={episode.title}
              variant="icon"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Planning progress</span>
            <span>{episode.progress}%</span>
          </div>
          <Progress value={episode.progress} />
        </div>
        <p className="text-muted-foreground text-xs">
          {episode.sceneCount} scenes · {formatRuntime(episode.estimatedRuntimeSec)} /{' '}
          {formatRuntime(episode.targetRuntimeSec)}
        </p>
        <p className="text-muted-foreground line-clamp-2 text-xs">
          <strong>Cliffhanger:</strong> {episode.cliffhanger}
        </p>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        {episode.sceneCount === 0 && onGenerateScenes ? (
          <Button
            type="button"
            size="sm"
            className="w-full"
            disabled={generatingScenes}
            onClick={onGenerateScenes}
          >
            {generatingScenes ? 'Starting…' : 'Generate scenes'}
          </Button>
        ) : null}
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link to={getEpisodeDetailPath(projectId, episode.id)}>
            <Film className="size-4" />
            Open planner
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

type EpisodeListProps = {
  episodes: Episode[];
  projectId: string;
};

export function EpisodeList({ episodes, projectId }: EpisodeListProps) {
  const generateScenes = useGenerateEpisodeBatch(projectId);
  const [startedEpisode, setStartedEpisode] = useState<number | null>(null);

  if (episodes.length === 0) {
    return (
      <div className="text-muted-foreground rounded-xl border border-dashed px-6 py-16 text-center text-sm">
        No episodes yet. Use the episode generator to split your story from the bible.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {generateScenes.error ? (
        <p className="text-destructive text-sm" role="alert">
          {generateScenes.error.message}
        </p>
      ) : null}
      {startedEpisode != null && !generateScenes.isPending ? (
        <p className="text-muted-foreground text-sm">
          Scene generation for episode {startedEpisode} is running. Refresh this page when the
          notification arrives.
        </p>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {episodes.map((episode) => (
          <EpisodeCard
            key={episode.id}
            episode={episode}
            projectId={projectId}
            generatingScenes={generateScenes.isPending}
            onGenerateScenes={
              episode.sceneCount === 0
                ? () => {
                    generateScenes.mutate(
                      { count: 1, episodeNumber: episode.number },
                      {
                        onSuccess: () => setStartedEpisode(episode.number),
                      },
                    );
                  }
                : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}
