#!/usr/bin/env node
/**
 * Master tutorial video script generator.
 *
 * Reads How-to-use guides and prints a shot list / VO script for each page.
 * Use this to brief editors or feed an AI video tool.
 *
 * Usage (from aiCreatorAdmin):
 *   node --experimental-strip-types docs/scripts/generate-how-to-video-script.mjs
 *   # or after build / with tsx:
 *   npx tsx docs/scripts/generate-how-to-video-script.mjs
 *
 * Output:
 *   docs/generated/HOW_TO_USE_VIDEO_SCRIPT.md
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', '..');

/** Inline mirror of guides — keep in sync with src/features/how-to-use/content/how-to-use.content.ts */
const GUIDES = [
  { id: 'home', title: 'Home', match: '/', estimatedVideoSec: 30, videoBeats: ['Show logo and CTA', 'Click Tutorial', 'Click Sign in'], steps: ['Use Tutorial in the header for the full walkthrough.', 'Sign in to open Creator Studio or the Admin portal.'] },
  { id: 'login', title: 'Sign in', match: '/login', estimatedVideoSec: 25, videoBeats: ['Fill demo credentials', 'Submit', 'Land on dashboard'], steps: ['Enter email and password.', 'Demo creator: demo@creator.studio / Demo123!', 'After login you land on the dashboard (creators) or admin overview.'] },
  { id: 'register', title: 'Create account', match: '/register', estimatedVideoSec: 35, videoBeats: ['Fill registration form', 'Submit', 'Show next step'], steps: ['Enter name, email, and password.', 'Complete OTP verification if prompted.', 'Finish onboarding, then open the dashboard.'] },
  { id: 'dashboard', title: 'Creator dashboard', match: '/dashboard', estimatedVideoSec: 45, videoBeats: ['Pan dashboard stats', 'Open New project', 'Open Notifications', 'Click How to use'], steps: ['Check active jobs and recent activity.', 'Click New project to start AI or manual upload.', 'Open Projects or Series from the sidebar.', 'Use How to use on any page for contextual help.'] },
  { id: 'projects', title: 'Projects', match: '/studio/projects', estimatedVideoSec: 35, videoBeats: ['Scroll project list', 'Open a project card', 'Click New project'], steps: ['Browse projects by title and status.', 'Open a project to reach workflow tabs.', 'Create a new project with New project.'] },
  { id: 'project-new', title: 'New project', match: '/studio/projects/new', estimatedVideoSec: 60, videoBeats: ['Toggle AI vs Manual', 'Fill title and premise', 'Set episode length', 'Create project'], steps: ['Choose AI generation or Manual video upload.', 'Set title, premise, genre, format, and episode length.', 'Optionally attach a series/season.', 'Submit.'] },
  { id: 'project-detail', title: 'Project detail', match: '/studio/projects/:projectId', estimatedVideoSec: 50, videoBeats: ['Show project header', 'Click each workflow tab', 'Return to hub'], steps: ['Use workflow links in order.', 'Check progress and episode readiness.'] },
  { id: 'manual-upload', title: 'Manual episode upload', match: '/studio/projects/:projectId/manual-upload', estimatedVideoSec: 50, videoBeats: ['Select episode', 'Choose MP4', 'Show Ready badge'], steps: ['Pick a Missing episode slot.', 'Upload MP4.', 'Wait for Ready.'] },
  { id: 'composer', title: 'Story Composer', match: '/studio/projects/:projectId/composer', estimatedVideoSec: 75, videoBeats: ['Show composer status', 'Set batch size', 'Start generate', 'Show job + notification', 'Open an episode'], steps: ['Compose or sync the story plan.', 'Generate episodes in small batches.', 'Expand with direction when needed.', 'Use Director / Scene plan chat to refine.'] },
  { id: 'story-bible', title: 'Story Bible', match: '/studio/projects/:projectId/story-bible/:section', estimatedVideoSec: 55, videoBeats: ['Open Characters', 'Edit a character', 'Open Locations', 'Show document editor briefly'], steps: ['Switch bible sections.', 'Edit and save.', 'Generate reference images when ready.'] },
  { id: 'episodes', title: 'Episodes', match: '/studio/projects/:projectId/episodes', estimatedVideoSec: 45, videoBeats: ['Show episode list + progress', 'Open episode', 'Show delete caution'], steps: ['Open an episode.', 'Progress = video coverage + assembly.', 'Use plan tools to sync or expand.'] },
  { id: 'episode-detail', title: 'Episode detail', match: '/studio/projects/:projectId/episodes/:episodeId', estimatedVideoSec: 70, videoBeats: ['Show scene timeline', 'Open assemble panel', 'Point at progress', 'Mention Video Agent next'], steps: ['Edit scenes.', 'Generate videos via Video Agent.', 'Assemble when all scenes have video.'] },
  { id: 'ai-generation', title: 'AI Generation / Video Agent', match: '/studio/projects/:projectId/ai/:section', estimatedVideoSec: 80, videoBeats: ['Open Video Agent', 'Select remaining scenes', 'Start Generate', 'Show job progress + lock', 'Pick a video version'], steps: ['Generate skips scenes with video.', 'Regenerate adds a new take.', 'Jobs run in the background; buttons stay locked.', 'Select best version before assembly.'] },
  { id: 'rendering', title: 'Rendering', match: '/studio/projects/:projectId/rendering/:section', estimatedVideoSec: 40, videoBeats: ['Open Progress', 'Show Queue', 'Show a job status'], steps: ['Check Progress and Queue.', 'Retry failed jobs when needed.'] },
  { id: 'publishing', title: 'Publishing', match: '/studio/projects/:projectId/publishing/:section', estimatedVideoSec: 55, videoBeats: ['Open wizard', 'Review settings', 'Publish'], steps: ['Complete publish wizard.', 'Ensure assembled/uploaded videos exist.', 'Publish to mobile catalog.'] },
  { id: 'analytics', title: 'Analytics', match: '/studio/projects/:projectId/analytics/:section', estimatedVideoSec: 40, videoBeats: ['Show dashboard charts', 'Switch to AI cost'], steps: ['Browse dashboard and cost sections.', 'Export when needed.'] },
  { id: 'series', title: 'Series', match: '/studio/series', estimatedVideoSec: 40, videoBeats: ['List series', 'Create series', 'Open detail'], steps: ['Create a series.', 'Manage seasons and linked projects.'] },
  { id: 'seasons', title: 'Seasons', match: '/studio/series/:seriesId/seasons', estimatedVideoSec: 30, videoBeats: ['Add season', 'Show season list'], steps: ['Add a season.', 'Track status.'] },
  { id: 'notifications', title: 'Notifications', match: '/studio/notifications', estimatedVideoSec: 25, videoBeats: ['Open list', 'Click a notification link'], steps: ['Open job-ready alerts.', 'Follow the deep link.'] },
  { id: 'ai-settings', title: 'AI Settings', match: '/studio/settings/ai', estimatedVideoSec: 40, videoBeats: ['Show model list', 'Toggle video model', 'Save'], steps: ['Enable Grok / Claude models.', 'Choose auto or manual selection.'] },
  { id: 'admin', title: 'Admin portal', match: '/admin/:section', estimatedVideoSec: 45, videoBeats: ['Open overview', 'Open users', 'Open system health'], steps: ['Switch admin sections.', 'Review users, usage, and health.'] },
];

function buildMarkdown() {
  const totalSec = GUIDES.reduce((sum, g) => sum + g.estimatedVideoSec, 0);
  const lines = [
    '# How-to-use video master script',
    '',
    '_Generated by `docs/scripts/generate-how-to-video-script.mjs`. Do not edit by hand — update guides then re-run._',
    '',
    `Total estimated runtime (all pages): **~${Math.round(totalSec / 60)} min ${totalSec % 60}s** (${GUIDES.length} clips).`,
    '',
    '## Global production notes',
    '',
    '- Aspect: **16:9** for docs site, or **9:16** for in-app / social.',
    '- Capture: Chrome, logged in as `demo@creator.studio` / `Demo123!` when studio UI is required.',
    '- VO tone: calm, instructional, no hype. Name the button the viewer should click.',
    '- On-screen: highlight cursor; zoom to primary CTA; show How to use modal once early.',
    '- Brand: use real product UI — no purple-gradient stock templates.',
    '- Deliverable per guide: `howto-<id>.mp4` + SRT captions.',
    '',
    '## Recommended series order (full course)',
    '',
    '1. home → login → dashboard',
    '2. project-new → project-detail → composer → story-bible',
    '3. episodes → episode-detail → ai-generation → publishing',
    '4. series → seasons → notifications → ai-settings',
    '5. admin (optional ops track)',
    '',
    '---',
    '',
  ];

  for (const [index, guide] of GUIDES.entries()) {
    lines.push(`## ${index + 1}. ${guide.title} (\`${guide.id}\`)`);
    lines.push('');
    lines.push(`- **Route pattern:** \`${guide.match}\``);
    lines.push(`- **Target length:** ~${guide.estimatedVideoSec}s`);
    lines.push(`- **Output file:** \`howto-${guide.id}.mp4\``);
    lines.push('');
    lines.push('### Voice-over script');
    lines.push('');
    lines.push(
      `Welcome to ${guide.title}. ${guide.steps.map((step, i) => `Step ${i + 1}: ${step}`).join(' ')}`,
    );
    lines.push('');
    lines.push('### Shot list / screen beats');
    lines.push('');
    guide.videoBeats.forEach((beat, i) => {
      lines.push(`${i + 1}. ${beat}`);
    });
    lines.push('');
    lines.push('### Checklist before cut');
    lines.push('');
    lines.push('- [ ] UI readable at 1080p');
    lines.push('- [ ] No secrets / real API keys on screen');
    lines.push('- [ ] Captions reviewed');
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  lines.push('## AI video prompt template (optional)');
  lines.push('');
  lines.push('```text');
  lines.push(
    'Create a concise product tutorial clip for a creator studio web app.',
  );
  lines.push('Vertical or landscape screen recording style with calm VO.');
  lines.push('Page: {{title}} ({{id}})');
  lines.push('Beats: {{videoBeats}}');
  lines.push('Do not invent purple gradient marketing UI — match a clean admin SaaS.');
  lines.push('```');
  lines.push('');

  return lines.join('\n');
}

const outDir = join(root, 'docs', 'generated');
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, 'HOW_TO_USE_VIDEO_SCRIPT.md');
writeFileSync(outPath, buildMarkdown(), 'utf8');
console.log(`Wrote ${outPath}`);
console.log(`Guides: ${GUIDES.length}`);
