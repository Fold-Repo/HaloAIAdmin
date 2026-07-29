import { Download, Layers, Play, RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { fetchAuthenticatedBlob } from '@/api/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VideoPreviewModal } from '@/features/ai-generation/components/VideoPreviewModal';
import { sceneHasVideos } from '@/features/ai-generation/utils/scene-video.utils';
import {
  useAssembleEpisode,
  useEpisode,
} from '@/features/episode-planner/hooks/useEpisodePlanner';
import { getAssembledVideoApiUrl } from '@/features/episode-planner/utils/episode-planner.utils';
import { downloadBlob } from '@/utils';
import type { EpisodeWithScenes } from '@/types';

type EpisodeAssemblePanelProps = {
  projectId: string;
  episodeId: string;
  compact?: boolean;
};

function countScenesWithVideo(episode: EpisodeWithScenes) {
  return episode.scenes.filter((scene) => sceneHasVideos(scene)).length;
}

export function EpisodeAssemblePanel({
  projectId,
  episodeId,
  compact = false,
}: EpisodeAssemblePanelProps) {
  const episodeQuery = useEpisode(projectId, episodeId, {
    pollWhileRunning: false,
  });
  const assembleEpisode = useAssembleEpisode(projectId, episodeId);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const episode = episodeQuery.data;
  const scenesWithVideo = episode ? countScenesWithVideo(episode) : 0;
  const totalScenes = episode?.scenes.length ?? 0;
  const allScenesReady = Boolean(episode && totalScenes > 0 && scenesWithVideo === totalScenes);
  const hasAssembly = Boolean(episode?.assembledVideoUrl);

  const assembledLabel = useMemo(() => {
    if (!episode?.assembledAt) return undefined;
    return new Date(episode.assembledAt).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }, [episode?.assembledAt]);

  useEffect(() => {
    return () => {
      if (previewBlobUrl) {
        URL.revokeObjectURL(previewBlobUrl);
      }
    };
  }, [previewBlobUrl]);

  const handleDownload = async () => {
    if (!episode?.assembledVideoUrl) return;
    setPreviewError(null);
    try {
      let blobUrl = previewBlobUrl;
      if (!blobUrl) {
        blobUrl = await fetchAuthenticatedBlob(getAssembledVideoApiUrl(projectId, episodeId));
      }
      downloadBlob(
        blobUrl,
        `episode-${episode.number}-${episode.title.replace(/[^\w.-]+/g, '_')}.mp4`,
      );
      if (!previewBlobUrl && blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    } catch (error) {
      setPreviewError((error as Error)?.message ?? 'Could not download assembled episode video.');
    }
  };

  const handlePreview = async () => {
    if (!episode?.assembledVideoUrl) return;
    setPreviewError(null);
    try {
      const blobUrl = await fetchAuthenticatedBlob(getAssembledVideoApiUrl(projectId, episodeId));
      setPreviewBlobUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return blobUrl;
      });
      setPreviewOpen(true);
    } catch (error) {
      setPreviewError((error as Error)?.message ?? 'Could not load assembled episode video.');
    }
  };

  if (!episode) {
    return null;
  }

  return (
    <>
      <Card className={hasAssembly ? 'border-primary/30 bg-primary/5' : undefined}>
        <CardHeader className={compact ? 'pb-2' : undefined}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">Assemble episode from scenes</CardTitle>
              <p className="text-muted-foreground mt-1 text-sm">
                Concatenates selected scene videos in timeline order into one vertical episode MP4
                using FFmpeg.
              </p>
            </div>
            <Badge variant={allScenesReady ? 'default' : 'secondary'}>
              {scenesWithVideo}/{totalScenes} scenes ready
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {!allScenesReady && (
            <p className="text-muted-foreground text-sm">
              Generate and select a video for every scene above before assembling. Scene order follows
              the timeline.
            </p>
          )}

          {hasAssembly && (
            <div className="rounded-lg border p-3 text-sm">
              <p className="font-medium">Episode video ready</p>
              {assembledLabel && (
                <p className="text-muted-foreground mt-1 text-xs">Last assembled {assembledLabel}</p>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={!allScenesReady || assembleEpisode.isPending}
              onClick={() => assembleEpisode.mutate()}
            >
              {hasAssembly ? (
                <RefreshCw className="size-4" />
              ) : (
                <Layers className="size-4" />
              )}
              {assembleEpisode.isPending
                ? 'Assembling…'
                : hasAssembly
                  ? 'Re-assemble episode'
                  : 'Assemble episode'}
            </Button>
            {hasAssembly && (
              <>
                <Button type="button" variant="outline" onClick={() => void handlePreview()}>
                  <Play className="size-4" />
                  Preview episode video
                </Button>
                <Button type="button" variant="outline" onClick={() => void handleDownload()}>
                  <Download className="size-4" />
                  Download episode MP4
                </Button>
              </>
            )}
          </div>

          {assembleEpisode.data?.data.message && (
            <p className="text-muted-foreground text-sm">{assembleEpisode.data.data.message}</p>
          )}
          {(assembleEpisode.isError || previewError) && (
            <p className="text-destructive text-sm">
              {(assembleEpisode.error as Error)?.message ?? previewError}
            </p>
          )}

          {!compact && (
            <p className="text-muted-foreground text-xs">
              Requires FFmpeg on the server. Output is saved under backend/storage/assembled/.
            </p>
          )}
        </CardContent>
      </Card>

      {previewBlobUrl && (
        <VideoPreviewModal
          open={previewOpen}
          onOpenChange={(open) => {
            setPreviewOpen(open);
            if (!open) {
              setPreviewBlobUrl((current) => {
                if (current) URL.revokeObjectURL(current);
                return null;
              });
            }
          }}
          videoUrl={previewBlobUrl}
          title={`Episode ${episode.number}: ${episode.title}`}
          subtitle="Assembled from scene videos"
          downloadFilename={`episode-${episode.number}-${episode.title.replace(/[^\w.-]+/g, '_')}.mp4`}
        />
      )}
    </>
  );
}
