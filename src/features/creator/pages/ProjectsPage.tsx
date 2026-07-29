import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { LoadingScreen, QueryError } from '@/components/common';
import { ProjectCardGrid } from '@/features/creator/components/ProjectCard';
import { useProjects } from '@/features/creator/hooks/useCreatorQueries';
import { ROUTES } from '@/constants';

export function ProjectsPage() {
  const { data: projects = [], isLoading, isError, error, refetch } = useProjects();

  if (isLoading) {
    return <LoadingScreen message="Loading projects..." />;
  }

  if (isError) {
    return (
      <QueryError
        title="Unable to load projects"
        message={error?.message ?? 'Something went wrong while loading projects.'}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage AI-assisted story projects across your studio pipeline.
          </p>
        </div>
        <Button asChild>
          <Link to={ROUTES.STUDIO.PROJECT_NEW}>
            <Plus className="size-4" />
            New project
          </Link>
        </Button>
      </div>

      <ProjectCardGrid
        projects={projects}
        emptyAction={
          <Button asChild>
            <Link to={ROUTES.STUDIO.PROJECT_NEW}>Start new project</Link>
          </Button>
        }
      />
    </div>
  );
}
