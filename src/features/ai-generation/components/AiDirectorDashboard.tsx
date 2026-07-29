import { Play, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  AGENT_STATUS_LABELS,
  PIPELINE_STEPS,
  formatUsd,
  getAiGenerationPath,
} from '@/features/ai-generation/utils/ai-generation.utils';
import { useRunAgent, useRunPipeline } from '@/features/ai-generation/hooks/useAiGeneration';
import type { AiAgent, AiDirectorOverview } from '@/types';

type AiDirectorDashboardProps = {
  projectId: string;
  overview: AiDirectorOverview;
};

function statusVariant(status: AiAgent['status']) {
  switch (status) {
    case 'completed':
      return 'success' as const;
    case 'running':
      return 'warning' as const;
    case 'failed':
      return 'destructive' as const;
    case 'queued':
      return 'secondary' as const;
    default:
      return 'outline' as const;
  }
}

export function AiDirectorDashboard({ projectId, overview }: AiDirectorDashboardProps) {
  const runPipeline = useRunPipeline(projectId);
  const runAgent = useRunAgent(projectId);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pipeline stage</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{overview.pipelineStage}</p>
            <Progress className="mt-3" value={overview.overallProgress} />
            <p className="text-muted-foreground mt-2 text-xs">{overview.overallProgress}% complete</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatUsd(overview.totalCostUsd)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Remaining est.</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatUsd(overview.estimatedRemainingCostUsd)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              disabled={runPipeline.isPending}
              onClick={() => runPipeline.mutate()}
            >
              <Play className="size-4" />
              {runPipeline.isPending ? 'Starting...' : 'Run full pipeline'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Automation pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {PIPELINE_STEPS.map((step, index) => (
              <Badge key={step} variant={index < 3 ? 'default' : 'outline'}>
                {index + 1}. {step}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {overview.agents.map((agent) => (
          <Card key={agent.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">{agent.name}</CardTitle>
                <Badge variant={statusVariant(agent.status)}>
                  {AGENT_STATUS_LABELS[agent.status]}
                </Badge>
              </div>
              <p className="text-muted-foreground text-xs">
                {agent.provider} · {agent.model}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">{agent.description}</p>
              {agent.status === 'running' && <Progress value={agent.progress} />}
              {agent.outputPreview && (
                <p className="text-muted-foreground bg-muted rounded-md p-2 text-xs">
                  {agent.outputPreview}
                </p>
              )}
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground text-xs">
                  Est. {formatUsd(agent.estimatedCostUsd)}
                </span>
                <div className="flex gap-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link to={getAiGenerationPath(projectId, agent.id)}>Open</Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={runAgent.isPending || agent.status === 'running'}
                    onClick={() => runAgent.mutate({ agentId: agent.id })}
                  >
                    <Sparkles className="size-3" />
                    Run
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
