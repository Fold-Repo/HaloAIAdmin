import { useEffect, useMemo, useRef, useState } from 'react';
import { Headphones, Loader2, Pause, Play, RefreshCw, Square, Volume2 } from 'lucide-react';

import { fetchAuthenticatedBlob } from '@/api/client';
import { Button } from '@/components/ui/button';
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [browserPlaying, setBrowserPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const status = narrationQuery.data;
  const canPlayStudioAudio = status?.status === 'ready' || status?.status === 'stale';

  useEffect(() => {
    if (!canPlayStudioAudio) {
      setBlobUrl(null);
      return;
    }

    let active = true;
    let objectUrl: string | null = null;
    setLoadingAudio(true);
    setError(null);

    void fetchAuthenticatedBlob(storyBibleService.getNarrationAudioUrl(projectId))
      .then((url) => {
        if (!active) {
          URL.revokeObjectURL(url);
          return;
        }
        objectUrl = url;
        setBlobUrl(url);
      })
      .catch(() => {
        if (active) setError('Could not load narration audio.');
      })
      .finally(() => {
        if (active) setLoadingAudio(false);
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [projectId, canPlayStudioAudio, status?.scriptHash, status?.generatedAt]);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

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

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || !blobUrl) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    window.speechSynthesis?.cancel();
    setBrowserPlaying(false);
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setError('Playback failed. Try regenerating narration.');
    }
  };

  const stopAll = () => {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    setPlaying(false);
    window.speechSynthesis?.cancel();
    setBrowserPlaying(false);
  };

  const quickListenBrowser = async () => {
    if (!('speechSynthesis' in window)) {
      setError('Browser speech is not supported in this browser.');
      return;
    }
    if (browserPlaying) {
      window.speechSynthesis.cancel();
      setBrowserPlaying(false);
      return;
    }

    setError(null);
    audioRef.current?.pause();
    setPlaying(false);

    try {
      const script = await storyBibleService
        .getNarrationScript(projectId)
        .then((response) => response.data);
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(script.fullText);
      utterance.rate = 1;
      utterance.onend = () => setBrowserPlaying(false);
      utterance.onerror = () => {
        setBrowserPlaying(false);
        setError('Browser narration stopped unexpectedly.');
      };
      setBrowserPlaying(true);
      window.speechSynthesis.speak(utterance);
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
            Hear the full season plan from overview through every episode before generating videos.
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
          {canPlayStudioAudio && blobUrl ? (
            <Button size="sm" onClick={() => void togglePlay()} disabled={loadingAudio}>
              {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
              {playing ? 'Pause' : 'Play studio narration'}
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
            {browserPlaying ? <Square className="size-4" /> : <Play className="size-4" />}
            {browserPlaying ? 'Stop quick listen' : 'Quick listen (browser)'}
          </Button>

          {(playing || browserPlaying) && (
            <Button size="sm" variant="ghost" onClick={stopAll}>
              <Square className="size-4" />
              Stop
            </Button>
          )}
        </div>
      </div>

      {blobUrl ? (
        <audio
          ref={audioRef}
          src={blobUrl}
          preload="metadata"
          onEnded={() => setPlaying(false)}
          onPause={() => setPlaying(false)}
          onPlay={() => setPlaying(true)}
          className="w-full"
          controls
        />
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
