import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { StoryBoard } from '@/types';

type FullStoryBoardProps = {
  stories: StoryBoard;
  generating: boolean;
};

export function FullStoryBoard({ stories, generating }: FullStoryBoardProps) {
  if (stories.episodes.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Full story</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-muted-foreground text-sm">
          {stories.episodes.length} episode{stories.episodes.length === 1 ? '' : 's'} with their
          scenes
          {generating
            ? '. More episodes appear here as the background job finishes each batch.'
            : '.'}
        </p>
        {stories.episodes.map((episode) => (
          <section key={episode.id} className="space-y-3 rounded-lg border p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>Episode {episode.number}</Badge>
              <h2 className="text-base font-semibold">{episode.title}</h2>
              <span className="text-muted-foreground text-xs">
                {episode.scenes.length} scene{episode.scenes.length === 1 ? '' : 's'}
              </span>
            </div>
            <p className="text-sm leading-relaxed">{episode.synopsis}</p>
            {episode.cliffhanger ? (
              <p className="text-muted-foreground text-sm">
                <span className="text-foreground font-medium">Cliffhanger: </span>
                {episode.cliffhanger}
              </p>
            ) : null}
            <ol className="space-y-3">
              {episode.scenes.map((scene) => (
                <li key={scene.id} className="bg-muted/40 space-y-1 rounded-md p-3">
                  <p className="text-sm font-medium">
                    Scene {scene.order}. {scene.title}
                    <span className="text-muted-foreground ml-2 text-xs font-normal">
                      {scene.durationSec}s{scene.location ? ` · ${scene.location}` : ''}
                    </span>
                  </p>
                  <p className="text-sm leading-relaxed">{scene.description}</p>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </CardContent>
    </Card>
  );
}
