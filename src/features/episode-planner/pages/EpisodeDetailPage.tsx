import { Link, useParams } from 'react-router-dom';
import { Upload } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { LoadingScreen } from '@/components/common';
import { fetchAuthenticatedBlob } from '@/api/client';
import { appConfig } from '@/config';
import { ROUTES } from '@/constants';
import { useProject } from '@/features/creator/hooks/useCreatorQueries';
import { EpisodeEditor } from '@/features/episode-planner/components/EpisodeEditor';
import { DeleteEpisodeDialog } from '@/features/episode-planner/components/DeleteEpisodeDialog';
import { RuntimeEstimator } from '@/features/episode-planner/components/ProgressTracker';
import { ScenePlanner } from '@/features/episode-planner/components/ScenePlanner';
import { ScenePlanChatPanel } from '@/features/episode-planner/components/ScenePlanChatPanel';
import { SceneTimeline } from '@/features/episode-planner/components/SceneTimeline';
import { SceneAiPreviewPanel } from '@/features/ai-generation/components/SceneAiPreviewPanel';
import { EpisodeAssemblePanel } from '@/features/episode-planner/components/EpisodeAssemblePanel';
import { useRunAgent } from '@/features/ai-generation/hooks/useAiGeneration';
import {
  useEpisode,
  useSelectSceneVideo,
} from '@/features/episode-planner/hooks/useEpisodePlanner';
import {
  calculateSceneProgress,
  getEpisodePlannerPath,
} from '@/features/episode-planner/utils/episode-planner.utils';

export function EpisodeDetailPage() {
  const { projectId = '', episodeId = '' } = useParams();
  const projectQuery = useProject(projectId);
  const runVideo = useRunAgent(projectId);
  const selectVideo = useSelectSceneVideo(projectId);
  const episodeQuery = useEpisode(projectId, episodeId, {
    pollWhileRunning: runVideo.isPending,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const isManual =
    projectQuery.data?.creationMode === 'manual_upload' ||
    episodeQuery.data?.sourceType === 'manual_upload';

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    async function loadPreview() {
      const assembledPath = episodeQuery.data?.assembledVideoUrl;
      if (!assembledPath) {
        setPreviewUrl(null);
        return;
      }
      try {
        // Cloudinary / CDN URLs play directly; legacy local API paths need auth blob fetch.
        if (/^https?:\/\//i.test(assembledPath)) {
          if (!cancelled) setPreviewUrl(assembledPath);
          return;
        }
        const url = `${appConfig.api.baseUrl.replace(/\/$/, '')}${assembledPath.startsWith('/') ? '' : '/'}${assembledPath}`;
        objectUrl = await fetchAuthenticatedBlob(url);
        if (!cancelled) setPreviewUrl(objectUrl);
      } catch {
        if (!cancelled) setPreviewUrl(null);
      }
    }

    void loadPreview();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [episodeQuery.data?.assembledVideoUrl]);

  if (episodeQuery.isLoading || projectQuery.isLoading) {
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

  const sceneProgress = calculateSceneProgress(episode.scenes, episode.assembledVideoUrl);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-muted-foreground text-sm">Episode {episode.number}</p>
          <h1 className="text-3xl font-bold tracking-tight">{episode.title}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {isManual && (
            <Button asChild>
              <Link to={ROUTES.STUDIO.PROJECT_MANUAL_UPLOAD.replace(':projectId', projectId)}>
                <Upload className="size-4" />
                {episode.assembledVideoUrl ? 'Replace video' : 'Upload video'}
              </Link>
            </Button>
          )}
          <Button asChild variant="outline">
            <Link to={getEpisodePlannerPath(projectId)}>All episodes</Link>
          </Button>
          <DeleteEpisodeDialog
            projectId={projectId}
            episodeId={episode.id}
            episodeNumber={episode.number}
            episodeTitle={episode.title}
            navigateAway
          />
        </div>
      </div>

      {isManual && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Episode video</CardTitle>
          </CardHeader>
          <CardContent>
            {previewUrl ? (
              <video
                src={previewUrl}
                controls
                className="max-h-[420px] w-full rounded-lg bg-black"
              />
            ) : (
              <p className="text-muted-foreground text-sm">
                No video uploaded yet. Use Upload video to add an MP4.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {!isManual && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Episode progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Scene videos + assembly</span>
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
      )}

      <EpisodeEditor projectId={projectId} episode={episode} />

      {!isManual && (
        <>
          <SceneAiPreviewPanel projectId={projectId} agentId="video" episodeId={episodeId} />

          <ScenePlanChatPanel projectId={projectId} episodeId={episodeId} />

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
        </>
      )}
    </div>
  );
}
