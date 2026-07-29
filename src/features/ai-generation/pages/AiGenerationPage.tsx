import { Link, Navigate, useParams } from 'react-router-dom';
import { Bot } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { EmptyState, LoadingScreen, QueryError } from '@/components/common';
import { AgentPanel } from '@/features/ai-generation/components/AgentPanel';
import { AiDirectorDashboard } from '@/features/ai-generation/components/AiDirectorDashboard';
import {
  AiDirectorNav,
  getAiSectionMeta,
} from '@/features/ai-generation/components/AiDirectorNav';
import { AiLogsPanel } from '@/features/ai-generation/components/AiLogsPanel';
import { CostEstimatorPanel } from '@/features/ai-generation/components/CostEstimatorPanel';
import { PromptBuilderPanel } from '@/features/ai-generation/components/PromptBuilderPanel';
import {
  useAiAgent,
  useAiDirectorOverview,
  useAiLogs,
  useCostEstimate,
} from '@/features/ai-generation/hooks/useAiGeneration';
import {
  getAiGenerationPath,
  isAgentSection,
  isAiGenerationSection,
} from '@/features/ai-generation/utils/ai-generation.utils';
import { useProject } from '@/features/creator/hooks/useCreatorQueries';
import { ROUTES } from '@/constants';
import { combineQueryState } from '@/utils';

function AgentSection({ projectId, agentId }: { projectId: string; agentId: string }) {
  const agentQuery = useAiAgent(projectId, agentId);
  const queryState = combineQueryState([agentQuery]);

  if (queryState.isLoading) {
    return <LoadingScreen message="Loading agent..." />;
  }

  if (queryState.isError) {
    return (
      <QueryError
        title="Unable to load agent"
        message={queryState.error?.message ?? 'Something went wrong while loading this agent.'}
        onRetry={() => void queryState.refetch()}
      />
    );
  }

  const agent = agentQuery.data;
  if (!agent) return null;

  return <AgentPanel projectId={projectId} agent={agent} />;
}

export function AiGenerationPage() {
  const { projectId = '', section = 'dashboard' } = useParams();
  const projectQuery = useProject(projectId);
  const overviewQuery = useAiDirectorOverview(projectId);
  const costQuery = useCostEstimate(projectId);
  const logsQuery = useAiLogs(projectId);

  if (!isAiGenerationSection(section)) {
    return <Navigate to={getAiGenerationPath(projectId, 'dashboard')} replace />;
  }

  const needsOverview = section === 'dashboard' || isAgentSection(section);

  const activeQueries = [
    projectQuery,
    ...(needsOverview ? [overviewQuery] : []),
    ...(section === 'cost' ? [costQuery] : []),
    ...(section === 'logs' ? [logsQuery] : []),
  ];
  const queryState = combineQueryState(activeQueries);

  if (queryState.isLoading) {
    return <LoadingScreen message="Loading AI generation..." />;
  }

  if (queryState.isError) {
    return (
      <QueryError
        title="Unable to load AI generation"
        message={queryState.error?.message ?? 'Something went wrong while loading AI data.'}
        onRetry={() => void queryState.refetch()}
      />
    );
  }

  const project = projectQuery.data;
  const overview = overviewQuery.data;
  const sectionMeta = getAiSectionMeta(section);

  if (!project || (needsOverview && !overview)) {
    return (
      <EmptyState
        title="AI generation unavailable"
        description="We couldn't load AI generation data for this project."
        action={
          <Button asChild>
            <Link to={ROUTES.STUDIO.PROJECTS}>Back to projects</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-muted-foreground mb-1 flex items-center gap-2 text-sm">
            <Bot className="size-4" />
            AI Generation
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
          <p className="text-muted-foreground mt-1">{sectionMeta.description}</p>
        </div>
        <Button asChild variant="outline">
          <Link to={ROUTES.STUDIO.PROJECT_DETAIL.replace(':projectId', projectId)}>
            Back to project
          </Link>
        </Button>
      </div>

      <AiDirectorNav />

      {section === 'dashboard' && overview && (
        <AiDirectorDashboard projectId={projectId} overview={overview} />
      )}

      {isAgentSection(section) && (
        <AgentSection projectId={projectId} agentId={section} />
      )}

      {section === 'prompt-builder' && <PromptBuilderPanel projectId={projectId} />}

      {section === 'cost' && costQuery.data && (
        <CostEstimatorPanel estimate={costQuery.data} />
      )}

      {section === 'logs' && logsQuery.data && <AiLogsPanel logs={logsQuery.data} />}
    </div>
  );
}
