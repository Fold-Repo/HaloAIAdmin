import { useMemo, useState } from 'react';
import { Headphones, Loader2, Pause, Play, RefreshCw, Square, Volume2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useNarrationPlayback } from '@/features/story-bible/components/NarrationPlaybackContext';
import {
  useGenerateStoryNarration,
  useStoryNarration,
} from '@/features/story-bible/hooks/useStoryBible';
import { storyBibleService } from '@/features/story-bible/services/story-bible.service';
import type { ApiError } from '@/types';

type StoryNarrationPlayerProps = {
  projectId: string;
  hasEpisodePlan: boolean;
};

export function StoryNarrationPlayer({ projectId, hasEpisodePlan }: StoryNarrationPlayerProps) {
  const narrationQuery = useStoryNarration(projectId, hasEpisodePlan);
  const generateMutation = useGenerateStoryNarration(projectId);
  const playback = useNarrationPlayback();
  const [error, setError] = useState<string | null>(null);

  const status = narrationQuery.data;
  const canPlayStudioAudio = status?.status === 'ready' || status?.status === 'stale';
  const playingFull = playback.playing?.mode === 'full';
  const browserPlayingAll =
    playback.playing?.mode === 'browser' && playback.playing.chapterId === undefined;

  const chapterLabel = useMemo(() => {
    if (!status) return null;
    return `${status.chapterCount} chapter${status.chapterCount === 1 ? '' : 's'} · ~${Math.max(
      1,
      Math.round(status.characterCount / 900),
    )} min`;
  }, [status]);

  const mutationError =
    (generateMutation.error as ApiError | null)?.message ??
    (generateMutation.error instanceof Error ? generateMutation.error.message : null);

  const handleGenerate = async (regenerate = false) => {
    setError(null);
    try {
      await generateMutation.mutateAsync({ regenerate });
    } catch {
      // surfaced via mutationError
    }
  };

  const toggleFullPlay = async () => {
    if (!canPlayStudioAudio) return;
    setError(null);
    try {
      await playback.playFull(storyBibleService.getNarrationAudioUrl(projectId));
    } catch {
      setError('Playback failed. Regenerate narration to create per-episode audio.');
    }
  };

  const quickListenBrowser = async () => {
    if (!('speechSynthesis' in window)) {
      setError('Browser speech is not supported in this browser.');
      return;
    }
    setError(null);
    try {
      if (browserPlayingAll) {
        playback.stop();
        return;
      }
      const script = await storyBibleService
        .getNarrationScript(projectId)
        .then((response) => response.data);
      playback.playBrowserText(script.fullText);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load narration script.');
    }
  };

  if (!hasEpisodePlan) return null;

  return (
    <div className="bg-muted/40 space-y-3 rounded-lg border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Headphones className="size-4" />
            Listen to the story
          </div>
          <p className="text-muted-foreground text-xs">
            Play the full season, or use <strong>Listen</strong> on each episode card below.
          </p>
          {chapterLabel ? <p className="text-muted-foreground text-xs">{chapterLabel}</p> : null}
          {status?.status === 'stale' ? (
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Story changed since the last narration. Regenerate for an up-to-date listen.
            </p>
          ) : null}
          {status?.status === 'ready' && status.generatedAt ? (
            <p className="text-muted-foreground text-xs">
              Studio voice ({status.provider}/{status.voice}) · generated{' '}
              {new Date(status.generatedAt).toLocaleString()}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {canPlayStudioAudio ? (
            <Button
              size="sm"
              onClick={() => void toggleFullPlay()}
              disabled={playback.loadingId === 'full'}
            >
              {playback.loadingId === 'full' ? (
                <Loader2 className="size-4 animate-spin" />
              ) : playingFull ? (
                <Pause className="size-4" />
              ) : (
                <Play className="size-4" />
              )}
              {playingFull ? 'Pause full story' : 'Play full story'}
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => void handleGenerate(false)}
              disabled={generateMutation.isPending || narrationQuery.isLoading}
            >
              {generateMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Volume2 className="size-4" />
              )}
              {generateMutation.isPending ? 'Generating narration…' : 'Generate studio narration'}
            </Button>
          )}

          {canPlayStudioAudio ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => void handleGenerate(true)}
              disabled={generateMutation.isPending}
            >
              {generateMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" />
              )}
              Regenerate
            </Button>
          ) : null}

          <Button
            size="sm"
            variant="secondary"
            onClick={() => void quickListenBrowser()}
            disabled={generateMutation.isPending}
          >
            {browserPlayingAll ? <Square className="size-4" /> : <Play className="size-4" />}
            {browserPlayingAll ? 'Stop quick listen' : 'Quick listen (browser)'}
          </Button>

          {playback.playing ? (
            <Button size="sm" variant="ghost" onClick={playback.stop}>
              <Square className="size-4" />
              Stop
            </Button>
          ) : null}
        </div>
      </div>

      {canPlayStudioAudio && status?.chapters?.length ? (
        <div className="flex flex-wrap gap-2">
          {status.chapters.map((chapter) => {
            const active = playback.isChapterPlaying(chapter.id);
            const loading = playback.loadingId === chapter.id;
            return (
              <Button
                key={chapter.id}
                size="sm"
                variant={active ? 'default' : 'outline'}
                disabled={!chapter.audioUrl || generateMutation.isPending}
                onClick={() =>
                  void playback
                    .playChapter(chapter.id)
                    .catch(() => setError('Episode audio missing — regenerate narration.'))
                }
              >
                {loading ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : active ? (
                  <Pause className="size-3" />
                ) : (
                  <Play className="size-3" />
                )}
                {chapter.episodeNumber != null ? `Ep ${chapter.episodeNumber}` : chapter.title}
              </Button>
            );
          })}
        </div>
      ) : null}

      {(error || mutationError || narrationQuery.error) && (
        <p className="text-destructive text-xs">
          {error ||
            mutationError ||
            (narrationQuery.error as ApiError | undefined)?.message ||
            'Narration unavailable.'}
        </p>
      )}
    </div>
  );
}
