import { Link, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { LoadingScreen } from '@/components/common';
import { ManualUploadWorkspace } from '@/features/creator/components/ManualUploadWorkspace';
import { useProject } from '@/features/creator/hooks/useCreatorQueries';
import { ROUTES } from '@/constants';

export function ManualUploadPage() {
  const { projectId = '' } = useParams();
  const projectQuery = useProject(projectId);

  if (projectQuery.isLoading) {
    return <LoadingScreen message="Loading project..." />;
  }

  const project = projectQuery.data;

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
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button asChild variant="outline" size="sm">
          <Link to={ROUTES.STUDIO.PROJECT_DETAIL.replace(':projectId', projectId)}>
            Back to project
          </Link>
        </Button>
      </div>
      <ManualUploadWorkspace projectId={projectId} projectTitle={project.title} />
    </div>
  );
}
