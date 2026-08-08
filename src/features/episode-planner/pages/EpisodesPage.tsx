import { Link, useParams } from 'react-router-dom';
import { Clapperboard } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { LoadingScreen } from '@/components/common';
import { EpisodeGenerator } from '@/features/episode-planner/components/EpisodeGenerator';
import { EpisodeList } from '@/features/episode-planner/components/EpisodeList';
import { EpisodePlanTools } from '@/features/episode-planner/components/EpisodePlanTools';
import { ProgressTracker } from '@/features/episode-planner/components/ProgressTracker';
import {
  useEpisodePlannerSummary,
  useEpisodes,
} from '@/features/episode-planner/hooks/useEpisodePlanner';
import { useProject } from '@/features/creator/hooks/useCreatorQueries';
import { ROUTES } from '@/constants';

export function EpisodesPage() {
  const { projectId = '' } = useParams();
  const projectQuery = useProject(projectId);
  const summaryQuery = useEpisodePlannerSummary(projectId);
  const episodesQuery = useEpisodes(projectId);

  if (projectQuery.isLoading || summaryQuery.isLoading || episodesQuery.isLoading) {
    return <LoadingScreen message="Loading episode planner..." />;
  }

  const project = projectQuery.data;
  const summary = summaryQuery.data;
  const episodes = episodesQuery.data ?? [];

  if (!project || !summary) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold">Episode planner unavailable</h1>
        <Button asChild>
          <Link to={ROUTES.STUDIO.PROJECTS}>Back to projects</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-muted-foreground mb-1 flex items-center gap-2 text-sm">
            <Clapperboard className="size-4" />
            Episode & Scene Planner
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
          <p className="text-muted-foreground mt-1">
            Split scripts into episodes and plan vertical scenes before AI generation.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to={ROUTES.STUDIO.PROJECT_DETAIL.replace(':projectId', projectId)}>
            Back to project
          </Link>
        </Button>
      </div>

      <ProgressTracker summary={summary} />
      <EpisodePlanTools projectId={projectId} />
      <EpisodeGenerator projectId={projectId} />
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Episodes</h2>
        <EpisodeList episodes={episodes} projectId={projectId} />
      </section>
    </div>
  );
}
