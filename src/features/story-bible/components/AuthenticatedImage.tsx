import { useEffect, useState } from 'react';
import { ImageIcon, Loader2 } from 'lucide-react';

import { fetchAuthenticatedBlob } from '@/api/client';
import { cn } from '@/utils/cn';

type AuthenticatedImageProps = {
  src: string;
  alt: string;
  className?: string;
};

export function AuthenticatedImage({ src, alt, className }: AuthenticatedImageProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    setLoading(true);
    setError(false);
    setBlobUrl(null);

    void fetchAuthenticatedBlob(src)
      .then((url) => {
        if (!active) {
          URL.revokeObjectURL(url);
          return;
        }
        objectUrl = url;
        setBlobUrl(url);
      })
      .catch(() => {
        if (active) {
          setError(true);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src]);

  if (loading) {
    return (
      <div
        className={cn(
          'bg-muted text-muted-foreground flex items-center justify-center rounded-lg border',
          className,
        )}
      >
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  if (error || !blobUrl) {
    return (
      <div
        className={cn(
          'bg-muted text-muted-foreground flex items-center justify-center rounded-lg border',
          className,
        )}
      >
        <ImageIcon className="size-5" />
      </div>
    );
  }

  return <img src={blobUrl} alt={alt} className={cn('rounded-lg border object-cover', className)} />;
}
