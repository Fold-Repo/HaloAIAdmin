import { useMemo, useState } from 'react';
import { ListPlus, Loader2, MessageSquare, Send } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  useComposerStatus,
  useDirectorChat,
  useSyncEpisodeCount,
  useWatchEpisodeGenerateJob,
} from '@/features/story-bible/hooks/useStoryBible';

type ChatTurn = { role: 'user' | 'assistant'; content: string };

type EpisodePlanToolsProps = {
  projectId: string;
};

export function EpisodePlanTools({ projectId }: EpisodePlanToolsProps) {
  const statusQuery = useComposerStatus(projectId);
  const syncMutation = useSyncEpisodeCount(projectId);
  const chatMutation = useDirectorChat(projectId);
  const jobWatch = useWatchEpisodeGenerateJob(projectId, null);
  const jobBlocked = jobWatch.isWatching;

  const planned = statusQuery.data?.plannedEpisodeCount ?? 0;
  const available = statusQuery.data?.episodeCount ?? 0;
  const pending = statusQuery.data?.pendingEpisodeCount ?? 0;
  const generatedFromPlan = statusQuery.data?.generatedFromPlan ?? 0;

  const [targetCount, setTargetCount] = useState<number | ''>('');
  const [batchSize, setBatchSize] = useState(1);
  const [expandDirection, setExpandDirection] = useState('');
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<ChatTurn[]>([]);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showExpandForm, setShowExpandForm] = useState(false);

  const fillTarget = Math.max(planned, available, 1);
  const resolvedTarget = useMemo(() => {
    if (typeof targetCount === 'number' && targetCount > 0) return targetCount;
    return fillTarget;
  }, [targetCount, fillTarget]);

  const alreadySynced = available >= planned && pending === 0 && planned > 0;
  const isExpanding = resolvedTarget > Math.max(planned, available);

  const runFillMissing = async () => {
    if (isSyncing || jobBlocked) return;
    const target = Math.max(planned, available);
    if (available >= target && pending === 0) {
      setShowExpandForm(true);
      setSyncStatus(
        `Already have ${available} available of ${planned} planned. Confirm below if you want to add more.`,
      );
      return;
    }

    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const result = await syncMutation.mutateAsync({
        targetCount: target,
        batchSize,
        direction: `Fill missing episodes up to ${target} from the story bible.`,
      });
      setSyncStatus(result.message);
      await statusQuery.refetch();

      if (result.async && result.jobId) {
        setSyncStatus(`${result.message} Wait for the job to finish before starting another.`);
        return;
      }
      if (result.alreadyComplete || result.needsExpandConsent) {
        setShowExpandForm(true);
      }
    } catch (error) {
      setSyncStatus(error instanceof Error ? error.message : 'Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const runExpand = async () => {
    if (isSyncing || jobBlocked || !isExpanding) return;
    const direction = expandDirection.trim();
    if (direction.length < 20) {
      setSyncStatus(
        'Describe how to expand (new characters, locations, and plot) — at least 20 characters.',
      );
      return;
    }

    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const result = await syncMutation.mutateAsync({
        targetCount: resolvedTarget,
        batchSize,
        confirmExpand: true,
        direction,
      });
      setSyncStatus(result.message);
      await statusQuery.refetch();
      if (result.async && result.jobId) {
        setSyncStatus(
          `${result.message} Job ${result.jobId} — watch Notifications; re-run expand if more episodes remain.`,
        );
      }
      if (result.complete) setShowExpandForm(false);
    } catch (error) {
      setSyncStatus(error instanceof Error ? error.message : 'Expand failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const sendChat = async () => {
    const text = message.trim();
    if (!text || chatMutation.isPending) return;
    setMessage('');
    setHistory((prev) => [...prev, { role: 'user', content: text }]);
    try {
      const result = await chatMutation.mutateAsync({
        message: text,
        history,
      });
      const applied =
        result.appliedActions?.length > 0
          ? `\n\n_Applied: ${result.appliedActions.join(', ')}_`
          : '';
      setHistory((prev) => [...prev, { role: 'assistant', content: `${result.reply}${applied}` }]);
      await statusQuery.refetch();
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : 'Chat failed';
      setHistory((prev) => [...prev, { role: 'assistant', content: `Error: ${errMessage}` }]);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ListPlus className="size-4" />
            Sync available episodes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground text-sm">
            Planned: <strong>{planned}</strong> · Available: <strong>{available}</strong> · Scenes
            ready in plan:{' '}
            <strong>
              {generatedFromPlan}/{planned || 0}
            </strong>
            {pending > 0 ? (
              <>
                {' '}
                · Pending: <strong>{pending}</strong>
              </>
            ) : null}
          </p>

          {jobBlocked ? (
            <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm">
              An episode job is already running
              {jobWatch.job?.message ? ` (${jobWatch.job.message})` : ''}. Wait until it finishes —
              another sync/generate cannot be started.
            </p>
          ) : null}

          {alreadySynced ? (
            <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm">
              Available already matches the plan ({available}/{planned}). Generation will not run
              again unless you expand the season below.
            </p>
          ) : null}

          {!alreadySynced ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="sync-batch">Episodes per AI call (1–5)</Label>
                <Input
                  id="sync-batch"
                  type="number"
                  min={1}
                  max={5}
                  value={batchSize}
                  disabled={jobBlocked}
                  onChange={(e) =>
                    setBatchSize(Math.min(5, Math.max(1, Number(e.target.value) || 1)))
                  }
                />
              </div>
              <Button
                className="w-full"
                disabled={isSyncing || syncMutation.isPending || jobBlocked}
                onClick={() => void runFillMissing()}
              >
                {jobBlocked ? (
                  'Job running — wait…'
                ) : isSyncing || syncMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Syncing…
                  </>
                ) : (
                  `Fill missing up to ${Math.max(planned, available)} available`
                )}
              </Button>
            </>
          ) : (
            <Button
              className="w-full"
              variant="secondary"
              disabled={jobBlocked}
              onClick={() => setShowExpandForm(true)}
            >
              Add more episodes beyond the plan
            </Button>
          )}

          {(showExpandForm || alreadySynced || isExpanding) && (
            <div className="space-y-3 rounded-md border p-3">
              <p className="text-sm font-medium">Expand season</p>
              <p className="text-muted-foreground text-xs">
                Tell the director how to continue: new or returning characters, locations, and plot
                beats. This is required before generating past the current plan.
              </p>
              <div className="space-y-2">
                <Label htmlFor="expand-target">New total episode count</Label>
                <Input
                  id="expand-target"
                  type="number"
                  min={Math.max(planned, available) + 1}
                  max={30}
                  placeholder={String(Math.max(planned, available) + 1)}
                  value={targetCount}
                  onChange={(e) => {
                    const value = e.target.value;
                    setTargetCount(value === '' ? '' : Number(value));
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expand-direction">Characters, locations & story direction</Label>
                <Textarea
                  id="expand-direction"
                  rows={4}
                  placeholder="e.g. Introduce Mara’s sister at the market; move act 2 to Lagos harbour; keep Tunde’s secret until ep 9…"
                  value={expandDirection}
                  onChange={(e) => setExpandDirection(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expand-batch">Episodes per AI call</Label>
                <Input
                  id="expand-batch"
                  type="number"
                  min={1}
                  max={5}
                  value={batchSize}
                  onChange={(e) =>
                    setBatchSize(Math.min(5, Math.max(1, Number(e.target.value) || 1)))
                  }
                />
              </div>
              <Button
                className="w-full"
                disabled={
                  isSyncing ||
                  syncMutation.isPending ||
                  jobBlocked ||
                  !isExpanding ||
                  expandDirection.trim().length < 20
                }
                onClick={() => void runExpand()}
              >
                {jobBlocked ? (
                  'Job running — wait…'
                ) : isSyncing ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Expanding…
                  </>
                ) : (
                  `Confirm & generate to ${resolvedTarget}`
                )}
              </Button>
            </div>
          )}

          {syncStatus ? (
            <p className="text-muted-foreground text-xs whitespace-pre-wrap">{syncStatus}</p>
          ) : null}
          {syncMutation.error?.message && !syncStatus ? (
            <p className="text-destructive text-xs">{syncMutation.error.message}</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="size-4" />
            Story director chat
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-muted/40 max-h-64 space-y-2 overflow-y-auto rounded-md border p-3 text-sm">
            {history.length === 0 ? (
              <p className="text-muted-foreground">
                Ask to add lore, introduce a character, or add more episodes. Replies stay grounded
                in the story bible.
              </p>
            ) : (
              history.map((turn, index) => (
                <div
                  key={`${turn.role}-${index}`}
                  className={turn.role === 'user' ? 'text-foreground' : 'text-muted-foreground'}
                >
                  <span className="font-medium">{turn.role === 'user' ? 'You' : 'Director'}: </span>
                  <span className="whitespace-pre-wrap">{turn.content}</span>
                </div>
              ))
            )}
          </div>
          <Textarea
            rows={3}
            placeholder="e.g. Add 3 more episodes leading to the finale, keep Ada’s betrayal secret until ep 8…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={chatMutation.isPending}
          />
          <Button
            className="w-full"
            disabled={chatMutation.isPending || !message.trim()}
            onClick={() => void sendChat()}
          >
            {chatMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Thinking…
              </>
            ) : (
              <>
                <Send className="size-4" />
                Send
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
