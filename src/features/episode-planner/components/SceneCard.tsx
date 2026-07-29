import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Film, GripVertical, MapPin, RefreshCw, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SceneVideoVersions } from '@/features/ai-generation/components/SceneVideoVersions';
import {
  getSceneVideos,
  sceneHasVideos,
} from '@/features/ai-generation/utils/scene-video.utils';
import {
  SCENE_STATUS_LABELS,
  formatRuntime,
} from '@/features/episode-planner/utils/episode-planner.utils';
import { cn } from '@/utils';
import type { Scene } from '@/types';

type SceneCardProps = {
  scene: Scene;
  dragHandle?: boolean;
  onRegenerateVideo?: (sceneId: string) => void;
  onSelectVideo?: (sceneId: string, videoId: string) => void;
  isRegenerating?: boolean;
  isSelectingVideo?: boolean;
};

export function SceneCard({
  scene,
  dragHandle = false,
  onRegenerateVideo,
  onSelectVideo,
  isRegenerating = false,
  isSelectingVideo = false,
}: SceneCardProps) {
  const hasVideo = sceneHasVideos(scene);
  const videoCount = getSceneVideos(scene).length;

  return (
    <div
      className={cn(
        'bg-card rounded-lg border p-4 shadow-sm',
        hasVideo && 'border-primary/30 bg-primary/5',
      )}
    >
      <div className="flex items-start gap-3">
        {dragHandle && (
          <span className="text-muted-foreground mt-1">
            <GripVertical className="size-4" aria-hidden="true" />
          </span>
        )}
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">
              Scene {scene.order}: {scene.title}
            </p>
            <Badge variant="outline">{SCENE_STATUS_LABELS[scene.status]}</Badge>
            <Badge variant="secondary">{formatRuntime(scene.durationSec)}</Badge>
            {hasVideo && (
              <Badge variant="default" className="gap-1">
                <Film className="size-3" />
                {videoCount} version{videoCount === 1 ? '' : 's'}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm">{scene.description}</p>
          <div className="text-muted-foreground flex flex-wrap gap-3 text-xs">
            {scene.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3" />
                {scene.location}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Users className="size-3" />
              {scene.characters.join(', ')}
            </span>
          </div>
          {hasVideo && (
            <SceneVideoVersions
              sceneTitle={scene.title}
              sceneOrder={scene.order}
              videos={scene.videos}
              videoUrl={scene.videoUrl}
              onSelectVideo={
                onSelectVideo ? (videoId) => onSelectVideo(scene.id, videoId) : undefined
              }
              isSelecting={isSelectingVideo}
              compact
            />
          )}
          {onRegenerateVideo && (
            <Button
              type="button"
              variant={hasVideo ? 'outline' : 'default'}
              size="sm"
              disabled={isRegenerating}
              onClick={() => onRegenerateVideo(scene.id)}
            >
              <RefreshCw className="size-3" />
              {hasVideo ? 'Regenerate video' : 'Generate video'}
            </Button>
          )}
          {scene.dialogueSnippet && (
            <p className="border-primary/20 bg-primary/5 rounded-md border-l-2 px-3 py-2 text-sm italic">
              “{scene.dialogueSnippet}”
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

type SortableSceneCardProps = {
  scene: Scene;
  onRegenerateVideo?: (sceneId: string) => void;
  onSelectVideo?: (sceneId: string, videoId: string) => void;
  isRegenerating?: boolean;
  isSelectingVideo?: boolean;
};

export function SortableSceneCard({
  scene,
  onRegenerateVideo,
  onSelectVideo,
  isRegenerating,
  isSelectingVideo,
}: SortableSceneCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: scene.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && 'opacity-60')}
      {...attributes}
      {...listeners}
    >
      <SceneCard
        scene={scene}
        dragHandle
        onRegenerateVideo={onRegenerateVideo}
        onSelectVideo={onSelectVideo}
        isRegenerating={isRegenerating}
        isSelectingVideo={isSelectingVideo}
      />
    </div>
  );
}
