import { useEffect, useMemo, useState } from 'react';
import { Headphones, Loader2, Pause, Play, RefreshCw, Square, Volume2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useNarrationPlayback } from '@/features/story-bible/components/NarrationPlaybackContext';
import {
  useGenerateStoryNarration,
  useStoryNarration,
} from '@/features/story-bible/hooks/useStoryBible';
import { storyBibleService } from '@/features/story-bible/services/story-bible.service';
import type { ApiError, StoryNarrationScript } from '@/types';

type StoryNarrationPlayerProps = {
  projectId: string;
  hasEpisodePlan: boolean;
};

export function StoryNarrationPlayer({ projectId, hasEpisodePlan }: StoryNarrationPlayerProps) {
  const narrationQuery = useStoryNarration(projectId, hasEpisodePlan);
  const generateMutation = useGenerateStoryNarration(projectId);
  const playback = useNarrationPlayback();
  const [script, setScript] = useState<StoryNarrationScript | null>(null);
  const [scriptLoading, setScriptLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStudio, setShowStudio] = useState(false);

  const status = narrationQuery.data;
  const canPlayStudioAudio = status?.status === 'ready' || status?.status === 'stale';
  const playingFull = playback.playing?.mode === 'full';
  const browserPlayingAll =
    playback.playing?.mode === 'browser' && playback.playing.chapterId === undefined;

  useEffect(() => {
    if (!hasEpisodePlan) return;
    let active = true;
    setScriptLoading(true);
    void storyBibleService
      .getNarrationScript(projectId)
      .then((response) => {
        if (active) setScript(response.data);
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Could not load narration script.');
        }
      })
      .finally(() => {
        if (active) setScriptLoading(false);
      });
    return () => {
      active = false;
    };
  }, [projectId, hasEpisodePlan, narrationQuery.dataUpdatedAt]);

  const chapterLabel = useMemo(() => {
    const count = script?.chapters.length ?? status?.chapterCount;
    if (!count) return null;
    const chars =
      script?.chapters.reduce((sum, chapter) => sum + chapter.text.length, 0) ??
      status?.characterCount ??
      0;
    return `${count} chapter${count === 1 ? '' : 's'} · ~${Math.max(1, Math.round(chars / 900))} min`;
  }, [script, status]);

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

  const toggleBrowserFull = async () => {
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
      const next =
        script ??
        (await storyBibleService.getNarrationScript(projectId).then((response) => response.data));
      if (!script) setScript(next);
      playback.playBrowserText(next.fullText);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load narration script.');
    }
  };

  const toggleStudioFull = async () => {
    if (!canPlayStudioAudio) return;
    setError(null);
    try {
      await playback.playFull(storyBibleService.getNarrationAudioUrl(projectId));
    } catch {
      setError('Studio playback failed. Regenerate studio narration.');
    }
  };

  const playBrowserChapter = (chapterId: string, text: string, title: string) => {
    if (!('speechSynthesis' in window)) {
      setError('Browser speech is not supported in this browser.');
      return;
    }
    playback.playBrowserText(`${title}. ${text}`, chapterId);
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
            Default is <strong>browser voice</strong> (instant). Studio AI voice is optional.
          </p>
          {chapterLabel ? <p className="text-muted-foreground text-xs">{chapterLabel}</p> : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => void toggleBrowserFull()}
            disabled={scriptLoading || generateMutation.isPending}
          >
            {scriptLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : browserPlayingAll ? (
              <Pause className="size-4" />
            ) : (
              <Play className="size-4" />
            )}
            {browserPlayingAll ? 'Pause story' : 'Play story (browser)'}
          </Button>

          {playback.playing ? (
            <Button size="sm" variant="ghost" onClick={playback.stop}>
              <Square className="size-4" />
              Stop
            </Button>
          ) : null}

          <Button size="sm" variant="outline" onClick={() => setShowStudio((value) => !value)}>
            <Volume2 className="size-4" />
            {showStudio ? 'Hide studio AI' : 'Studio AI voice'}
          </Button>
        </div>
      </div>

      {script?.chapters?.length ? (
        <div className="flex flex-wrap gap-2">
          {script.chapters.map((chapter) => {
            const active = playback.isChapterPlaying(chapter.id);
            return (
              <Button
                key={chapter.id}
                size="sm"
                variant={active ? 'default' : 'outline'}
                onClick={() => playBrowserChapter(chapter.id, chapter.text, chapter.title)}
              >
                {active ? <Pause className="size-3" /> : <Play className="size-3" />}
                {chapter.episodeNumber != null ? `Ep ${chapter.episodeNumber}` : chapter.title}
              </Button>
            );
          })}
        </div>
      ) : null}

      {showStudio ? (
        <div className="space-y-2 rounded-md border border-dashed p-3">
          <p className="text-muted-foreground text-xs">
            Optional higher-quality AI narration (OpenAI / ElevenLabs). Takes longer to generate.
          </p>
          {status?.status === 'stale' ? (
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Story changed since the last studio narration. Regenerate for an up-to-date listen.
            </p>
          ) : null}
          {status?.status === 'ready' && status.generatedAt ? (
            <p className="text-muted-foreground text-xs">
              Studio voice ({status.provider}/{status.voice}) · generated{' '}
              {new Date(status.generatedAt).toLocaleString()}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {canPlayStudioAudio ? (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => void toggleStudioFull()}
                  disabled={playback.loadingId === 'full'}
                >
                  {playback.loadingId === 'full' ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : playingFull ? (
                    <Pause className="size-4" />
                  ) : (
                    <Play className="size-4" />
                  )}
                  {playingFull ? 'Pause studio story' : 'Play studio story'}
                </Button>
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
                  Regenerate studio
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => void handleGenerate(false)}
                disabled={generateMutation.isPending || narrationQuery.isLoading}
              >
                {generateMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Volume2 className="size-4" />
                )}
                {generateMutation.isPending ? 'Generating studio…' : 'Generate studio narration'}
              </Button>
            )}
          </div>
        </div>
      ) : null}

      {(error || mutationError) && (
        <p className="text-destructive text-xs">{error || mutationError}</p>
      )}
    </div>
  );
}
