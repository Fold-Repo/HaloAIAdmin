import { Check, Play } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VideoPreviewModal } from '@/features/ai-generation/components/VideoPreviewModal';
import {
  formatVideoVersionLabel,
  getSceneVideos,
} from '@/features/ai-generation/utils/scene-video.utils';
import type { SceneVideo } from '@/types';

type SceneVideoVersionsProps = {
  sceneTitle: string;
  sceneOrder: number;
  videos?: SceneVideo[];
  videoUrl?: string;
  onSelectVideo?: (videoId: string) => void;
  isSelecting?: boolean;
  compact?: boolean;
};

export function SceneVideoVersions({
  sceneTitle,
  sceneOrder,
  videos,
  videoUrl,
  onSelectVideo,
  isSelecting = false,
  compact = false,
}: SceneVideoVersionsProps) {
  const [previewTarget, setPreviewTarget] = useState<{
    videoUrl: string;
    label: string;
  } | null>(null);

  const allVideos = getSceneVideos({ videos, videoUrl });

  if (allVideos.length === 0) {
    return null;
  }

  const title = `Scene ${sceneOrder}: ${sceneTitle}`;

  return (
    <>
      <div className={compact ? 'space-y-2' : 'space-y-3'}>
        {allVideos.length > 1 && (
          <p className="text-muted-foreground text-xs">
            {allVideos.length} versions — pick the one to use for this scene
          </p>
        )}
        <div className={compact ? 'flex flex-col gap-2' : 'grid gap-2 sm:grid-cols-2'}>
          {allVideos.map((video, index) => {
            const label = formatVideoVersionLabel(video, index, allVideos.length);
            const canSelect = onSelectVideo && !video.id.startsWith('legacy');

            return (
              <div
                key={video.id}
                className={
                  video.isSelected
                    ? 'border-primary bg-primary/5 flex flex-wrap items-center gap-2 rounded-lg border p-2'
                    : 'flex flex-wrap items-center gap-2 rounded-lg border p-2'
                }
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{label}</p>
                  {video.durationSec && (
                    <p className="text-muted-foreground text-xs">{video.durationSec}s</p>
                  )}
                </div>
                {video.isSelected && (
                  <Badge variant="default" className="gap-1 text-xs">
                    <Check className="size-3" />
                    Selected
                  </Badge>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewTarget({ videoUrl: video.videoUrl, label })}
                >
                  <Play className="size-3" />
                  Preview
                </Button>
                {canSelect && !video.isSelected && (
                  <Button
                    type="button"
                    size="sm"
                    disabled={isSelecting}
                    onClick={() => onSelectVideo(video.id)}
                  >
                    Use this
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {previewTarget && (
        <VideoPreviewModal
          open={Boolean(previewTarget)}
          onOpenChange={(open) => {
            if (!open) setPreviewTarget(null);
          }}
          videoUrl={previewTarget.videoUrl}
          title={title}
          subtitle={previewTarget.label}
        />
      )}
    </>
  );
}
