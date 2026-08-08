/**
 * Contextual "How to use" guides for each app page.
 * Used by HowToUseModal and by docs/scripts for tutorial video generation.
 */

export type HowToUseGuide = {
  /** Stable id — also used as video script scene key */
  id: string;
  /** Match pathname (supports :param segments) */
  match: string;
  title: string;
  summary: string;
  steps: string[];
  tips?: string[];
  /** Beats for screen-recording / AI how-to video */
  videoBeats: string[];
  estimatedVideoSec: number;
};

export const HOW_TO_USE_GUIDES: HowToUseGuide[] = [
  {
    id: 'home',
    match: '/',
    title: 'Home',
    summary: 'Landing page for Halo Creator Studio.',
    steps: [
      'Use Tutorial in the header for the full walkthrough.',
      'Sign in to open Creator Studio or the Admin portal.',
    ],
    videoBeats: ['Show logo and CTA', 'Click Tutorial', 'Click Sign in'],
    estimatedVideoSec: 30,
  },
  {
    id: 'login',
    match: '/login',
    title: 'Sign in',
    summary: 'Access your creator or admin account.',
    steps: [
      'Enter email and password.',
      'Demo creator: demo@creator.studio / Demo123!',
      'After login you land on the dashboard (creators) or admin overview.',
    ],
    tips: ['Use Forgot password if you need a reset flow.'],
    videoBeats: ['Fill demo credentials', 'Submit', 'Land on dashboard'],
    estimatedVideoSec: 25,
  },
  {
    id: 'register',
    match: '/register',
    title: 'Create account',
    summary: 'Register a new creator account.',
    steps: [
      'Enter name, email, and password.',
      'Complete OTP verification if prompted.',
      'Finish onboarding, then open the dashboard.',
    ],
    videoBeats: ['Fill registration form', 'Submit', 'Show next step'],
    estimatedVideoSec: 35,
  },
  {
    id: 'forgot-password',
    match: '/forgot-password',
    title: 'Forgot password',
    summary: 'Request a password reset.',
    steps: ['Enter your account email.', 'Follow the OTP / reset steps in your inbox flow.'],
    videoBeats: ['Enter email', 'Submit request'],
    estimatedVideoSec: 20,
  },
  {
    id: 'verify-otp',
    match: '/verify-otp',
    title: 'Verify OTP',
    summary: 'Confirm the one-time code for auth flows.',
    steps: ['Enter the code from email/SMS.', 'Continue to the next authenticated screen.'],
    videoBeats: ['Enter OTP', 'Confirm'],
    estimatedVideoSec: 20,
  },
  {
    id: 'onboarding',
    match: '/onboarding',
    title: 'Onboarding',
    summary: 'One-time setup after registration.',
    steps: ['Complete each onboarding step.', 'Submit to unlock Creator Studio.'],
    videoBeats: ['Walk through wizard steps', 'Finish'],
    estimatedVideoSec: 40,
  },
  {
    id: 'dashboard',
    match: '/dashboard',
    title: 'Creator dashboard',
    summary: 'Overview of projects, jobs, and quick actions.',
    steps: [
      'Check active jobs and recent activity.',
      'Click New project to start AI or manual upload.',
      'Open Projects or Series from the sidebar.',
      'Use How to use (this dialog) on any page for contextual help.',
    ],
    tips: ['Notifications bell shows when background AI jobs finish.'],
    videoBeats: [
      'Pan dashboard stats',
      'Open New project',
      'Open Notifications',
      'Click How to use',
    ],
    estimatedVideoSec: 45,
  },
  {
    id: 'projects',
    match: '/studio/projects',
    title: 'Projects',
    summary: 'List and open all of your productions.',
    steps: [
      'Browse projects by title and status.',
      'Open a project to reach Story Composer, Episodes, AI, and Publishing.',
      'Create a new project with New project.',
    ],
    videoBeats: ['Scroll project list', 'Open a project card', 'Click New project'],
    estimatedVideoSec: 35,
  },
  {
    id: 'project-new',
    match: '/studio/projects/new',
    title: 'New project',
    summary: 'Create an AI-generated or manual-upload project.',
    steps: [
      'Choose AI generation or Manual video upload.',
      'Set title, premise, genre, format, and episode length.',
      'Optionally attach a series/season.',
      'Submit — AI projects open Composer; manual projects open upload.',
    ],
    tips: ['Manual mode seeds empty episode slots for MP4 upload.'],
    videoBeats: [
      'Toggle AI vs Manual',
      'Fill title and premise',
      'Set episode length',
      'Create project',
    ],
    estimatedVideoSec: 60,
  },
  {
    id: 'project-detail',
    match: '/studio/projects/:projectId',
    title: 'Project detail',
    summary: 'Hub for one production — workflow tabs and status.',
    steps: [
      'Use workflow links: Composer → Story Bible → Episodes → AI → Rendering → Publishing → Analytics.',
      'Check progress and episode readiness.',
      'Delete only when you intend to remove the whole project.',
    ],
    videoBeats: ['Show project header', 'Click each workflow tab', 'Return to hub'],
    estimatedVideoSec: 50,
  },
  {
    id: 'manual-upload',
    match: '/studio/projects/:projectId/manual-upload',
    title: 'Manual episode upload',
    summary: 'Upload ready MP4s per episode (no scene assembly).',
    steps: [
      'Pick an episode slot marked Missing.',
      'Upload an MP4 (size limits apply).',
      'Wait for Ready, then publish from Publishing when the title is live.',
    ],
    tips: ['Replacing a video on a published title pushes an updated catalog link.'],
    videoBeats: ['Select episode', 'Choose MP4', 'Show Ready badge'],
    estimatedVideoSec: 50,
  },
  {
    id: 'composer',
    match: '/studio/projects/:projectId/composer',
    title: 'Story Composer',
    summary: 'Plan the series and generate episode scenes with Claude.',
    steps: [
      'Compose or sync the full story plan (episode count, bible).',
      'Generate episodes in small batches (background job + notification).',
      'Expand the plan when you need more episodes (requires direction).',
      'Use Director / Scene plan chat to refine beats without regenerating everything.',
    ],
    tips: [
      'Only one generate/sync job runs per project at a time.',
      'Batch size is configurable — start with 1 if Claude times out.',
    ],
    videoBeats: [
      'Show composer status',
      'Set batch size',
      'Start generate',
      'Show job + notification',
      'Open an episode',
    ],
    estimatedVideoSec: 75,
  },
  {
    id: 'story-bible',
    match: '/studio/projects/:projectId/story-bible/:section',
    title: 'Story Bible',
    summary: 'Characters, locations, props, overview, and document.',
    steps: [
      'Switch sections in the bible nav (overview, characters, locations, props, etc.).',
      'Edit fields and save — visual notes stay frozen when story sync merges.',
      'Generate reference images from Visual tools when ready.',
      'Use Versions to snapshot or restore the document.',
    ],
    videoBeats: [
      'Open Characters',
      'Edit a character',
      'Open Locations',
      'Show document editor briefly',
    ],
    estimatedVideoSec: 55,
  },
  {
    id: 'story-bible-root',
    match: '/studio/projects/:projectId/story-bible',
    title: 'Story Bible',
    summary: 'Canonical story world for the project.',
    steps: [
      'Pick a section from the nav.',
      'Keep characters and locations in sync as Composer expands the story.',
    ],
    videoBeats: ['Land on overview', 'Navigate to characters'],
    estimatedVideoSec: 25,
  },
  {
    id: 'episodes',
    match: '/studio/projects/:projectId/episodes',
    title: 'Episodes',
    summary: 'Episode list, progress, and plan tools.',
    steps: [
      'Open an episode to edit scenes and assemble video.',
      'Progress is video coverage + assembly (100% when all scenes have video and the episode is assembled).',
      'Use plan tools to sync counts or expand with direction.',
      'Delete an episode only with confirmation — it cascades scenes/videos.',
    ],
    videoBeats: ['Show episode list + progress', 'Open episode', 'Show delete caution'],
    estimatedVideoSec: 45,
  },
  {
    id: 'episode-detail',
    match: '/studio/projects/:projectId/episodes/:episodeId',
    title: 'Episode detail',
    summary: 'Scenes, cliffhangers, AI preview, and assembly.',
    steps: [
      'Edit episode metadata and scene list.',
      'Use Scene plan chat to expand or reshape scenes (recalibrates progress).',
      'Generate scene videos from AI → Video Agent.',
      'Assemble when every scene has a selected video.',
      'Published titles push catalog updates when the assembled video changes.',
    ],
    tips: ['Adding scenes clears a prior assembled file until you reassemble.'],
    videoBeats: [
      'Show scene timeline',
      'Open assemble panel',
      'Point at progress',
      'Mention Video Agent next',
    ],
    estimatedVideoSec: 70,
  },
  {
    id: 'ai-generation',
    match: '/studio/projects/:projectId/ai/:section',
    title: 'AI Generation',
    summary: 'Run agents: script, character, video, voice, and more.',
    steps: [
      'Open the agent you need from the AI nav (Video Agent for scene clips).',
      'Video Agent: Generate skips scenes that already have video; Regenerate adds a new take.',
      'Video jobs run in the background — buttons stay locked until the job finishes.',
      'Select the best video version per scene before assembly.',
    ],
    tips: [
      'Configure models under Studio → AI Settings.',
      'Cost estimator is historical — real video cost is duration × $/second.',
    ],
    videoBeats: [
      'Open Video Agent',
      'Select remaining scenes',
      'Start Generate',
      'Show job progress + lock',
      'Pick a video version',
    ],
    estimatedVideoSec: 80,
  },
  {
    id: 'ai-root',
    match: '/studio/projects/:projectId/ai',
    title: 'AI Generation',
    summary: 'AI Director hub for this project.',
    steps: ['Open a section such as Video or Cost.', 'Run agents from each agent panel.'],
    videoBeats: ['Show AI dashboard', 'Click Video'],
    estimatedVideoSec: 25,
  },
  {
    id: 'rendering',
    match: '/studio/projects/:projectId/rendering/:section',
    title: 'Rendering',
    summary: 'Monitor render/FFmpeg jobs and workers.',
    steps: [
      'Check Progress and Queue for stuck jobs.',
      'Retry failed jobs from Retry when needed.',
      'Use History for past runs.',
    ],
    videoBeats: ['Open Progress', 'Show Queue', 'Show a job status'],
    estimatedVideoSec: 40,
  },
  {
    id: 'publishing',
    match: '/studio/projects/:projectId/publishing/:section',
    title: 'Publishing',
    summary: 'Publish the title to the mobile catalog.',
    steps: [
      'Complete the publish wizard (categories, visibility, monetization).',
      'Ensure episodes have assembled (or uploaded) videos.',
      'Publish — devices on catalog_releases get FCM for new/updated episodes.',
    ],
    videoBeats: ['Open wizard', 'Review settings', 'Publish'],
    estimatedVideoSec: 55,
  },
  {
    id: 'analytics',
    match: '/studio/projects/:projectId/analytics/:section',
    title: 'Analytics',
    summary: 'Performance, revenue, and cost views.',
    steps: [
      'Browse dashboard, watch time, and cost sections.',
      'Export when you need offline reporting.',
    ],
    videoBeats: ['Show dashboard charts', 'Switch to AI cost'],
    estimatedVideoSec: 40,
  },
  {
    id: 'series',
    match: '/studio/series',
    title: 'Series',
    summary: 'Catalog containers for multi-project anthologies.',
    steps: [
      'Create a series with title and genre.',
      'Open a series to manage seasons and linked projects.',
    ],
    videoBeats: ['List series', 'Create series', 'Open detail'],
    estimatedVideoSec: 40,
  },
  {
    id: 'series-detail',
    match: '/studio/series/:seriesId',
    title: 'Series detail',
    summary: 'Series metadata and linked projects.',
    steps: [
      'Edit series info.',
      'Open Seasons to add Season 1, 2, …',
      'Attach projects when creating them.',
    ],
    videoBeats: ['Show series header', 'Open Seasons'],
    estimatedVideoSec: 35,
  },
  {
    id: 'seasons',
    match: '/studio/series/:seriesId/seasons',
    title: 'Seasons',
    summary: 'Organize episodes by season under a series.',
    steps: ['Add a season with number and title.', 'Track planning → in production → complete.'],
    videoBeats: ['Add season', 'Show season list'],
    estimatedVideoSec: 30,
  },
  {
    id: 'notifications',
    match: '/studio/notifications',
    title: 'Notifications',
    summary: 'In-app alerts for background jobs and system events.',
    steps: [
      'Open items for episode/video generation ready or failed.',
      'Follow the link into the relevant project page.',
    ],
    videoBeats: ['Open list', 'Click a notification link'],
    estimatedVideoSec: 25,
  },
  {
    id: 'studio-tutorial',
    match: '/studio/tutorial',
    title: 'Tutorial',
    summary: 'Full guided walkthrough of Creator Studio.',
    steps: [
      'Follow each step in order for first-time setup.',
      'Use How to use on other pages for page-specific help.',
    ],
    videoBeats: ['Scroll tutorial steps', 'Click a deep link'],
    estimatedVideoSec: 40,
  },
  {
    id: 'ai-settings',
    match: '/studio/settings/ai',
    title: 'AI Settings',
    summary: 'Enable models, keys (via env), and selection mode.',
    steps: [
      'Enable Grok Imagine for video and Claude/OpenAI for story.',
      'Choose auto or manual model selection.',
      'Ensure API keys are set on the backend (.env).',
    ],
    videoBeats: ['Show model list', 'Toggle video model', 'Save'],
    estimatedVideoSec: 40,
  },
  {
    id: 'admin',
    match: '/admin/:section',
    title: 'Admin portal',
    summary: 'Platform administration (users, moderation, health).',
    steps: [
      'Switch sections from the admin nav.',
      'Review users, creators, AI usage, and system health.',
      'Use feature flags and audit logs for operations.',
    ],
    videoBeats: ['Open overview', 'Open users', 'Open system health'],
    estimatedVideoSec: 45,
  },
  {
    id: 'admin-root',
    match: '/admin',
    title: 'Admin portal',
    summary: 'Admin home — redirects to overview.',
    steps: ['Continue to Overview for platform metrics.'],
    videoBeats: ['Land on admin overview'],
    estimatedVideoSec: 15,
  },
  {
    id: 'public-tutorial',
    match: '/tutorial',
    title: 'Public tutorial',
    summary: 'Same walkthrough available without the studio chrome.',
    steps: ['Read the end-to-end creator flow.', 'Sign in when ready to try it.'],
    videoBeats: ['Show tutorial page', 'CTA to login'],
    estimatedVideoSec: 30,
  },
];

const FALLBACK_GUIDE: HowToUseGuide = {
  id: 'fallback',
  match: '*',
  title: 'How to use this page',
  summary: 'Contextual help is not defined for this exact URL yet.',
  steps: [
    'Use the sidebar Tutorial for the full walkthrough.',
    'Open Story Composer → Episodes → AI → Publishing in order for a new title.',
    'Check Notifications when background jobs finish.',
  ],
  tips: ['Ask for a page-specific guide if this screen is new.'],
  videoBeats: ['Show fallback help', 'Open Tutorial from sidebar'],
  estimatedVideoSec: 25,
};

function patternToRegex(pattern: string): RegExp {
  if (pattern === '/') return /^\/$/;
  const escaped = pattern
    .split('/')
    .map((segment) => {
      if (!segment) return '';
      if (segment.startsWith(':')) return '[^/]+';
      return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    })
    .join('/');
  return new RegExp(`^${escaped}/?$`);
}

function specificity(pattern: string): number {
  return pattern.split('/').filter(Boolean).length * 10 + (pattern.includes(':') ? 0 : 5);
}

/** Resolve the best How-to-use guide for a pathname. */
export function resolveHowToUseGuide(pathname: string): HowToUseGuide {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  const ranked = [...HOW_TO_USE_GUIDES].sort((a, b) => specificity(b.match) - specificity(a.match));

  for (const guide of ranked) {
    if (patternToRegex(guide.match).test(normalized)) {
      return guide;
    }
  }

  return FALLBACK_GUIDE;
}

export function listHowToUseGuidesForVideoScript(): HowToUseGuide[] {
  return HOW_TO_USE_GUIDES.filter((guide) => guide.id !== 'fallback');
}
