import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useMemo } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SortableSceneCard } from '@/features/episode-planner/components/SceneCard';
import { useReorderScenes } from '@/features/episode-planner/hooks/useEpisodePlanner';
import type { Scene } from '@/types';

type SceneTimelineProps = {
  projectId: string;
  episodeId: string;
  scenes: Scene[];
  onRegenerateVideo?: (sceneId: string) => void;
  onSelectVideo?: (sceneId: string, videoId: string) => void;
  isRegeneratingVideo?: boolean;
  isSelectingVideo?: boolean;
};

export function SceneTimeline({
  projectId,
  episodeId,
  scenes,
  onRegenerateVideo,
  onSelectVideo,
  isRegeneratingVideo = false,
  isSelectingVideo = false,
}: SceneTimelineProps) {
  const reorderScenes = useReorderScenes(projectId, episodeId);
  const sortedScenes = useMemo(
    () => [...scenes].sort((a, b) => a.order - b.order),
    [scenes],
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortedScenes.findIndex((scene) => scene.id === active.id);
    const newIndex = sortedScenes.findIndex((scene) => scene.id === over.id);
    const reordered = arrayMove(sortedScenes, oldIndex, newIndex);

    reorderScenes.mutate({
      sceneIds: reordered.map((scene) => scene.id),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Scene timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedScenes.length === 0 ? (
          <p className="text-muted-foreground rounded-lg border border-dashed px-4 py-10 text-center text-sm">
            No scenes yet. Add scenes below to build the episode timeline.
          </p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sortedScenes.map((scene) => scene.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {sortedScenes.map((scene) => (
                  <SortableSceneCard
                    key={scene.id}
                    scene={scene}
                    onRegenerateVideo={onRegenerateVideo}
                    onSelectVideo={onSelectVideo}
                    isRegenerating={isRegeneratingVideo}
                    isSelectingVideo={isSelectingVideo}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
        <p className="text-muted-foreground mt-3 text-xs">
          Drag scenes to reorder the vertical episode timeline before scene generation.
        </p>
      </CardContent>
    </Card>
  );
}
