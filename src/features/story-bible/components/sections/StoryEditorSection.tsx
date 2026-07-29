import Editor from '@monaco-editor/react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ExtractEpisodesPanel } from '@/features/story-bible/components/ExtractEpisodesPanel';
import { SectionShell } from '@/features/story-bible/components/SectionShell';
import { useUpdateStoryDocument } from '@/features/story-bible/hooks/useStoryBible';
import type { StoryDocument } from '@/types';

type StoryEditorSectionProps = {
  projectId: string;
  document: StoryDocument;
};

export function StoryEditorSection({ projectId, document }: StoryEditorSectionProps) {
  const mutation = useUpdateStoryDocument(projectId);
  const [content, setContent] = useState(document.content);
  const [format, setFormat] = useState(document.format);
  const [extractOnSave, setExtractOnSave] = useState(false);
  const [extractMode, setExtractMode] = useState<'merge' | 'replace'>('merge');

  useEffect(() => {
    setContent(document.content);
    setFormat(document.format);
  }, [document]);

  const handleSave = () => {
    mutation.mutate({
      content,
      format,
      extractEpisodes: extractOnSave,
      extractMode,
    });
  };

  return (
    <SectionShell
      title="Story editor"
      description="Draft and revise the master story document used by AI script agents."
      action={
        <Button type="button" size="sm" disabled={mutation.isPending} onClick={handleSave}>
          {mutation.isPending ? 'Saving...' : 'Save draft'}
        </Button>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Label htmlFor="format">Format</Label>
        <select
          id="format"
          className="border-input bg-background h-9 rounded-md border px-3 text-sm"
          value={format}
          onChange={(event) =>
            setFormat(event.target.value as StoryDocument['format'])
          }
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
      </div>
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
