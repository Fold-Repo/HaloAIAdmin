import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  EmptySectionState,
  EntityCard,
  SectionShell,
} from '@/features/story-bible/components/SectionShell';
import { useRestoreStoryVersion } from '@/features/story-bible/hooks/useStoryBible';
import { formatRelativeDate } from '@/features/creator/utils/creator.utils';
import type { StoryVersion } from '@/types';

type VersionHistorySectionProps = {
  projectId: string;
  versions: StoryVersion[];
};

export function VersionHistorySection({ projectId, versions }: VersionHistorySectionProps) {
  const [selectedId, setSelectedId] = useState(versions[0]?.id ?? '');
  const restoreVersion = useRestoreStoryVersion(projectId);
  const selected = versions.find((version) => version.id === selectedId) ?? versions[0];

  return (
    <SectionShell
      title="Version history"
      description="Track revisions to the story document and restore prior versions."
      action={
        selected && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={restoreVersion.isPending}
            onClick={() => restoreVersion.mutate(selected.id)}
          >
            {restoreVersion.isPending ? 'Restoring...' : 'Restore selected'}
          </Button>
        )
      }
    >
      {versions.length === 0 ? (
        <EmptySectionState message="No versions saved yet. Save from the story editor to create one." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-2">
            {versions.map((version) => (
              <button
                key={version.id}
                type="button"
                className={`w-full rounded-lg border p-3 text-left transition-colors ${
                  selected?.id === version.id ? 'border-primary bg-primary/5' : 'hover:bg-accent'
                }`}
                onClick={() => setSelectedId(version.id)}
              >
                <p className="text-sm font-medium">{version.label}</p>
                <p className="text-muted-foreground text-xs">
                  {version.author} · {formatRelativeDate(version.createdAt)}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">{version.changeSummary}</p>
              </button>
            ))}
          </div>
          {selected && (
            <EntityCard title={selected.label} subtitle={`By ${selected.author}`}>
              <pre className="max-h-96 overflow-auto whitespace-pre-wrap text-xs">
                {selected.content}
              </pre>
            </EntityCard>
          )}
        </div>
      )}
    </SectionShell>
  );
}
