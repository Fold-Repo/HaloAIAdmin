import { Rocket } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';

import { EmptyState, LoadingScreen, QueryError } from '@/components/common';
import { Button } from '@/components/ui/button';
import { CategoriesPanel } from '@/features/publishing/components/CategoriesPanel';
import { HlsPackagingPanel } from '@/features/publishing/components/HlsPackagingPanel';
import { MonetizationPanel } from '@/features/publishing/components/MonetizationPanel';
import { PublishWizardPanel } from '@/features/publishing/components/PublishWizardPanel';
import {
  PublishingNav,
  getPublishingSectionMeta,
} from '@/features/publishing/components/PublishingNav';
import { PushNotificationPreviewPanel } from '@/features/publishing/components/PushNotificationPreviewPanel';
import { ReleaseSchedulerPanel } from '@/features/publishing/components/ReleaseSchedulerPanel';
import { TagsPanel } from '@/features/publishing/components/TagsPanel';
import { VisibilityPanel } from '@/features/publishing/components/VisibilityPanel';
import {
  useHlsPackages,
  usePublishCategories,
  usePublishOverview,
  usePublishSettings,
  usePushNotificationPreview,
  useReleaseSchedule,
} from '@/features/publishing/hooks/usePublishing';
import {
  getPublishingPath,
  isPublishingSection,
} from '@/features/publishing/utils/publishing.utils';
import { useProject } from '@/features/creator/hooks/useCreatorQueries';
import { ROUTES } from '@/constants';
import { combineQueryState } from '@/utils';

export function PublishingPage() {
  const { projectId = '', section = 'wizard' } = useParams();
  const projectQuery = useProject(projectId);
  const overviewQuery = usePublishOverview(projectId);
  const settingsQuery = usePublishSettings(projectId);
  const scheduleQuery = useReleaseSchedule(projectId);
  const hlsQuery = useHlsPackages(projectId);
  const categoriesQuery = usePublishCategories();
  const pushPreviewQuery = usePushNotificationPreview(projectId);

  if (!isPublishingSection(section)) {
    return <Navigate to={getPublishingPath(projectId, 'wizard')} replace />;
  }

  const needsSettings = ['categories', 'tags', 'visibility', 'monetization'].includes(section);

  const activeQueries = [
    projectQuery,
    ...(section === 'wizard' ? [overviewQuery] : []),
    ...(needsSettings ? [settingsQuery] : []),
    ...(section === 'scheduler' ? [scheduleQuery] : []),
    ...(section === 'hls' ? [hlsQuery] : []),
    ...(section === 'categories' ? [categoriesQuery] : []),
    ...(section === 'notifications' ? [pushPreviewQuery] : []),
  ];
  const queryState = combineQueryState(activeQueries);

  if (queryState.isLoading) {
    return <LoadingScreen message="Loading publishing..." />;
  }

  if (queryState.isError) {
    return (
      <QueryError
        title="Unable to load publishing"
        message={queryState.error?.message ?? 'Something went wrong while loading publishing data.'}
        onRetry={() => void queryState.refetch()}
      />
    );
  }

  const project = projectQuery.data;
  const settings = settingsQuery.data;
  const sectionMeta = getPublishingSectionMeta(section);

  if (!project || (needsSettings && !settings)) {
    return (
      <EmptyState
        title="Publishing unavailable"
        description="We couldn't load publishing settings for this project."
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
            <Rocket className="size-4" />
            Publishing
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

      <PublishingNav />

      {section === 'wizard' && overviewQuery.data && (
        <PublishWizardPanel projectId={projectId} overview={overviewQuery.data} />
      )}

      {section === 'scheduler' && scheduleQuery.data && (
        <ReleaseSchedulerPanel projectId={projectId} schedule={scheduleQuery.data} />
      )}

      {section === 'hls' && hlsQuery.data && <HlsPackagingPanel packages={hlsQuery.data} />}

      {section === 'categories' && settings && categoriesQuery.data && (
        <CategoriesPanel
          projectId={projectId}
          settings={settings}
          categories={categoriesQuery.data}
        />
      )}

      {section === 'tags' && settings && (
        <TagsPanel projectId={projectId} settings={settings} />
      )}

      {section === 'visibility' && settings && (
        <VisibilityPanel projectId={projectId} settings={settings} />
      )}

      {section === 'monetization' && settings && (
        <MonetizationPanel projectId={projectId} settings={settings} />
      )}

      {section === 'notifications' && pushPreviewQuery.data && (
        <PushNotificationPreviewPanel preview={pushPreviewQuery.data} />
      )}
    </div>
  );
}
