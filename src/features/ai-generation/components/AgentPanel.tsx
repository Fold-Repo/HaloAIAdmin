import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { SceneAiPreviewPanel } from '@/features/ai-generation/components/SceneAiPreviewPanel';
import {
  AGENT_STATUS_LABELS,
  formatUsd,
} from '@/features/ai-generation/utils/ai-generation.utils';
import { useModelsForAgent } from '@/features/ai-generation/hooks/useAiSettings';
import { useRunAgent } from '@/features/ai-generation/hooks/useAiGeneration';
import { ROUTES } from '@/constants';
import type { AiAgent } from '@/types';

type AgentPanelProps = {
  projectId: string;
  agent: AiAgent;
};

export function AgentPanel({ projectId, agent }: AgentPanelProps) {
  const runAgent = useRunAgent(projectId);
  const { models, settings } = useModelsForAgent(agent.id);
  const [prompt, setPrompt] = useState('');
  const [modelId, setModelId] = useState('');

  useEffect(() => {
    if (!modelId && models.length > 0) {
      setModelId(models[0].id);
    }
  }, [modelId, models]);

  const handleRun = () => {
    runAgent.mutate({
      agentId: agent.id,
      prompt: prompt || undefined,
      modelId: modelId || undefined,
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>{agent.name}</CardTitle>
              <p className="text-muted-foreground mt-1 text-sm">
                {agent.provider} · {agent.model}
              </p>
            </div>
            <Badge variant="secondary">{AGENT_STATUS_LABELS[agent.status]}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">{agent.description}</p>
          {agent.status === 'running' && (
            <div className="space-y-1">
              <Progress value={agent.progress} />
              <p className="text-muted-foreground text-xs">{agent.progress}% complete</p>
            </div>
          )}
          {agent.outputPreview && (
            <div className="bg-muted rounded-md p-3 text-sm">{agent.outputPreview}</div>
          )}
          <p className="text-muted-foreground text-xs">
            Active model: {agent.model} ({agent.provider})
            {settings?.selectionMode === 'auto' && ' · auto mode'}
          </p>
          <p className="text-muted-foreground text-xs">
            Estimated cost: {formatUsd(agent.estimatedCostUsd)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">Run agent</CardTitle>
              <Link
                to={ROUTES.STUDIO.AI_SETTINGS}
                className="text-muted-foreground hover:text-foreground text-xs underline"
              >
                Configure models in AI Settings
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {models.length > 0 && (
            <div className="space-y-1">
              <Label htmlFor="model-select">Model for this run</Label>
              <select
                id="model-select"
                className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                value={modelId}
                onChange={(event) => setModelId(event.target.value)}
              >
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.label} ({model.providerLabel})
                  </option>
                ))}
              </select>
            </div>
          )}
          <Textarea
            rows={4}
            placeholder="Optional custom prompt override..."
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
          />
          <Button
            type="button"
            disabled={runAgent.isPending || agent.status === 'running'}
            onClick={handleRun}
          >
            <Sparkles className="size-4" />
            {runAgent.isPending ? 'Generating...' : `Run ${agent.name}`}
          </Button>
          {runAgent.data && (
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">{runAgent.data.data.message}</p>
              {runAgent.data.data.outputPreview && (
                <pre className="bg-muted max-h-48 overflow-auto rounded-md p-3 text-xs whitespace-pre-wrap">
                  {runAgent.data.data.outputPreview}
                </pre>
              )}
            </div>
          )}
          {runAgent.isError && (
            <p className="text-destructive text-sm">
              {(runAgent.error as Error)?.message ?? 'Generation failed.'}
            </p>
          )}
        </CardContent>
      </Card>

      {['script', 'video', 'character', 'voice'].includes(agent.id) && (
        <SceneAiPreviewPanel projectId={projectId} agentId={agent.id} modelId={modelId} />
      )}
    </div>
  );
}
