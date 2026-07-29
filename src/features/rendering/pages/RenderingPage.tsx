import { Film } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';

import { EmptyState, LoadingScreen, QueryError } from '@/components/common';
import { Button } from '@/components/ui/button';
import { FfmpegJobPanel } from '@/features/rendering/components/FfmpegJobPanel';
import { GpuStatusPanel } from '@/features/rendering/components/GpuStatusPanel';
import { JobHistoryPanel } from '@/features/rendering/components/JobHistoryPanel';
import { ProgressDashboard } from '@/features/rendering/components/ProgressDashboard';
import { EpisodeAssemblyOverview } from '@/features/episode-planner/components/EpisodeAssemblyOverview';
import { QueueMonitoringPanel } from '@/features/rendering/components/QueueMonitoringPanel';
import { RenderQueuePanel } from '@/features/rendering/components/RenderQueuePanel';
import {
  RenderingNav,
  getRenderingSectionMeta,
} from '@/features/rendering/components/RenderingNav';
import { RetryQueuePanel } from '@/features/rendering/components/RetryQueuePanel';
import { WorkerStatusPanel } from '@/features/rendering/components/WorkerStatusPanel';
import {
  useFfmpegJobs,
  useGpuStatus,
  useJobHistory,
  useQueueMonitoring,
  useRenderQueue,
  useRenderWorkers,
  useRenderingOverview,
  useRetryQueue,
} from '@/features/rendering/hooks/useRendering';
import {
  getRenderingPath,
  isRenderingSection,
} from '@/features/rendering/utils/rendering.utils';
import { useProject } from '@/features/creator/hooks/useCreatorQueries';
import { ROUTES } from '@/constants';
import { combineQueryState } from '@/utils';

export function RenderingPage() {
  const { projectId = '', section = 'progress' } = useParams();
  const projectQuery = useProject(projectId);
  const overviewQuery = useRenderingOverview(projectId);
  const queueQuery = useRenderQueue(projectId);
  const retryQuery = useRetryQueue(projectId);
  const workersQuery = useRenderWorkers(projectId);
  const gpuQuery = useGpuStatus(projectId);
  const ffmpegQuery = useFfmpegJobs(projectId);
  const historyQuery = useJobHistory(projectId);
  const monitoringQuery = useQueueMonitoring(projectId);

  if (!isRenderingSection(section)) {
    return <Navigate to={getRenderingPath(projectId, 'progress')} replace />;
  }

  const activeQueries = [
    projectQuery,
    ...(section === 'progress' ? [overviewQuery] : []),
    ...(section === 'queue' ? [queueQuery] : []),
    ...(section === 'retry' ? [retryQuery] : []),
    ...(section === 'workers' ? [workersQuery] : []),
    ...(section === 'gpu' ? [gpuQuery] : []),
    ...(section === 'ffmpeg' ? [ffmpegQuery] : []),
    ...(section === 'history' ? [historyQuery] : []),
    ...(section === 'monitoring' ? [monitoringQuery] : []),
  ];
  const queryState = combineQueryState(activeQueries);

  if (queryState.isLoading) {
    return <LoadingScreen message="Loading rendering pipeline..." />;
  }

  if (queryState.isError) {
    return (
      <QueryError
        title="Unable to load rendering"
        message={queryState.error?.message ?? 'Something went wrong while loading rendering data.'}
        onRetry={() => void queryState.refetch()}
      />
    );
  }

  const project = projectQuery.data;
  const sectionMeta = getRenderingSectionMeta(section);

  if (!project) {
    return (
      <EmptyState
        title="Rendering unavailable"
        description="We couldn't find this project."
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
            <Film className="size-4" />
            Rendering
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

      <RenderingNav />

      {section === 'progress' && overviewQuery.data && (
        <>
          <ProgressDashboard overview={overviewQuery.data} />
          <EpisodeAssemblyOverview projectId={projectId} />
        </>
      )}

      {section === 'queue' && queueQuery.data && (
        <RenderQueuePanel projectId={projectId} jobs={queueQuery.data} />
      )}

      {section === 'workers' && workersQuery.data && (
        <WorkerStatusPanel workers={workersQuery.data} />
      )}

      {section === 'retry' && retryQuery.data && (
        <RetryQueuePanel projectId={projectId} jobs={retryQuery.data} />
      )}

      {section === 'gpu' && gpuQuery.data && <GpuStatusPanel gpus={gpuQuery.data} />}

      {section === 'ffmpeg' && ffmpegQuery.data && (
        <FfmpegJobPanel jobs={ffmpegQuery.data} />
      )}

      {section === 'history' && historyQuery.data && (
        <JobHistoryPanel jobs={historyQuery.data} />
      )}

      {section === 'monitoring' && monitoringQuery.data && (
        <QueueMonitoringPanel metrics={monitoringQuery.data} />
      )}
    </div>
  );
}
