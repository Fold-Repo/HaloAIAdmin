import { Link } from 'react-router-dom';
import { Settings2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { LoadingScreen, QueryError } from '@/components/common';
import { ROUTES } from '@/constants';
import {
  useAiSettings,
  useUpdateAiSettings,
} from '@/features/ai-generation/hooks/useAiSettings';
import type { AiTaskCategory, AiModelCatalogItem } from '@/types';

const TASK_LABELS: Record<AiTaskCategory, string> = {
  story: 'Story planning',
  script: 'Script / text',
  character: 'Character images',
  video: 'Video',
  voice: 'Voice',
  subtitle: 'Subtitles',
  music: 'Music',
};

const TASK_ORDER: AiTaskCategory[] = [
  'story',
  'script',
  'character',
  'video',
  'voice',
  'subtitle',
  'music',
];

export function AiSettingsPage() {
  const settingsQuery = useAiSettings();
  const updateSettings = useUpdateAiSettings();
  const [selectionMode, setSelectionMode] = useState<'auto' | 'manual'>('auto');
  const [fallbackEnabled, setFallbackEnabled] = useState(true);
  const [enabledModels, setEnabledModels] = useState<string[]>([]);
  const [manualSelections, setManualSelections] = useState<Partial<Record<AiTaskCategory, string>>>(
    {},
  );
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (settingsQuery.data && !initialized) {
      setSelectionMode(settingsQuery.data.settings.selectionMode);
      setFallbackEnabled(settingsQuery.data.settings.fallbackEnabled);
      setEnabledModels(settingsQuery.data.settings.enabledModels);
      setManualSelections(settingsQuery.data.settings.manualSelections);
      setInitialized(true);
    }
  }, [initialized, settingsQuery.data]);

  const groupedModels = useMemo(() => {
    const models = settingsQuery.data?.models ?? [];
    return TASK_ORDER.map((task) => ({
      task,
      models: models.filter((model) => model.category === task),
    })).filter((group) => group.models.length > 0);
  }, [settingsQuery.data?.models]);

  if (settingsQuery.isLoading) {
    return <LoadingScreen message="Loading AI settings..." />;
  }

  if (settingsQuery.isError || !settingsQuery.data) {
    return (
      <QueryError
        title="Unable to load AI settings"
        message={settingsQuery.error?.message ?? 'Something went wrong.'}
        onRetry={() => void settingsQuery.refetch()}
      />
    );
  }

  const toggleModel = (modelId: string, checked: boolean) => {
    setEnabledModels((current) =>
      checked ? [...new Set([...current, modelId])] : current.filter((id) => id !== modelId),
    );
  };

  const handleSave = () => {
    updateSettings.mutate({
      selectionMode,
      fallbackEnabled,
      enabledModels,
      manualSelections,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-muted-foreground mb-1 flex items-center gap-2 text-sm">
            <Settings2 className="size-4" />
            Studio settings
          </div>
          <h1 className="text-3xl font-bold tracking-tight">AI model settings</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
            Enable only the models you want the system to use. In auto mode, the best enabled model
            is picked per task. If credits run out, fallback tries the next enabled model.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to={ROUTES.STUDIO.PROJECTS}>Back to projects</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Selection mode</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="selection-mode"
                checked={selectionMode === 'auto'}
                onChange={() => setSelectionMode('auto')}
              />
              Auto — pick best enabled model per task
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="selection-mode"
                checked={selectionMode === 'manual'}
                onChange={() => setSelectionMode('manual')}
              />
              Manual — choose a default model per task type
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="fallback-enabled"
              checked={fallbackEnabled}
              onCheckedChange={(value) => setFallbackEnabled(value === true)}
            />
            <Label htmlFor="fallback-enabled">
              Auto-fallback to next enabled model when credits or rate limits fail
            </Label>
          </div>
        </CardContent>
      </Card>

      {groupedModels.map(({ task, models }) => (
        <Card key={task}>
          <CardHeader>
            <CardTitle className="text-base">{TASK_LABELS[task]}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {models.map((model) => (
              <ModelRow
                key={model.id}
                model={model}
                enabled={enabledModels.includes(model.id)}
                manualSelected={manualSelections[task] === model.id}
                showManual={selectionMode === 'manual'}
                onToggle={(checked) => toggleModel(model.id, checked)}
                onSelectManual={() =>
                  setManualSelections((current) => ({ ...current, [task]: model.id }))
                }
              />
            ))}
          </CardContent>
        </Card>
      ))}

      <div className="flex items-center gap-3">
        <Button type="button" disabled={updateSettings.isPending} onClick={handleSave}>
          {updateSettings.isPending ? 'Saving...' : 'Save AI settings'}
        </Button>
        {updateSettings.isSuccess && (
          <p className="text-muted-foreground text-sm">Settings saved.</p>
        )}
      </div>
    </div>
  );
}

function ModelRow({
  model,
  enabled,
  manualSelected,
  showManual,
  onToggle,
  onSelectManual,
}: {
  model: AiModelCatalogItem;
  enabled: boolean;
  manualSelected: boolean;
  showManual: boolean;
  onToggle: (checked: boolean) => void;
  onSelectManual: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{model.label}</span>
          <Badge variant="outline">{model.providerLabel}</Badge>
          {!model.configured && <Badge variant="secondary">API key missing</Badge>}
        </div>
        <p className="text-muted-foreground text-sm">{model.description}</p>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={enabled}
            disabled={!model.configured}
            onCheckedChange={(value) => onToggle(value === true)}
          />
          <Label>Enabled</Label>
        </div>
        {showManual && enabled && (
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" checked={manualSelected} onChange={onSelectManual} />
            Default for {TASK_LABELS[model.category]}
          </label>
        )}
      </div>
    </div>
  );
}
