import { Download, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';

import { fetchAuthenticatedBlob } from '@/api/client';
import { StreamableVideo } from '@/components/common/StreamableVideo';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { downloadBlob, downloadRemoteVideo } from '@/utils';

type VideoPreviewModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoUrl: string;
  title: string;
  subtitle?: string;
  downloadFilename?: string;
};

export function VideoPreviewModal({
  open,
  onOpenChange,
  videoUrl,
  title,
  subtitle,
  downloadFilename,
}: VideoPreviewModalProps) {
  const isHls = /\.m3u8(\?|$)/i.test(videoUrl);
  const needsAuth = videoUrl.includes('/media/scene-videos/');
  const [playableUrl, setPlayableUrl] = useState(needsAuth ? '' : videoUrl);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!open) return;
    if (!needsAuth) {
      setPlayableUrl(videoUrl);
      setLoadError('');
      return;
    }

    let objectUrl = '';
    let cancelled = false;
    setPlayableUrl('');
    setLoadError('');
    void fetchAuthenticatedBlob(videoUrl)
      .then((blobUrl) => {
        if (cancelled) {
          URL.revokeObjectURL(blobUrl);
          return;
        }
        objectUrl = blobUrl;
        setPlayableUrl(blobUrl);
      })
      .catch(() => {
        if (!cancelled) setLoadError('Could not load this scene video.');
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [needsAuth, open, videoUrl]);

  const handleDownload = async () => {
    const filename =
      downloadFilename ?? `${title.replace(/[^\w.-]+/g, '_')}${isHls ? '.m3u8' : '.mp4'}`;
    if (playableUrl.startsWith('blob:') || videoUrl.startsWith('blob:')) {
      downloadBlob(playableUrl || videoUrl, filename);
      return;
    }
    await downloadRemoteVideo(videoUrl, filename);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm gap-3 p-4 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">{title}</DialogTitle>
          {subtitle && <DialogDescription>{subtitle}</DialogDescription>}
        </DialogHeader>
        <div className="bg-muted mx-auto w-full overflow-hidden rounded-lg">
          {loadError ? (
            <p className="text-muted-foreground px-3 py-8 text-center text-sm">{loadError}</p>
          ) : playableUrl ? (
            <StreamableVideo
              key={playableUrl}
              src={playableUrl}
              className="mx-auto aspect-[9/16] max-h-[70vh] w-full object-contain"
            />
          ) : null}
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Button type="button" variant="default" size="sm" onClick={() => void handleDownload()}>
            <Download className="size-4" />
            {isHls ? 'Open playlist' : 'Download MP4'}
          </Button>
          {!needsAuth && !videoUrl.startsWith('blob:') && (
            <Button asChild variant="outline" size="sm">
              <a href={videoUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="size-4" />
                Open in new tab
              </a>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
