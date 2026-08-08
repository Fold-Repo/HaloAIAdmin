import { Link, useParams } from 'react-router-dom';
import {
  BookOpen,
  Bot,
  BarChart3,
  Clapperboard,
  Film,
  Rocket,
  Sparkles,
  Upload,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { LoadingScreen } from '@/components/common';
import { AiJobStatusPanel } from '@/features/creator/components/AiJobStatusPanel';
import { CoverImageBanner } from '@/features/creator/components/CoverImageBanner';
import { DeleteProjectDialog } from '@/features/creator/components/DeleteProjectDialog';
import {
  getProjectStatusLabel,
  getProjectStatusVariant,
} from '@/features/creator/utils/creator.utils';
import { useAiJobs, useProject } from '@/features/creator/hooks/useCreatorQueries';
import { useGenerateProjectCover } from '@/features/creator/hooks/useCreatorMutations';
import { getStoryBiblePath } from '@/features/story-bible/utils/story-bible.utils';
import { getStoryComposerPath } from '@/features/story-bible/utils/story-composer.utils';
import { getEpisodePlannerPath } from '@/features/episode-planner/utils/episode-planner.utils';
import { getAiGenerationPath } from '@/features/ai-generation/utils/ai-generation.utils';
import { getRenderingPath } from '@/features/rendering/utils/rendering.utils';
import { getPublishingPath } from '@/features/publishing/utils/publishing.utils';
import { getAnalyticsPath } from '@/features/analytics/utils/analytics.utils';
import { ROUTES } from '@/constants';

export function ProjectDetailPage() {
  const { projectId = '' } = useParams();
  const projectQuery = useProject(projectId);
  const jobsQuery = useAiJobs();
  const generateCover = useGenerateProjectCover(projectId);

  if (projectQuery.isLoading) {
    return <LoadingScreen message="Loading project..." />;
  }

  const project = projectQuery.data;
  const projectJobs = (jobsQuery.data ?? []).filter((job) => job.projectId === projectId);
  const isManual = project?.creationMode === 'manual_upload';

  if (!project) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold">Project not found</h1>
        <Button asChild>
          <Link to={ROUTES.STUDIO.PROJECTS}>Back to projects</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CoverImageBanner
        kind="project"
        entityId={projectId}
        title={project.title}
        landscapeUrl={project.thumbnailUrl}
        portraitUrl={project.thumbnailPortraitUrl}
        isGenerating={generateCover.isPending}
        errorMessage={generateCover.error?.message}
        onGenerate={(regenerate) => void generateCover.mutateAsync(regenerate)}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
            <Badge variant={getProjectStatusVariant(project.status)}>
              {getProjectStatusLabel(project.status)}
            </Badge>
            <Badge variant="outline">{isManual ? 'Manual upload' : 'AI generated'}</Badge>
          </div>
          <p className="text-muted-foreground mt-2 max-w-2xl">{project.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isManual ? (
            <Button asChild>
              <Link to={ROUTES.STUDIO.PROJECT_MANUAL_UPLOAD.replace(':projectId', projectId)}>
                <Upload className="size-4" />
                Upload videos
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link to={getStoryComposerPath(projectId)}>
                <Sparkles className="size-4" />
                Story Composer
              </Link>
            </Button>
          )}
          {!isManual && (
            <Button asChild variant="secondary">
              <Link to={getStoryBiblePath(projectId, 'overview')}>
                <BookOpen className="size-4" />
                Story Bible
              </Link>
            </Button>
          )}
          <Button asChild variant="secondary">
            <Link to={getEpisodePlannerPath(projectId)}>
              <Clapperboard className="size-4" />
              Episodes
            </Link>
          </Button>
          {!isManual && (
            <>
              <Button asChild variant="secondary">
                <Link to={getAiGenerationPath(projectId, 'dashboard')}>
                  <Bot className="size-4" />
                  AI Generation
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to={getRenderingPath(projectId, 'progress')}>
                  <Film className="size-4" />
                  Rendering
                </Link>
              </Button>
            </>
          )}
          <Button asChild variant="secondary">
            <Link to={getPublishingPath(projectId, 'wizard')}>
              <Rocket className="size-4" />
              Publishing
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to={getAnalyticsPath(projectId, 'dashboard')}>
              <BarChart3 className="size-4" />
              Analytics
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to={ROUTES.STUDIO.PROJECTS}>All projects</Link>
          </Button>
        </div>
      </div>

      <Card className="border-destructive/40 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-sm">
            Permanently delete this project and all episodes, videos, story data, and related
            records. This cannot be recovered.
          </p>
          <DeleteProjectDialog projectId={projectId} projectTitle={project.title} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isManual ? 'Description' : 'Story prompt'}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{project.prompt}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{isManual ? 'Upload progress' : 'Pipeline progress'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress value={project.progress} />
              <p className="text-muted-foreground text-sm">
                {isManual
                  ? 'Progress reflects episodes with uploaded videos ready for playback and publishing.'
                  : 'Follows the automation flow: script → characters → storyboard → scenes → voice → subtitles → render → publish.'}
              </p>
            </CardContent>
          </Card>
        </div>

        {!isManual && <AiJobStatusPanel jobs={projectJobs} />}
      </div>
    </div>
  );
}
