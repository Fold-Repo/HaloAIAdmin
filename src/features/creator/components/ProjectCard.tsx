import { Link } from 'react-router-dom';
import { FolderOpen } from 'lucide-react';

import { EmptyState } from '@/components/common';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ROUTES } from '@/constants';
import { ProjectCoverArt } from '@/features/creator/components/CoverArt';
import {
  formatRelativeDate,
  getProjectStatusLabel,
  getProjectStatusVariant,
} from '@/features/creator/utils/creator.utils';
import type { CreatorProject } from '@/types';

type ProjectCardProps = {
  project: CreatorProject;
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <ProjectCoverArt
        projectId={project.id}
        title={project.title}
        landscapeUrl={project.thumbnailUrl}
        portraitUrl={project.thumbnailPortraitUrl}
        variant="card"
      />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-1 text-base">{project.title}</CardTitle>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <Badge variant={getProjectStatusVariant(project.status)}>
              {getProjectStatusLabel(project.status)}
            </Badge>
            <Badge variant="outline">
              {project.creationMode === 'manual_upload' ? 'Manual' : 'AI'}
            </Badge>
          </div>
        </div>
        <CardDescription className="line-clamp-2">{project.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {project.seriesTitle && (
          <p className="text-muted-foreground text-xs">
            {project.seriesTitle}
            {project.seasonTitle ? ` · ${project.seasonTitle}` : ''}
          </p>
        )}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Pipeline progress</span>
            <span>{project.progress}%</span>
          </div>
          <Progress value={project.progress} />
        </div>
        <p className="text-muted-foreground text-xs">
          {project.episodeCount} episodes · Updated {formatRelativeDate(project.updatedAt)}
        </p>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link to={ROUTES.STUDIO.PROJECT_DETAIL.replace(':projectId', project.id)}>
            Open project
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

type ProjectCardGridProps = {
  projects: CreatorProject[];
  emptyAction?: React.ReactNode;
};

export function ProjectCardGrid({ projects, emptyAction }: ProjectCardGridProps) {
  if (projects.length === 0) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="No projects yet"
        description="Start from a story prompt and let AI generate scripts, scenes, and episodes."
        action={emptyAction}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
