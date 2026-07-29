import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUpdatePublishSettings } from '@/features/publishing/hooks/usePublishing';
import type { CategoryOption, PublishSettings } from '@/types';

type CategoriesPanelProps = {
  projectId: string;
  settings: PublishSettings;
  categories: CategoryOption[];
};

export function CategoriesPanel({ projectId, settings, categories }: CategoriesPanelProps) {
  const updateSettings = useUpdatePublishSettings(projectId);

  const toggleCategory = (categoryId: string) => {
    const next = settings.categories.includes(categoryId)
      ? settings.categories.filter((id) => id !== categoryId)
      : [...settings.categories, categoryId];

    updateSettings.mutate({ categories: next });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {categories.map((category) => {
            const selected = settings.categories.includes(category.id);
            return (
              <button
                key={category.id}
                type="button"
                className={`rounded-lg border p-4 text-left transition-colors ${
                  selected ? 'border-primary bg-primary/5' : 'hover:bg-accent'
                }`}
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{category.label}</p>
                  {selected && <Badge variant="default">Selected</Badge>}
                </div>
                <p className="text-muted-foreground mt-1 text-xs">{category.description}</p>
              </button>
            );
          })}
        </div>
        {updateSettings.isPending && (
          <p className="text-muted-foreground mt-4 text-xs">Saving categories...</p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {settings.categories.map((id) => (
            <Badge key={id} variant="secondary">
              {categories.find((category) => category.id === id)?.label ?? id}
            </Badge>
          ))}
        </div>
        <Button className="mt-4" variant="outline" disabled>
          {settings.categories.length} selected
        </Button>
      </CardContent>
    </Card>
  );
}
