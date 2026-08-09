import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

type StreamableVideoProps = {
  src: string;
  className?: string;
};

/** Plays progressive MP4 or HLS (.m3u8) in admin preview. */
export function StreamableVideo({ src, className }: StreamableVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    const isHls = /\.m3u8(\?|$)/i.test(src);

    if (!isHls) {
      video.src = src;
      return () => {
        video.removeAttribute('src');
        video.load();
      };
    }

    // Safari / iOS: native HLS
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      return () => {
        video.removeAttribute('src');
        video.load();
      };
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      return () => {
        hls.destroy();
      };
    }

    video.src = src;
    return () => {
      video.removeAttribute('src');
      video.load();
    };
  }, [src]);

  return <video ref={videoRef} controls playsInline className={className} />;
}
