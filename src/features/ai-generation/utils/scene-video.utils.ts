import type { SceneVideo } from '@/types';

type SceneWithVideos = {
  videoUrl?: string;
  videos?: SceneVideo[];
};

export function getSceneVideos(scene: SceneWithVideos): SceneVideo[] {
  if (scene.videos?.length) {
    return scene.videos;
  }

  if (scene.videoUrl?.trim()) {
    return [
      {
        id: 'legacy',
        videoUrl: scene.videoUrl,
        createdAt: '',
        isSelected: true,
      },
    ];
  }

  return [];
}

export function sceneHasVideos(scene: SceneWithVideos): boolean {
  return getSceneVideos(scene).length > 0;
}

export function formatVideoVersionLabel(video: SceneVideo, index: number, total: number) {
  const dateLabel =
    video.createdAt &&
    new Date(video.createdAt).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

  const versionNum = total - index;
  const parts = [`Version ${versionNum}${index === 0 ? ' (latest)' : ''}`];
  if (dateLabel) parts.push(dateLabel);
  if (video.modelId) parts.push(video.modelId);
  return parts.join(' · ');
}
