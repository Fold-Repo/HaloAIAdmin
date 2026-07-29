import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToggleFeatureFlag } from '@/features/admin/hooks/useAdminPortal';
import type { FeatureFlag } from '@/types';

export function FeatureFlagsPanel({ flags }: { flags: FeatureFlag[] }) {
  const toggleFlag = useToggleFeatureFlag();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Feature flags</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {flags.map((flag) => (
          <div key={flag.id} className="flex items-start justify-between gap-4 rounded-lg border p-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id={flag.id}
                checked={flag.enabled}
                disabled={toggleFlag.isPending}
                onCheckedChange={(value) =>
                  toggleFlag.mutate({ flagId: flag.id, enabled: value === true })
                }
              />
              <div>
                <Label htmlFor={flag.id} className="font-medium">
                  {flag.name}
                </Label>
                <p className="text-muted-foreground mt-1 text-xs">{flag.description}</p>
              </div>
            </div>
            <Badge variant="outline">{flag.environment}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
