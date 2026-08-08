import Editor from '@monaco-editor/react';
import { RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ExtractEpisodesPanel } from '@/features/story-bible/components/ExtractEpisodesPanel';
import { SectionShell } from '@/features/story-bible/components/SectionShell';
import {
  useResyncStoryDocument,
  useUpdateStoryDocument,
} from '@/features/story-bible/hooks/useStoryBible';
import type { EpisodePlanEntry, StoryDocument } from '@/types';

type StoryEditorSectionProps = {
  projectId: string;
  document: StoryDocument;
  episodePlan?: EpisodePlanEntry[];
};

export function StoryEditorSection({
  projectId,
  document,
  episodePlan = [],
}: StoryEditorSectionProps) {
  const mutation = useUpdateStoryDocument(projectId);
  const resync = useResyncStoryDocument(projectId);
  const [content, setContent] = useState(document.content);
  const [format, setFormat] = useState(document.format);
  const [extractOnSave, setExtractOnSave] = useState(false);
  const [extractMode, setExtractMode] = useState<'merge' | 'replace'>('merge');

  useEffect(() => {
    setContent(document.content);
    setFormat(document.format);
  }, [document.content, document.format, document.updatedAt]);

  const docEpisodeCount = (content.match(/^###\s+Episode\s+\d+/gim) ?? []).length;
  const planCount = episodePlan.length;
  const looksStale = planCount > 0 && docEpisodeCount < planCount;

  const handleSave = () => {
    mutation.mutate({
      content,
      format,
      extractEpisodes: extractOnSave,
      extractMode,
    });
  };

  const handleResync = () => {
    resync.mutate(undefined, {
      onSuccess: (result) => {
        setContent(result.document.content);
        setFormat(result.document.format);
      },
    });
  };

  return (
    <SectionShell
      title="Story editor"
      description="Draft and revise the master story document used by AI script agents. Resync pulls every planned/generated episode into this markdown."
      action={
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={resync.isPending || mutation.isPending}
            onClick={handleResync}
          >
            <RefreshCw className={`size-4 ${resync.isPending ? 'animate-spin' : ''}`} />
            {resync.isPending ? 'Resyncing…' : 'Resync episodes'}
          </Button>
          <Button type="button" size="sm" disabled={mutation.isPending} onClick={handleSave}>
            {mutation.isPending ? 'Saving...' : 'Save draft'}
          </Button>
        </div>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Label htmlFor="format">Format</Label>
        <select
          id="format"
          className="border-input bg-background h-9 rounded-md border px-3 text-sm"
          value={format}
          onChange={(event) => setFormat(event.target.value as StoryDocument['format'])}
        >
          <option value="markdown">Markdown</option>
          <option value="screenplay">Screenplay</option>
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={extractOnSave}
            onChange={(event) => setExtractOnSave(event.target.checked)}
          />
          Extract episodes on save
        </label>
        {extractOnSave && (
          <select
            className="border-input bg-background h-9 rounded-md border px-3 text-sm"
            value={extractMode}
            onChange={(event) => setExtractMode(event.target.value as 'merge' | 'replace')}
          >
            <option value="merge">Merge</option>
            <option value="replace">Replace</option>
          </select>
        )}
        <span className="text-muted-foreground text-xs">
          Editor: {docEpisodeCount} ep · Plan: {planCount} ep
          {document.updatedAt ? ` · Updated ${new Date(document.updatedAt).toLocaleString()}` : ''}
        </span>
      </div>

      {looksStale ? (
        <p className="mb-4 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm">
          Story editor is behind the episode plan ({docEpisodeCount}/{planCount}). Opening Story
          Bible auto-syncs when stale — or click <strong>Resync episodes</strong> now.
        </p>
      ) : null}

      {resync.isError ? (
        <p className="text-destructive mb-4 text-sm" role="alert">
          {(resync.error as Error)?.message ?? 'Resync failed.'}
        </p>
      ) : null}

      {resync.isSuccess && resync.data?.message ? (
        <p className="text-muted-foreground mb-4 text-sm">{resync.data.message}</p>
      ) : null}

      <div className="overflow-hidden rounded-lg border">
        <Editor
          height="420px"
          language={format === 'screenplay' ? 'plaintext' : 'markdown'}
          value={content}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            wordWrap: 'on',
            fontSize: 14,
            scrollBeyondLastLine: false,
          }}
          onChange={(value) => setContent(value ?? '')}
        />
      </div>

      <div className="mt-6">
        <ExtractEpisodesPanel projectId={projectId} content={content} />
      </div>
    </SectionShell>
  );
}
