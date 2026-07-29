import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdatePublishSettings } from '@/features/publishing/hooks/usePublishing';
import {
  tagsFormSchema,
  type TagsFormValues,
} from '@/features/publishing/schemas/publishing.schemas';
import type { PublishSettings } from '@/types';

type TagsPanelProps = {
  projectId: string;
  settings: PublishSettings;
};

export function TagsPanel({ projectId, settings }: TagsPanelProps) {
  const updateSettings = useUpdatePublishSettings(projectId);

  const form = useForm<TagsFormValues>({
    resolver: zodResolver(tagsFormSchema),
    defaultValues: { tags: settings.tags.join(', ') },
  });

  const removeTag = (tag: string) => {
    updateSettings.mutate({ tags: settings.tags.filter((item) => item !== tag) });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Tags</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={form.handleSubmit((values) => {
            const newTags = values.tags
              .split(',')
              .map((tag) => tag.trim().toLowerCase())
              .filter(Boolean);
            const merged = Array.from(new Set([...settings.tags, ...newTags]));
            updateSettings.mutate({ tags: merged });
            form.reset({ tags: '' });
          })}
        >
          <div className="flex-1 space-y-2">
            <Label htmlFor="tags">Add tags (comma-separated)</Label>
            <Input id="tags" placeholder="noir, lagos, vertical-drama" {...form.register('tags')} />
          </div>
          <Button type="submit" className="sm:self-end" disabled={updateSettings.isPending}>
            Add tags
          </Button>
        </form>

        <div className="flex flex-wrap gap-2">
          {settings.tags.map((tag) => (
            <button key={tag} type="button" onClick={() => removeTag(tag)}>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                {tag} ×
              </Badge>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
