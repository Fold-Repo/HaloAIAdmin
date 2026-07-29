import { Link, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { LoadingScreen } from '@/components/common';
import { EpisodeEditor } from '@/features/episode-planner/components/EpisodeEditor';
import { RuntimeEstimator } from '@/features/episode-planner/components/ProgressTracker';
import { ScenePlanner } from '@/features/episode-planner/components/ScenePlanner';
import { SceneTimeline } from '@/features/episode-planner/components/SceneTimeline';
import { SceneAiPreviewPanel } from '@/features/ai-generation/components/SceneAiPreviewPanel';
import { EpisodeAssemblePanel } from '@/features/episode-planner/components/EpisodeAssemblePanel';
import { useRunAgent } from '@/features/ai-generation/hooks/useAiGeneration';
import { useEpisode, useSelectSceneVideo } from '@/features/episode-planner/hooks/useEpisodePlanner';
import {
  calculateSceneProgress,
  getEpisodePlannerPath,
} from '@/features/episode-planner/utils/episode-planner.utils';

export function EpisodeDetailPage() {
  const { projectId = '', episodeId = '' } = useParams();
  const runVideo = useRunAgent(projectId);
  const selectVideo = useSelectSceneVideo(projectId);
  const episodeQuery = useEpisode(projectId, episodeId, {
    pollWhileRunning: runVideo.isPending,
  });

  if (episodeQuery.isLoading) {
    return <LoadingScreen message="Loading episode..." />;
  }

  const episode = episodeQuery.data;

  if (!episode) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold">Episode not found</h1>
        <Button asChild>
          <Link to={getEpisodePlannerPath(projectId)}>Back to episodes</Link>
        </Button>
      </div>
    );
  }

  const sceneProgress = calculateSceneProgress(episode.scenes);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-muted-foreground text-sm">Episode {episode.number}</p>
          <h1 className="text-3xl font-bold tracking-tight">{episode.title}</h1>
        </div>
        <Button asChild variant="outline">
          <Link to={getEpisodePlannerPath(projectId)}>All episodes</Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Scene progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Scenes planned for generation</span>
              <span>{sceneProgress}%</span>
            </div>
            <Progress value={sceneProgress} />
          </CardContent>
        </Card>
        <RuntimeEstimator
          estimatedSec={episode.estimatedRuntimeSec}
          targetSec={episode.targetRuntimeSec}
        />
      </div>

      <EpisodeEditor projectId={projectId} episode={episode} />

      <SceneAiPreviewPanel projectId={projectId} agentId="video" episodeId={episodeId} />

      <SceneTimeline
        projectId={projectId}
        episodeId={episodeId}
        scenes={episode.scenes}
        onRegenerateVideo={(sceneId) =>
          runVideo.mutate({ agentId: 'video', sceneId, episodeId })
        }
        onSelectVideo={(sceneId, videoId) =>
          selectVideo.mutate({ episodeId, sceneId, videoId })
        }
        isRegeneratingVideo={runVideo.isPending}
        isSelectingVideo={selectVideo.isPending}
      />

      <EpisodeAssemblePanel projectId={projectId} episodeId={episodeId} />

      <ScenePlanner projectId={projectId} episodeId={episodeId} />
    </div>
  );
}
