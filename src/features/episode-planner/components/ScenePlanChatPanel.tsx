import { useState } from 'react';
import { Loader2, MessageSquare, Send } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useScenePlanChat } from '@/features/story-bible/hooks/useStoryBible';

type ChatTurn = { role: 'user' | 'assistant'; content: string };

type ScenePlanChatPanelProps = {
  projectId: string;
  episodeId: string;
};

export function ScenePlanChatPanel({ projectId, episodeId }: ScenePlanChatPanelProps) {
  const chatMutation = useScenePlanChat(projectId, episodeId);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<ChatTurn[]>([]);

  const sendChat = async () => {
    const text = message.trim();
    if (!text || chatMutation.isPending) return;
    setMessage('');
    setHistory((prev) => [...prev, { role: 'user', content: text }]);
    try {
      const result = await chatMutation.mutateAsync({
        message: text,
        history,
        apply: true,
      });
      const suffix =
        result.scenesApplied > 0
          ? `\n\n_Applied ${result.scenesApplied} scenes from the master story bible._`
          : '';
      setHistory((prev) => [...prev, { role: 'assistant', content: `${result.reply}${suffix}` }]);
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : 'Chat failed';
      setHistory((prev) => [...prev, { role: 'assistant', content: `Error: ${errMessage}` }]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="size-4" />
          Scene plan chat
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-muted-foreground text-sm">
          Rearrange this episode from the master story bible — increase or reduce scenes, rewrite
          beats, and keep lore/characters consistent.
        </p>
        <div className="bg-muted/40 max-h-56 space-y-2 overflow-y-auto rounded-md border p-3 text-sm">
          {history.length === 0 ? (
            <p className="text-muted-foreground">
              Try: “Tighten to 8 scenes” or “Move the confrontation earlier and add a location beat
              at the office.”
            </p>
          ) : (
            history.map((turn, index) => (
              <div key={`${turn.role}-${index}`}>
                <span className="font-medium">{turn.role === 'user' ? 'You' : 'Planner'}: </span>
                <span className="whitespace-pre-wrap">{turn.content}</span>
              </div>
            ))
          )}
        </div>
        <Textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={chatMutation.isPending}
          placeholder="Describe how this episode’s scenes should change…"
        />
        <Button
          className="w-full"
          disabled={chatMutation.isPending || !message.trim()}
          onClick={() => void sendChat()}
        >
          {chatMutation.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Planning…
            </>
          ) : (
            <>
              <Send className="size-4" />
              Apply with AI
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
