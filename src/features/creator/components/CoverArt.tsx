import { Clapperboard, Layers } from 'lucide-react';

import { AuthenticatedImage } from '@/features/story-bible/components/AuthenticatedImage';
import {
  getProjectCoverApiUrl,
  getProjectCoverPortraitApiUrl,
  getSeriesCoverApiUrl,
  getSeriesCoverPortraitApiUrl,
} from '@/features/creator/utils/creator.utils';

type ProjectCoverArtProps = {
  projectId: string;
  title: string;
  landscapeUrl?: string;
  portraitUrl?: string;
  variant: 'card' | 'banner';
};

export function ProjectCoverArt({
  projectId,
  title,
  landscapeUrl,
  portraitUrl,
  variant,
}: ProjectCoverArtProps) {
  const hasLandscape = Boolean(landscapeUrl);
  const hasPortrait = Boolean(portraitUrl);
  const placeholder = <Clapperboard className="text-muted-foreground size-10" aria-hidden="true" />;

  if (variant === 'banner') {
    return (
      <div className="bg-muted relative aspect-video w-full overflow-hidden rounded-lg">
        {hasLandscape ? (
          <AuthenticatedImage
            src={getProjectCoverApiUrl(projectId)}
            alt={`Cover for ${title}`}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : hasPortrait ? (
          <AuthenticatedImage
            src={getProjectCoverPortraitApiUrl(projectId)}
            alt={`Cover for ${title}`}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">{placeholder}</div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-muted relative w-full overflow-hidden">
      {hasPortrait && (
        <AuthenticatedImage
          src={getProjectCoverPortraitApiUrl(projectId)}
          alt={`Cover for ${title}`}
          className="aspect-[9/16] w-full object-cover md:hidden"
        />
      )}
      {hasLandscape ? (
        <AuthenticatedImage
          src={getProjectCoverApiUrl(projectId)}
          alt={`Cover for ${title}`}
          className={`w-full object-cover ${hasPortrait ? 'hidden aspect-video md:block' : 'aspect-[9/16] md:aspect-video'}`}
        />
      ) : hasPortrait ? (
        <AuthenticatedImage
          src={getProjectCoverPortraitApiUrl(projectId)}
          alt={`Cover for ${title}`}
          className="hidden aspect-video w-full object-cover md:block"
        />
      ) : (
        <div className="flex aspect-[9/16] items-center justify-center md:aspect-video">
          {placeholder}
        </div>
      )}
    </div>
  );
}

type SeriesCoverArtProps = {
  seriesId: string;
  title: string;
  landscapeUrl?: string;
  portraitUrl?: string;
  variant: 'card' | 'banner';
};

export function SeriesCoverArt({
  seriesId,
  title,
  landscapeUrl,
  portraitUrl,
  variant,
}: SeriesCoverArtProps) {
  const hasLandscape = Boolean(landscapeUrl);
  const hasPortrait = Boolean(portraitUrl);
  const placeholder = <Layers className="text-muted-foreground size-8" aria-hidden="true" />;

  if (variant === 'banner') {
    return (
      <div className="bg-muted relative aspect-video w-full overflow-hidden rounded-lg">
        {hasLandscape ? (
          <AuthenticatedImage
            src={getSeriesCoverApiUrl(seriesId)}
            alt={`Cover for ${title}`}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : hasPortrait ? (
          <AuthenticatedImage
            src={getSeriesCoverPortraitApiUrl(seriesId)}
            alt={`Cover for ${title}`}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">{placeholder}</div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-muted relative w-full overflow-hidden">
      {hasPortrait && (
        <AuthenticatedImage
          src={getSeriesCoverPortraitApiUrl(seriesId)}
          alt={`Cover for ${title}`}
          className="aspect-[9/16] w-full object-cover md:hidden"
        />
      )}
      {hasLandscape ? (
        <AuthenticatedImage
          src={getSeriesCoverApiUrl(seriesId)}
          alt={`Cover for ${title}`}
          className={`w-full object-cover ${hasPortrait ? 'hidden aspect-video md:block' : 'aspect-[9/16] md:aspect-video'}`}
        />
      ) : hasPortrait ? (
        <AuthenticatedImage
          src={getSeriesCoverPortraitApiUrl(seriesId)}
          alt={`Cover for ${title}`}
          className="hidden aspect-video w-full object-cover md:block"
        />
      ) : (
        <div className="flex aspect-[9/16] items-center justify-center md:aspect-video">
          {placeholder}
        </div>
      )}
    </div>
  );
}
