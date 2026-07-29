import { Link, Navigate, useParams } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { EmptyState, LoadingScreen, QueryError } from '@/components/common';
import { CharactersSection } from '@/features/story-bible/components/sections/CharactersSection';
import { EpisodePlanSection } from '@/features/story-bible/components/sections/EpisodePlanSection';
import { EndingSection } from '@/features/story-bible/components/sections/EndingSection';
import { LocationsSection } from '@/features/story-bible/components/sections/LocationsSection';
import { LoreSection } from '@/features/story-bible/components/sections/LoreSection';
import { OverviewSection } from '@/features/story-bible/components/sections/OverviewSection';
import { PropsSection } from '@/features/story-bible/components/sections/PropsSection';
import { RelationshipsSection } from '@/features/story-bible/components/sections/RelationshipsSection';
import { SeasonArcSection } from '@/features/story-bible/components/sections/SeasonArcSection';
import { StoryEditorSection } from '@/features/story-bible/components/sections/StoryEditorSection';
import { TimelineSection } from '@/features/story-bible/components/sections/TimelineSection';
import { VersionHistorySection } from '@/features/story-bible/components/sections/VersionHistorySection';
import { WardrobeSection } from '@/features/story-bible/components/sections/WardrobeSection';
import {
  StoryBibleNav,
  getSectionMeta,
  isStoryBibleSection,
} from '@/features/story-bible/components/StoryBibleNav';
import { useStoryBible } from '@/features/story-bible/hooks/useStoryBible';
import { useProject } from '@/features/creator/hooks/useCreatorQueries';
import { ROUTES } from '@/constants';
import { combineQueryState } from '@/utils';
import { getStoryBiblePath } from '@/features/story-bible/utils/story-bible.utils';

export function StoryBiblePage() {
  const { projectId = '', section = 'overview' } = useParams();
  const projectQuery = useProject(projectId);
  const bibleQuery = useStoryBible(projectId);

  if (!isStoryBibleSection(section)) {
    return <Navigate to={getStoryBiblePath(projectId, 'overview')} replace />;
  }

  const queryState = combineQueryState([projectQuery, bibleQuery]);

  if (queryState.isLoading) {
    return <LoadingScreen message="Loading story bible..." />;
  }

  if (queryState.isError) {
    return (
      <QueryError
        title="Unable to load story bible"
        message={queryState.error?.message ?? 'Something went wrong while loading the story bible.'}
        onRetry={() => void queryState.refetch()}
      />
    );
  }

  const project = projectQuery.data;
  const bible = bibleQuery.data;
  const sectionMeta = getSectionMeta(section);

  if (!project || !bible) {
    return (
      <EmptyState
        title="Story bible unavailable"
        description="We couldn't load the story bible for this project."
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
            <BookOpen className="size-4" />
            Story Bible
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

      <StoryBibleNav />

      {section === 'overview' && (
        <OverviewSection projectId={projectId} overview={bible.overview} />
      )}
      {section === 'episode-plan' && (
        <EpisodePlanSection
          projectId={projectId}
          episodePlan={bible.episodePlan ?? []}
          composerMeta={bible.composerMeta ?? null}
        />
      )}
      {section === 'characters' && (
        <CharactersSection projectId={projectId} characters={bible.characters} />
      )}
      {section === 'relationships' && (
        <RelationshipsSection relationships={bible.relationships} />
      )}
      {section === 'timeline' && <TimelineSection timeline={bible.timeline} />}
      {section === 'lore' && <LoreSection lore={bible.lore} />}
      {section === 'locations' && <LocationsSection locations={bible.locations} />}
      {section === 'props' && <PropsSection props={bible.props} />}
      {section === 'wardrobe' && (
        <WardrobeSection projectId={projectId} wardrobe={bible.wardrobe} />
      )}
      {section === 'season-arc' && <SeasonArcSection seasonArc={bible.seasonArc} />}
      {section === 'ending' && <EndingSection projectId={projectId} ending={bible.ending} />}
      {section === 'editor' && (
        <StoryEditorSection projectId={projectId} document={bible.document} />
      )}
      {section === 'versions' && (
        <VersionHistorySection projectId={projectId} versions={bible.versions} />
      )}
    </div>
  );
}
