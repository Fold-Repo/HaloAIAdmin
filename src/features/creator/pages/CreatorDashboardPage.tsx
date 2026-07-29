import { Link } from 'react-router-dom';
import { Plus, Sparkles, Video, Workflow } from 'lucide-react';

import { LoadingScreen, QueryError } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AiJobStatusPanel } from '@/features/creator/components/AiJobStatusPanel';
import { ProjectCardGrid } from '@/features/creator/components/ProjectCard';
import {
  useAiJobs,
  useDashboardStats,
  useProjects,
} from '@/features/creator/hooks/useCreatorQueries';
import { ROUTES } from '@/constants';
import { combineQueryState } from '@/utils';

export function CreatorDashboardPage() {
  const statsQuery = useDashboardStats();
  const projectsQuery = useProjects();
  const jobsQuery = useAiJobs();
  const queryState = combineQueryState([statsQuery, projectsQuery, jobsQuery]);

  if (queryState.isLoading) {
    return <LoadingScreen message="Loading creator studio..." />;
  }

  if (queryState.isError) {
    return (
      <QueryError
        title="Unable to load dashboard"
        message={queryState.error?.message ?? 'Could not load dashboard data from the API.'}
        onRetry={() => void queryState.refetch()}
      />
    );
  }

  const stats = statsQuery.data;
  const projects = projectsQuery.data ?? [];
  const jobs = jobsQuery.data ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Creator Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            From prompt to publishable vertical episodes with AI automation.
          </p>
        </div>
        <Button asChild>
          <Link to={ROUTES.STUDIO.PROJECT_NEW}>
            <Plus className="size-4" />
            New project
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Projects', value: stats?.totalProjects ?? 0, icon: Workflow },
          { label: 'Active AI jobs', value: stats?.activeJobs ?? 0, icon: Sparkles },
          { label: 'Published episodes', value: stats?.publishedEpisodes ?? 0, icon: Video },
          { label: 'Series', value: stats?.seriesCount ?? 0, icon: Video },
        ].map((item) => (
          <Card key={item.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
              <item.icon className="text-muted-foreground size-4" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent projects</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to={ROUTES.STUDIO.PROJECTS}>View all</Link>
            </Button>
          </div>
          <ProjectCardGrid
            projects={projects.slice(0, 3)}
            emptyAction={
              <Button asChild>
                <Link to={ROUTES.STUDIO.PROJECT_NEW}>Create first project</Link>
              </Button>
            }
          />
        </section>

        <AiJobStatusPanel jobs={jobs} compact />
      </div>
    </div>
  );
}
