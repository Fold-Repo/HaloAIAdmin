import { Layers, ListTree } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  useExtractEpisodes,
  usePreviewExtractEpisodes,
} from '@/features/story-bible/hooks/useStoryBible';
import type { ExtractEpisodesPreview } from '@/types';

type ExtractEpisodesPanelProps = {
  projectId: string;
  content: string;
};

export function ExtractEpisodesPanel({ projectId, content }: ExtractEpisodesPanelProps) {
  const previewMutation = usePreviewExtractEpisodes(projectId);
  const extractMutation = useExtractEpisodes(projectId);
  const [mode, setMode] = useState<'merge' | 'replace'>('merge');
  const [preview, setPreview] = useState<ExtractEpisodesPreview | null>(null);

  const handlePreview = () => {
    previewMutation.mutate(
      { content },
      {
        onSuccess: (data) => setPreview(data),
      },
    );
  };

  const handleExtract = () => {
    extractMutation.mutate({ content, mode });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <ListTree className="size-4" />
              Extract episodes & scenes
            </CardTitle>
            <p className="text-muted-foreground mt-1 text-sm">
              Detect headings like <code>Episode 1: Title</code> and <code>Scene 1: Title</code>,
              then create editable episode and scene records.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label htmlFor="extract-mode">Import mode</Label>
            <select
              id="extract-mode"
              className="border-input bg-background h-9 rounded-md border px-3 text-sm"
              value={mode}
              onChange={(event) => setMode(event.target.value as 'merge' | 'replace')}
            >
              <option value="merge">Merge with existing episodes</option>
              <option value="replace">Replace all episodes</option>
            </select>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={previewMutation.isPending || !content.trim()}
            onClick={handlePreview}
          >
            {previewMutation.isPending ? 'Scanning...' : 'Preview structure'}
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={extractMutation.isPending || !content.trim()}
            onClick={handleExtract}
          >
            {extractMutation.isPending ? 'Extracting...' : 'Extract to episodes'}
          </Button>
        </div>

        {preview && (
          <div className="space-y-3 rounded-lg border p-4">
            {!preview.detected ? (
              <p className="text-muted-foreground text-sm">
                No episode headings detected. Add lines like <strong>Episode 1: Pilot</strong> and{' '}
                <strong>Scene 1: Opening</strong>.
              </p>
            ) : (
              <>
                <div className="flex flex-wrap gap-2 text-sm">
                  <Badge variant="secondary">{preview.episodeCount} episodes found</Badge>
                  <Badge variant="secondary">{preview.sceneCount} scenes found</Badge>
                  <Badge variant="outline">{preview.existingEpisodeCount} already in planner</Badge>
                </div>
                <div className="max-h-64 space-y-3 overflow-y-auto">
                  {preview.episodes.map((episode) => (
                    <div key={episode.number} className="rounded-md border p-3 text-sm">
                      <div className="flex items-center gap-2 font-medium">
                        <Layers className="size-4" />
                        Ep {episode.number}: {episode.title}
                        <Badge variant={episode.action === 'create' ? 'default' : 'secondary'}>
                          {episode.action}
                        </Badge>
                      </div>
                      {episode.synopsis && (
                        <p className="text-muted-foreground mt-1 line-clamp-2">{episode.synopsis}</p>
                      )}
                      {episode.scenes.length > 0 && (
                        <ul className="text-muted-foreground mt-2 space-y-1 pl-5 text-xs">
                          {episode.scenes.map((scene) => (
                            <li key={scene.order}>
                              Scene {scene.order}: {scene.title} ({scene.action})
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {extractMutation.data && (
          <p className="text-muted-foreground text-sm">
            Created {extractMutation.data.episodesCreated} episodes, updated{' '}
            {extractMutation.data.episodesUpdated}, added {extractMutation.data.scenesCreated} scenes.
            Open Episode Planner to edit and reorder scenes.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
