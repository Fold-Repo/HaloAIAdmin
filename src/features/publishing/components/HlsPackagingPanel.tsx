import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { HLS_STATUS_LABELS } from '@/features/publishing/utils/publishing.utils';
import type { HlsPackage } from '@/types';

function statusVariant(status: HlsPackage['status']) {
  switch (status) {
    case 'ready':
      return 'success' as const;
    case 'processing':
      return 'warning' as const;
    case 'failed':
      return 'destructive' as const;
    default:
      return 'secondary' as const;
  }
}

export function HlsPackagingPanel({ packages }: { packages: HlsPackage[] }) {
  return (
    <div className="space-y-4">
      {packages.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-10 text-center text-sm">
            No HLS packaging jobs found.
          </CardContent>
        </Card>
      ) : (
        packages.map((pkg) => (
          <Card key={pkg.episodeId}>
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <CardTitle className="text-base">{pkg.episodeTitle}</CardTitle>
                <Badge variant={statusVariant(pkg.status)}>{HLS_STATUS_LABELS[pkg.status]}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {pkg.progress > 0 && (
                <div>
                  <Progress value={pkg.progress} />
                  <p className="text-muted-foreground mt-1 text-xs">{pkg.progress}% packaged</p>
                </div>
              )}
              {pkg.variants.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {pkg.variants.map((variant) => (
                    <Badge key={variant} variant="outline">
                      {variant}
                    </Badge>
                  ))}
                </div>
              )}
              {pkg.manifestUrl && (
                <p className="font-mono text-xs break-all">{pkg.manifestUrl}</p>
              )}
              {pkg.errorMessage && (
                <p className="bg-destructive/10 text-destructive rounded-md p-2 text-xs">
                  {pkg.errorMessage}
                </p>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
