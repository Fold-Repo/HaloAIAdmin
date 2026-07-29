import { ROUTES } from '@/constants';

export type TutorialStep = {
  id: string;
  title: string;
  summary: string;
  bullets: string[];
  tip?: string;
  path?: string;
};

export const DEMO_LOGIN = {
  creator: { email: 'demo@creator.studio', password: 'Demo123!', name: 'Demo Creator' },
  admin: { email: 'admin@demo.com', password: 'Demo123!', name: 'Demo Admin' },
} as const;

export const SEED_PROJECT_REF = {
  id: 'seed-project-halo-dark-secret',
  title: 'Halo Dark Secret',
  series: 'Dark Chronicles',
} as const;

export const WORKFLOW_TABS = [
  { label: 'Story Bible', description: 'Define logline, characters, lore, and the master document.' },
  { label: 'Episodes', description: 'Plan episode beats, scenes, cliffhangers, and runtime.' },
  { label: 'AI Generation', description: 'Run script, character, video, voice, and subtitle agents.' },
  { label: 'Rendering', description: 'Monitor FFmpeg/GPU render queue and retry failed jobs.' },
  { label: 'Publishing', description: 'Configure settings, schedule releases, and publish episodes.' },
  { label: 'Analytics', description: 'Track views, revenue, watch time, and AI/render costs.' },
] as const;

export const CREATE_PROJECT_STEPS: TutorialStep[] = [
  {
    id: 'sign-in',
    title: '1. Sign in as a creator',
    summary: 'Use the demo creator account or register your own account.',
    bullets: [
      `Open ${ROUTES.LOGIN} and sign in with demo@creator.studio / Demo123!.`,
      'Complete onboarding if prompted (demo accounts skip this).',
      'You land on the Creator Dashboard with live stats from the API.',
    ],
    path: ROUTES.LOGIN,
  },
  {
    id: 'new-project',
    title: '2. Create a standalone project',
    summary: 'Start from the dashboard or Projects page when you do not need a series yet.',
    bullets: [
      'Click New project on the dashboard or go to Studio → Projects → New project.',
      'Enter title, description, and your story prompt (what the AI should generate).',
      'Choose genre, target format (vertical-short recommended), and episode length (e.g. 60 seconds).',
      'Leave series/season empty for a one-off project, or attach to an existing series (see below).',
      'Submit — the project opens with Story Bible, Episodes, and AI Generation tabs.',
    ],
    path: ROUTES.STUDIO.PROJECT_NEW,
  },
];

export const CREATE_SERIES_STEPS: TutorialStep[] = [
  {
    id: 'new-series',
    title: '3. Create a series and season',
    summary: 'Series group related projects; seasons organize episodes within a series.',
    bullets: [
      'Go to Studio → Series → Create series.',
      'Set title, description, and genre (e.g. Dark Chronicles / Supernatural Drama).',
      'Open the series detail page and add Season 1 with a title and season number.',
      'Seasons track episode count and production status (planning → in-production → complete).',
    ],
    path: ROUTES.STUDIO.SERIES,
  },
  {
    id: 'attach-project',
    title: '4. Add a project to an existing series',
    summary: 'Link new work to a series/season during project creation.',
    bullets: [
      'Start New project from the dashboard.',
      'In the series section, select an existing series and season instead of creating new ones.',
      'Alternatively, toggle Create new series when starting a brand-new anthology.',
      'The project detail page shows series and season names on the project card.',
      `Demo seed: "${SEED_PROJECT_REF.title}" belongs to series "${SEED_PROJECT_REF.series}".`,
    ],
    path: ROUTES.STUDIO.PROJECT_NEW,
  },
];

export const AI_GENERATION_STEPS: TutorialStep[] = [
  {
    id: 'open-ai',
    title: '5. Open AI Generation from the project',
    summary: 'Every project has a workflow bar — AI Generation is the automation hub.',
    bullets: [
      'Open any project (e.g. Halo Dark Secret) from Projects or the dashboard.',
      'Use the workflow buttons: Story Bible → Episodes → AI Generation → Rendering → Publishing → Analytics.',
      'Click AI Generation (robot icon) to open the AI Director dashboard.',
    ],
    path: `/studio/projects/${SEED_PROJECT_REF.id}/ai/dashboard`,
  },
  {
    id: 'director',
    title: '6. AI Director overview',
    summary: 'See all agents, pipeline status, and recent jobs in one place.',
    bullets: [
      'Story Planner — plans arcs from the story bible.',
      'Script — writes screenplay drafts from prompts and bible context.',
      'Character — generates reference sheets for visual consistency.',
      'Video — creates vertical scene video from storyboard frames.',
      'Voice — synthesizes dialogue; Subtitle — transcribes for captions.',
      'Check estimated cost before running the full pipeline.',
    ],
  },
  {
    id: 'run-agents',
    title: '7. Run agents and pipeline',
    summary: 'Run one agent or the full pipeline in order.',
    bullets: [
      'Run single agent: pick an agent, optional custom prompt, then Run.',
      'Run full pipeline: queues script → character → video → voice → subtitle in sequence.',
      'Monitor progress on the dashboard AI job panel and project notifications.',
      'Review outputs in Story Bible (document) and Episodes (scenes) before rendering.',
    ],
    tip: 'Complete Story Bible and Episodes first — agents use that context for better results.',
  },
  {
    id: 'after-ai',
    title: '8. After AI generation',
    summary: 'Move through rendering, publishing, and analytics.',
    bullets: [
      'Rendering — queue FFmpeg jobs, watch GPU workers, retry failures.',
      'Publishing — set visibility, schedule releases, generate HLS packages, publish episodes.',
      'Analytics — track views, revenue, completion, and AI/render spend per project.',
    ],
  },
];

export const ADMIN_TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'admin-sign-in',
    title: 'Admin access',
    summary: 'Admins can use the same creator workflow plus the admin portal.',
    bullets: [
      'Sign in with admin@demo.com / Demo123!.',
      'Open Admin from the home page or go to /admin/overview.',
      'Manage users, creators, moderation, AI spend, subscriptions, and feature flags.',
      'Use this Tutorial tab anytime — it is available to both admin and creator roles.',
    ],
    path: ROUTES.ADMIN,
  },
];
