import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { fetchAuthenticatedBlob } from '@/api/client';
import { storyBibleService } from '@/features/story-bible/services/story-bible.service';

type PlayingTarget =
  | { mode: 'full' }
  | { mode: 'chapter'; chapterId: string }
  | { mode: 'browser'; chapterId?: string }
  | null;

type NarrationPlaybackContextValue = {
  playing: PlayingTarget;
  loadingId: string | null;
  playFull: (audioUrl: string) => Promise<void>;
  playChapter: (chapterId: string) => Promise<void>;
  playBrowserText: (text: string, chapterId?: string) => void;
  stop: () => void;
  isChapterPlaying: (chapterId: string) => boolean;
};

const NarrationPlaybackContext = createContext<NarrationPlaybackContextValue | null>(null);

export function NarrationPlaybackProvider({
  projectId,
  children,
}: {
  projectId: string;
  children: ReactNode;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [playing, setPlaying] = useState<PlayingTarget>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const revokeObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    window.speechSynthesis?.cancel();
    setPlaying(null);
    setLoadingId(null);
  }, []);

  useEffect(() => {
    return () => {
      stop();
      revokeObjectUrl();
    };
  }, [stop, revokeObjectUrl]);

  const playBlobUrl = useCallback(
    async (url: string, target: PlayingTarget) => {
      window.speechSynthesis?.cancel();
      revokeObjectUrl();
      objectUrlRef.current = url;

      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.addEventListener('ended', () => setPlaying(null));
      }

      audioRef.current.pause();
      audioRef.current.src = url;
      await audioRef.current.play();
      setPlaying(target);
    },
    [revokeObjectUrl],
  );

  const playFull = useCallback(
    async (audioUrl: string) => {
      if (playing?.mode === 'full') {
        stop();
        return;
      }
      setLoadingId('full');
      try {
        const absolute = audioUrl.startsWith('http')
          ? audioUrl
          : storyBibleService.getNarrationAudioUrl(projectId);
        const blobUrl = await fetchAuthenticatedBlob(absolute);
        await playBlobUrl(blobUrl, { mode: 'full' });
      } finally {
        setLoadingId(null);
      }
    },
    [playBlobUrl, playing, projectId, stop],
  );

  const playChapter = useCallback(
    async (chapterId: string) => {
      if (playing?.mode === 'chapter' && playing.chapterId === chapterId) {
        stop();
        return;
      }
      setLoadingId(chapterId);
      try {
        const blobUrl = await fetchAuthenticatedBlob(
          storyBibleService.getNarrationChapterAudioUrl(projectId, chapterId),
        );
        await playBlobUrl(blobUrl, { mode: 'chapter', chapterId });
      } finally {
        setLoadingId(null);
      }
    },
    [playBlobUrl, playing, projectId, stop],
  );

  const playBrowserText = useCallback(
    (text: string, chapterId?: string) => {
      if (!('speechSynthesis' in window)) return;
      if (
        playing?.mode === 'browser' &&
        ((!chapterId && !playing.chapterId) || playing.chapterId === chapterId)
      ) {
        stop();
        return;
      }

      audioRef.current?.pause();
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.onend = () => setPlaying(null);
      utterance.onerror = () => setPlaying(null);
      setPlaying({ mode: 'browser', chapterId });
      window.speechSynthesis.speak(utterance);
    },
    [playing, stop],
  );

  const value = useMemo<NarrationPlaybackContextValue>(
    () => ({
      playing,
      loadingId,
      playFull,
      playChapter,
      playBrowserText,
      stop,
      isChapterPlaying: (chapterId: string) =>
        (playing?.mode === 'chapter' && playing.chapterId === chapterId) ||
        (playing?.mode === 'browser' && playing.chapterId === chapterId),
    }),
    [loadingId, playBrowserText, playChapter, playFull, playing, stop],
  );

  return (
    <NarrationPlaybackContext.Provider value={value}>{children}</NarrationPlaybackContext.Provider>
  );
}

export function useNarrationPlayback() {
  const ctx = useContext(NarrationPlaybackContext);
  if (!ctx) {
    throw new Error('useNarrationPlayback must be used within NarrationPlaybackProvider');
  }
  return ctx;
}
