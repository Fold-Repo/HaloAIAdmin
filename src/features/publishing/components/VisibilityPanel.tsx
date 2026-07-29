import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUpdatePublishSettings } from '@/features/publishing/hooks/usePublishing';
import { VISIBILITY_LABELS, VISIBILITY_OPTIONS } from '@/features/publishing/utils/publishing.utils';
import type { PublishSettings } from '@/types';

type VisibilityPanelProps = {
  projectId: string;
  settings: PublishSettings;
};

export function VisibilityPanel({ projectId, settings }: VisibilityPanelProps) {
  const updateSettings = useUpdatePublishSettings(projectId);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Visibility</CardTitle>
          <Badge variant="secondary">{VISIBILITY_LABELS[settings.visibility]}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {VISIBILITY_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`w-full rounded-lg border p-4 text-left transition-colors ${
              settings.visibility === option.value
                ? 'border-primary bg-primary/5'
                : 'hover:bg-accent'
            }`}
            onClick={() => updateSettings.mutate({ visibility: option.value })}
          >
            <p className="font-medium">{option.label}</p>
            <p className="text-muted-foreground mt-1 text-xs">{option.description}</p>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
