import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useBuildPrompt, usePromptTemplates } from '@/features/ai-generation/hooks/useAiGeneration';
import {
  promptBuilderSchema,
  type PromptBuilderFormValues,
} from '@/features/ai-generation/schemas/ai-generation.schemas';

type PromptBuilderPanelProps = {
  projectId: string;
};

export function PromptBuilderPanel({ projectId }: PromptBuilderPanelProps) {
  const templatesQuery = usePromptTemplates(projectId);
  const buildPrompt = useBuildPrompt(projectId);

  const form = useForm<PromptBuilderFormValues>({
    resolver: zodResolver(promptBuilderSchema),
    defaultValues: {
      agentId: 'script',
      basePrompt: '',
      style: 'cinematic vertical drama',
      constraints: '60 second episode, strong cliffhanger, Lagos setting',
    },
  });

  const templates = templatesQuery.data ?? [];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Prompt builder</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((values) => buildPrompt.mutate(values))}
          >
            <div className="space-y-2">
              <Label htmlFor="agentId">Target agent</Label>
              <select
                id="agentId"
                className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm"
                {...form.register('agentId')}
              >
                <option value="story-planner">Story Planner</option>
                <option value="script">Script</option>
                <option value="character">Character</option>
                <option value="video">Video</option>
                <option value="voice">Voice</option>
                <option value="subtitle">Subtitle</option>
                <option value="music">Music</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="basePrompt">Base prompt</Label>
              <Textarea id="basePrompt" rows={4} {...form.register('basePrompt')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="style">Style</Label>
              <Input id="style" {...form.register('style')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="constraints">Constraints</Label>
              <Textarea id="constraints" rows={3} {...form.register('constraints')} />
            </div>
            <Button type="submit" disabled={buildPrompt.isPending}>
              {buildPrompt.isPending ? 'Building...' : 'Build prompt'}
            </Button>
          </form>
          {buildPrompt.data && (
            <pre className="bg-muted mt-4 rounded-md p-3 text-sm whitespace-pre-wrap">
              {buildPrompt.data.data.prompt}
            </pre>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Templates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {templates.map((template) => (
            <div key={template.id} className="rounded-lg border p-3">
              <p className="font-medium">{template.name}</p>
              <p className="text-muted-foreground mt-1 text-xs">{template.template}</p>
              <p className="text-muted-foreground mt-2 text-xs">
                Variables: {template.variables.join(', ')}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
