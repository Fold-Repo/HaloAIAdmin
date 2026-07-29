import { Loader2, RefreshCw, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ProjectCoverArt, SeriesCoverArt } from '@/features/creator/components/CoverArt';

type CoverImageBannerProps = {
  kind: 'project' | 'series';
  entityId: string;
  title: string;
  landscapeUrl?: string;
  portraitUrl?: string;
  isGenerating: boolean;
  errorMessage?: string;
  onGenerate: (regenerate: boolean) => void;
};

export function CoverImageBanner({
  kind,
  entityId,
  title,
  landscapeUrl,
  portraitUrl,
  isGenerating,
  errorMessage,
  onGenerate,
}: CoverImageBannerProps) {
  const hasCover = Boolean(landscapeUrl || portraitUrl);

  return (
    <div className="relative space-y-2">
      {kind === 'project' ? (
        <ProjectCoverArt
          projectId={entityId}
          title={title}
          landscapeUrl={landscapeUrl}
          portraitUrl={portraitUrl}
          variant="banner"
        />
      ) : (
        <SeriesCoverArt
          seriesId={entityId}
          title={title}
          landscapeUrl={landscapeUrl}
          portraitUrl={portraitUrl}
          variant="banner"
        />
      )}

      {!hasCover && (
        <div className="text-muted-foreground flex items-center justify-center gap-2 py-6 text-sm">
          <Sparkles className="size-4" />
          Generates landscape (web/tablet) and portrait (mobile) covers
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-muted-foreground text-xs">
          {hasCover
            ? 'Landscape for web & tablet · Portrait for mobile grid'
            : 'No cover images yet'}
        </p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isGenerating}
          onClick={() => onGenerate(hasCover)}
        >
          {isGenerating ? (
            <Loader2 className="size-4 animate-spin" />
          ) : hasCover ? (
            <RefreshCw className="size-4" />
          ) : (
            <Sparkles className="size-4" />
          )}
          {hasCover ? 'Regenerate covers' : 'Generate covers'}
        </Button>
      </div>

      {errorMessage && (
        <p className="text-destructive text-sm" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
