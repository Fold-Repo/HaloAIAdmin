import { CheckSquare, RefreshCw, Sparkles, Square } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { LoadingScreen } from '@/components/common';
import { Progress } from '@/components/ui/progress';
import { SceneVideoVersions } from '@/features/ai-generation/components/SceneVideoVersions';
import { VideoPreviewModal } from '@/features/ai-generation/components/VideoPreviewModal';
import {
  useRunAgent,
  useRunAgentBatch,
  useScenePreview,
  useVideoAgentRun,
} from '@/features/ai-generation/hooks/useAiGeneration';
import {
  formatVideoVersionLabel,
  getSceneVideos,
  sceneHasVideos,
} from '@/features/ai-generation/utils/scene-video.utils';
import { useSelectSceneVideo } from '@/features/episode-planner/hooks/useEpisodePlanner';
import type { AiAgentId, ScenePreviewItem } from '@/types';

type SceneAiPreviewPanelProps = {
  projectId: string;
  agentId: AiAgentId;
  episodeId?: string;
  modelId?: string;
};

export function SceneAiPreviewPanel({
  projectId,
  agentId,
  episodeId,
  modelId,
}: SceneAiPreviewPanelProps) {
  const isVideoAgent = agentId === 'video';
  const videoRun = useVideoAgentRun(projectId);
  const runAgent = useRunAgent(projectId);
  const runBatch = useRunAgentBatch(projectId);
  const selectVideo = useSelectSceneVideo(projectId);
  const [selectedSceneIds, setSelectedSceneIds] = useState<string[]>([]);
  const [runAll, setRunAll] = useState(false);
  const [previewTarget, setPreviewTarget] = useState<{
    videoUrl: string;
    title: string;
    subtitle?: string;
  } | null>(null);

  const activeRunAgent = isVideoAgent ? videoRun.runAgent : runAgent;
  const activeRunBatch = isVideoAgent ? videoRun.runBatch : runBatch;
  const isBusy = isVideoAgent ? videoRun.isBusy : runAgent.isPending || runBatch.isPending;

  const previewQuery = useScenePreview(projectId, episodeId, {
    pollWhileRunning: isBusy,
  });

  const scenes = useMemo(
    () => previewQuery.data?.episodes.flatMap((episode) => episode.scenes) ?? [],
    [previewQuery.data],
  );

  const scenesWithVideo = useMemo(() => scenes.filter(sceneHasVideos), [scenes]);
  const scenesWithoutVideo = useMemo(
    () => scenes.filter((scene) => !sceneHasVideos(scene)),
    [scenes],
  );
  const totalVideoCount = useMemo(
    () => scenes.reduce((sum, scene) => sum + getSceneVideos(scene).length, 0),
    [scenes],
  );
  const allSceneIds = useMemo(() => scenes.map((scene) => scene.id), [scenes]);

  const selectedScenes = useMemo(
    () => scenes.filter((scene) => selectedSceneIds.includes(scene.id)),
    [scenes, selectedSceneIds],
  );

  const selectedAllHaveVideo =
    selectedScenes.length > 0 && selectedScenes.every((scene) => sceneHasVideos(scene));

  const toggleScene = (sceneId: string, checked: boolean) => {
    setRunAll(false);
    setSelectedSceneIds((current) =>
      checked ? [...current, sceneId] : current.filter((id) => id !== sceneId),
    );
  };

  const toggleAll = (checked: boolean) => {
    setRunAll(checked);
    setSelectedSceneIds(checked ? allSceneIds : []);
  };

  const runSingleScene = (sceneId: string, regenerate: boolean) => {
    activeRunAgent.mutate({
      agentId,
      sceneId,
      episodeId,
      modelId: modelId || undefined,
      regenerate: isVideoAgent ? regenerate : undefined,
    });
  };

  const handleRunSelected = () => {
    if (selectedSceneIds.length === 0) return;
    const regenerate = isVideoAgent && selectedAllHaveVideo;

    if (selectedSceneIds.length === 1) {
      runSingleScene(selectedSceneIds[0]!, regenerate);
      return;
    }

    activeRunBatch.mutate({
      agentId,
      sceneIds: selectedSceneIds,
      episodeId,
      modelId: modelId || undefined,
      regenerate: isVideoAgent ? regenerate : undefined,
    });
  };

  const handleRunAllToggle = () => {
    if (!episodeId) return;
    const regenerate = isVideoAgent && scenesWithoutVideo.length === 0;
    activeRunAgent.mutate({
      agentId,
      episodeId,
      runAllScenes: true,
      modelId: modelId || undefined,
      regenerate: isVideoAgent ? regenerate : undefined,
    });
  };

  const handleSelectVideo = (scene: ScenePreviewItem, videoId: string) => {
    selectVideo.mutate({
      episodeId: scene.episodeId,
      sceneId: scene.id,
      videoId,
    });
  };

  const runActionLabel = isVideoAgent ? (selectedAllHaveVideo ? 'Regenerate' : 'Generate') : 'Run';

  const statusMessage = isVideoAgent
    ? videoRun.statusMessage
    : (runBatch.data?.data?.message ?? runAgent.data?.data?.message);

  if (previewQuery.isLoading) {
    return <LoadingScreen message="Loading scene preview..." />;
  }

  if (!previewQuery.data || scenes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Scene preview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No scenes yet. Extract episodes from the Story Bible or add scenes in Episode Planner.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">
                {isVideoAgent ? 'Generated videos & scene preview' : 'Scene preview for AI'}
              </CardTitle>
              <p className="text-muted-foreground mt-1 text-sm">
                {isVideoAgent
                  ? 'Generate skips scenes that already have video. Regenerate adds a new version. Jobs run in the background.'
                  : 'Review assembled context per scene before running agents.'}
              </p>
            </div>
            {isVideoAgent && (
              <Badge variant={scenesWithVideo.length > 0 ? 'default' : 'secondary'}>
                {totalVideoCount} video{totalVideoCount === 1 ? '' : 's'} · {scenesWithVideo.length}
                /{scenes.length} scenes
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isVideoAgent && totalVideoCount > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium">All generated videos</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {scenes.flatMap((scene) =>
                  getSceneVideos(scene).map((video, index) => {
                    const videos = getSceneVideos(scene);
                    const label = formatVideoVersionLabel(video, index, videos.length);
                    return (
                      <button
                        key={video.id}
                        type="button"
                        onClick={() =>
                          setPreviewTarget({
                            videoUrl: video.videoUrl,
                            title: `Scene ${scene.order}: ${scene.title}`,
                            subtitle: label,
                          })
                        }
                        className={
                          video.isSelected
                            ? 'border-primary bg-primary/5 hover:bg-primary/10 rounded-lg border p-3 text-left text-sm transition-colors'
                            : 'hover:bg-muted/50 rounded-lg border p-3 text-left text-sm transition-colors'
                        }
                      >
                        <p className="font-medium">
                          Scene {scene.order}: {scene.title}
                        </p>
                        <p className="text-muted-foreground text-xs">{label}</p>
                        {video.isSelected && (
                          <Badge variant="default" className="mt-2 text-xs">
                            Selected for scene
                          </Badge>
                        )}
                      </button>
                    );
                  }),
                )}
              </div>
            </div>
          )}

          {previewQuery.data.storyContext.logline && (
            <div className="bg-muted rounded-md p-3 text-sm">
              <p className="font-medium">Story context</p>
              <p className="text-muted-foreground mt-1">{previewQuery.data.storyContext.logline}</p>
            </div>
          )}

          {isBusy && (
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">
                {videoRun.watch.isWatching
                  ? (videoRun.watch.job?.message ??
                    'Video job running in the background… buttons stay locked until it finishes.')
                  : 'Starting video job…'}
              </p>
              {typeof videoRun.watch.job?.progress === 'number' && (
                <Progress value={videoRun.watch.job.progress} />
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="run-all-scenes"
                checked={runAll || selectedSceneIds.length === allSceneIds.length}
                onCheckedChange={(value) => toggleAll(value === true)}
                disabled={isBusy}
              />
              <Label htmlFor="run-all-scenes">Select all scenes</Label>
            </div>
            <Badge variant="secondary">{selectedSceneIds.length} selected</Badge>
            {isVideoAgent && scenesWithoutVideo.length > 0 && (
              <Badge variant="outline">{scenesWithoutVideo.length} remaining</Badge>
            )}
          </div>

          <div className="max-h-96 space-y-3 overflow-y-auto">
            {previewQuery.data.episodes.map((episode) => (
              <div key={episode.id} className="space-y-2">
                <p className="text-sm font-medium">
                  Episode {episode.number}: {episode.title}
                </p>
                {episode.scenes.map((scene) => {
                  const checked = selectedSceneIds.includes(scene.id);
                  const hasVideo = sceneHasVideos(scene);
                  const videoCount = getSceneVideos(scene).length;
                  return (
                    <div
                      key={scene.id}
                      className={
                        hasVideo
                          ? 'border-primary/30 bg-primary/5 rounded-lg border p-3'
                          : 'rounded-lg border p-3'
                      }
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={checked}
                          disabled={isBusy}
                          onCheckedChange={(value) => toggleScene(scene.id, value === true)}
                        />
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium">
                              Scene {scene.order}: {scene.title}
                            </span>
                            <Badge variant="outline">{scene.durationSec}s</Badge>
                            <Badge variant="secondary">{scene.status}</Badge>
                            {hasVideo && (
                              <Badge variant="default">
                                {videoCount} version{videoCount === 1 ? '' : 's'}
                              </Badge>
                            )}
                          </div>
                          <pre className="bg-muted max-h-28 overflow-auto rounded-md p-2 text-xs whitespace-pre-wrap">
                            {scene.contextPreview}
                          </pre>
                          {isVideoAgent && hasVideo && (
                            <SceneVideoVersions
                              sceneTitle={scene.title}
                              sceneOrder={scene.order}
                              videos={scene.videos}
                              videoUrl={scene.videoUrl}
                              onSelectVideo={(videoId) => handleSelectVideo(scene, videoId)}
                              isSelecting={selectVideo.isPending}
                              compact
                            />
                          )}
                          {isVideoAgent && (
                            <div className="flex flex-wrap gap-2">
                              <Button
                                type="button"
                                variant={hasVideo ? 'outline' : 'default'}
                                size="sm"
                                disabled={isBusy}
                                onClick={() => runSingleScene(scene.id, hasVideo)}
                              >
                                {hasVideo ? (
                                  <>
                                    <RefreshCw className="size-3" />
                                    Regenerate
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="size-3" />
                                    Generate
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={isBusy || selectedSceneIds.length === 0}
              onClick={handleRunSelected}
            >
              {selectedAllHaveVideo ? (
                <RefreshCw className="size-4" />
              ) : (
                <Sparkles className="size-4" />
              )}
              {isBusy
                ? 'Job running…'
                : selectedSceneIds.length <= 1
                  ? `${runActionLabel} selected scene`
                  : `${runActionLabel} ${selectedSceneIds.length} scenes`}
            </Button>
            {episodeId && (
              <Button
                type="button"
                variant="outline"
                disabled={isBusy}
                onClick={handleRunAllToggle}
              >
                {runAll ? <CheckSquare className="size-4" /> : <Square className="size-4" />}
                {isVideoAgent && scenesWithoutVideo.length === 0
                  ? 'Regenerate all scenes in episode'
                  : isVideoAgent
                    ? `Generate remaining (${scenesWithoutVideo.length})`
                    : 'Run all scenes in episode'}
              </Button>
            )}
          </div>

          {statusMessage && <p className="text-muted-foreground text-sm">{statusMessage}</p>}
          {(activeRunAgent.isError || activeRunBatch.isError) && (
            <p className="text-destructive text-sm">
              {(activeRunAgent.error as Error)?.message ??
                (activeRunBatch.error as Error)?.message ??
                'Generation failed.'}
            </p>
          )}
          {selectVideo.isError && (
            <p className="text-destructive text-sm">
              {(selectVideo.error as Error)?.message ?? 'Could not select video version.'}
            </p>
          )}
        </CardContent>
      </Card>

      {previewTarget && (
        <VideoPreviewModal
          open={Boolean(previewTarget)}
          onOpenChange={(open) => {
            if (!open) setPreviewTarget(null);
          }}
          videoUrl={previewTarget.videoUrl}
          title={previewTarget.title}
          subtitle={previewTarget.subtitle}
        />
      )}
    </>
  );
}
