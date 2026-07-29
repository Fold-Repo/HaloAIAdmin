import { Link } from 'react-router-dom';
import {
  BookOpen,
  Bot,
  Clapperboard,
  Film,
  GraduationCap,
  KeyRound,
  Rocket,
  BarChart3,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/constants';
import {
  ADMIN_TUTORIAL_STEPS,
  AI_GENERATION_STEPS,
  CREATE_PROJECT_STEPS,
  CREATE_SERIES_STEPS,
  DEMO_LOGIN,
  SEED_PROJECT_REF,
  WORKFLOW_TABS,
} from '@/features/tutorial/content/tutorial-content';

const WORKFLOW_ICONS = {
  'Story Bible': BookOpen,
  Episodes: Clapperboard,
  'AI Generation': Bot,
  Rendering: Film,
  Publishing: Rocket,
  Analytics: BarChart3,
} as const;

function StepList({ steps }: { steps: typeof CREATE_PROJECT_STEPS }) {
  return (
    <ol className="space-y-6">
      {steps.map((step) => (
        <li key={step.id} className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h3 className="text-lg font-semibold">{step.title}</h3>
            {step.path && (
              <Button asChild variant="outline" size="sm">
                <Link to={step.path}>Open in app</Link>
              </Button>
            )}
          </div>
          <p className="text-muted-foreground text-sm">{step.summary}</p>
          <ul className="text-muted-foreground list-disc space-y-1.5 pl-5 text-sm">
            {step.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
          {step.tip && (
            <p className="bg-muted rounded-md border px-3 py-2 text-sm">
              <span className="text-foreground font-medium">Tip:</span> {step.tip}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}

export function TutorialPage() {
  return (
    <article className="mx-auto max-w-4xl space-y-10 pb-12">
      <header className="space-y-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="size-8" aria-hidden="true" />
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Studio Tutorial</h1>
        </div>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Step-by-step guide to creating projects and series, running the AI generation pipeline,
          and publishing vertical episodes. Available to creators and admins.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="size-4" />
            Demo accounts
          </CardTitle>
          <CardDescription>Use these to explore the live API-backed studio.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {[DEMO_LOGIN.creator, DEMO_LOGIN.admin].map((account) => (
            <div key={account.email} className="rounded-lg border p-4 text-sm">
              <p className="font-medium">{account.name}</p>
              <p className="text-muted-foreground mt-1">
                <code>{account.email}</code>
                <span className="mx-1">/</span>
                <code>{account.password}</code>
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Create a new project</h2>
        <StepList steps={CREATE_PROJECT_STEPS} />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Create a series and attach projects</h2>
        <StepList steps={CREATE_SERIES_STEPS} />
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Project workflow bar</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Inside a project (e.g. <strong>{SEED_PROJECT_REF.title}</strong>), use the workflow
          buttons at the top to move through production stages. The screenshot below matches the
          live UI.
        </p>

        <figure className="overflow-hidden rounded-xl border bg-background shadow-sm">
          <img
            src="/tutorial/project-workflow.png"
            alt="Project workflow bar showing Story Bible, Episodes, AI Generation, Rendering, Publishing, and Analytics tabs for Halo Dark Secret"
            className="w-full"
            loading="lazy"
          />
          <figcaption className="text-muted-foreground border-t px-4 py-3 text-sm">
            Project header with status badge and workflow tabs — start at Story Bible, then
            Episodes, then AI Generation.
          </figcaption>
        </figure>

        <div className="grid gap-3 sm:grid-cols-2">
          {WORKFLOW_TABS.map((tab) => {
            const Icon = WORKFLOW_ICONS[tab.label as keyof typeof WORKFLOW_ICONS];
            return (
              <Card key={tab.label}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    {Icon && <Icon className="size-4" aria-hidden="true" />}
                    {tab.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{tab.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-semibold">AI Generation (detailed)</h2>
          <Badge variant="warning">Generating</Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          AI Generation is where automated agents turn your story bible and episode plan into
          scripts, visuals, video, voice, and subtitles. Open it from the{' '}
          <strong>AI Generation</strong> tab shown above.
        </p>
        <StepList steps={AI_GENERATION_STEPS} />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">For administrators</h2>
        <StepList steps={ADMIN_TUTORIAL_STEPS} />
      </section>

      <div className="flex flex-wrap gap-3 border-t pt-6">
        <Button asChild>
          <Link to={ROUTES.LOGIN}>Sign in to try it</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to={ROUTES.STUDIO.PROJECTS}>Browse projects</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link to={ROUTES.HOME}>Back to home</Link>
        </Button>
      </div>
    </article>
  );
}
