# Backend API Specification

API contract derived from the **AI Creator Admin** frontend (`src/features/*/services/*.service.ts`).

Use this document to implement the backend that replaces dev mocks and demo auth.

**Implementation plan:** [BACKEND_PLAN.md](./BACKEND_PLAN.md)  
**Scaffold:** [`backend/`](../backend/) (NestJS, deployable independently)

---

## Overview

| Item | Value |
|------|-------|
| **Base URL** | `http://localhost:3000/api` (configurable via `VITE_API_BASE_URL`) |
| **Format** | JSON |
| **Auth header** | `Authorization: Bearer <accessToken>` on protected routes |
| **Content-Type** | `application/json` |

### Response envelope

All successful responses use:

```json
{
  "success": true,
  "data": {},
  "message": "optional human-readable message"
}
```

### Error envelope

On failure, return HTTP 4xx/5xx with:

```json
{
  "message": "Human-readable error",
  "code": "OPTIONAL_ERROR_CODE",
  "status": 400,
  "errors": {
    "fieldName": ["Validation message"]
  }
}
```

The Axios client in `src/api/client.ts` expects this shape and automatically refreshes tokens on `401` via `POST /auth/refresh`.

### Roles

| Role | Access |
|------|--------|
| `creator` | Creator studio routes under `/creator/*` |
| `viewer` | Read-only creator routes (if enforced server-side) |
| `admin` | `/admin/*` routes |

---

## Authentication (`/auth`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/login` | No | Sign in |
| `POST` | `/auth/register` | No | Create account |
| `POST` | `/auth/logout` | Yes | Invalidate session |
| `GET` | `/auth/session` | Yes | Restore current session |
| `POST` | `/auth/refresh` | No* | Refresh access token |
| `POST` | `/auth/forgot-password` | No | Send reset OTP/email |
| `POST` | `/auth/verify-otp` | No | Verify OTP code |
| `POST` | `/auth/resend-otp` | No | Resend OTP |
| `POST` | `/auth/reset-password` | No | Reset password with OTP |
| `PATCH` | `/auth/onboarding` | Yes | Complete creator onboarding |
| `GET` | `/auth/oauth/:provider` | No | OAuth redirect (`google`, `github`, `apple`) |

\*Refresh uses `refreshToken` in body, not access token.

### `POST /auth/login`

**Request**

```json
{
  "email": "user@example.com",
  "password": "string"
}
```

**Response `data`:** `AuthSession`

```json
{
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "avatarUrl": "string?",
    "role": "admin | creator | viewer",
    "emailVerified": true,
    "onboardingCompleted": true,
    "createdAt": "ISO-8601",
    "updatedAt": "ISO-8601"
  },
  "tokens": {
    "accessToken": "string",
    "refreshToken": "string",
    "expiresIn": 3600
  }
}
```

### `POST /auth/register`

**Request**

```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "confirmPassword": "string",
  "acceptTerms": true
}
```

**Response `data`:** `{ "email": "string" }`

### `POST /auth/refresh`

**Request**

```json
{
  "refreshToken": "string"
}
```

**Response `data`:** `AuthSession`

### `POST /auth/forgot-password`

**Request:** `{ "email": "string" }`  
**Response `data`:** `{ "email": "string" }`

### `POST /auth/verify-otp`

**Request**

```json
{
  "email": "string",
  "code": "string",
  "purpose": "registration | password-reset | login-2fa"
}
```

**Response `data`:** `AuthSession` **or** `{ "verified": true }`

### `POST /auth/resend-otp`

**Request**

```json
{
  "email": "string",
  "purpose": "registration | password-reset | login-2fa"
}
```

**Response `data`:** `null`

### `POST /auth/reset-password`

**Request**

```json
{
  "email": "string",
  "code": "string",
  "password": "string",
  "confirmPassword": "string"
}
```

**Response `data`:** `null`

### `PATCH /auth/onboarding`

**Request**

```json
{
  "displayName": "string",
  "studioName": "string",
  "contentType": "short-drama | series | documentary | other",
  "experienceLevel": "beginner | intermediate | expert",
  "notificationsEnabled": true
}
```

**Response `data`:** `AuthSession` (user should have `onboardingCompleted: true`)

---

## Creator Studio (`/creator`)

### Dashboard & projects

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/creator/dashboard/stats` | Dashboard KPIs |
| `GET` | `/creator/projects` | List projects |
| `GET` | `/creator/projects/:projectId` | Get project |
| `POST` | `/creator/projects` | Create project |

**`CreatorDashboardStats`**

```json
{
  "totalProjects": 0,
  "activeJobs": 0,
  "publishedEpisodes": 0,
  "seriesCount": 0
}
```

**`CreatorProject`**

```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "prompt": "string",
  "status": "draft | generating | ready | rendering | published | failed",
  "seriesId": "string?",
  "seriesTitle": "string?",
  "seasonId": "string?",
  "seasonTitle": "string?",
  "thumbnailUrl": "string?",
  "episodeCount": 0,
  "progress": 0,
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601"
}
```

**`POST /creator/projects` body (`CreateProjectPayload`)**

```json
{
  "title": "string",
  "description": "string",
  "prompt": "string",
  "genre": "string",
  "targetFormat": "vertical-short | vertical-series | horizontal",
  "episodeLength": 60,
  "seriesId": "string?",
  "seasonId": "string?",
  "createNewSeries": false,
  "newSeriesTitle": "string?",
  "newSeasonTitle": "string?"
}
```

### Series & seasons

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/creator/series` | List series |
| `GET` | `/creator/series/:seriesId` | Get series |
| `POST` | `/creator/series` | Create series |
| `PATCH` | `/creator/series/:seriesId` | Update series |
| `DELETE` | `/creator/series/:seriesId` | Delete series |
| `GET` | `/creator/series/:seriesId/seasons` | List seasons |
| `POST` | `/creator/series/:seriesId/seasons` | Create season |
| `PATCH` | `/creator/series/:seriesId/seasons/:seasonId` | Update season |

**`CreateSeriesPayload`:** `{ "title", "description", "genre" }`  
**`CreateSeasonPayload`:** `{ "seriesId", "title", "number", "description?" }`  
**`UpdateSeriesPayload`:** partial series fields + optional `status: active | archived`  
**`UpdateSeasonPayload`:** partial season fields + optional `status: planning | in-production | complete`

### Jobs & notifications

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/creator/jobs` | List AI/render jobs |
| `GET` | `/creator/notifications` | List notifications |
| `PATCH` | `/creator/notifications/:notificationId/read` | Mark one read |
| `POST` | `/creator/notifications/read-all` | Mark all read |

**`AiJob`:** `{ id, projectId, projectTitle, type, status, progress, message?, startedAt?, completedAt? }`  
**Job types:** `script | character | video | voice | subtitle | render`  
**Job status:** `queued | running | completed | failed | cancelled`

**`CreatorNotification`:** `{ id, title, message, type, read, createdAt, link? }`  
**Notification type:** `info | success | warning | error`

---

## Story Bible (`/creator/projects/:projectId/story-bible`)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/creator/projects/:projectId/story-bible` | Full story bible document |
| `PATCH` | `/creator/projects/:projectId/story-bible/overview` | Update overview |
| `PATCH` | `/creator/projects/:projectId/story-bible/ending` | Update ending plan |
| `PATCH` | `/creator/projects/:projectId/story-bible/document` | Update editor document |
| `POST` | `/creator/projects/:projectId/story-bible/versions` | Save version snapshot |
| `POST` | `/creator/projects/:projectId/story-bible/versions/:versionId/restore` | Restore version |
| `POST` | `/creator/projects/:projectId/story-bible/extract-episodes/preview` | Preview parsed episodes/scenes from document |
| `POST` | `/creator/projects/:projectId/story-bible/extract-episodes` | Create/update episodes and scenes from document |
| `GET` | `/creator/projects/:projectId/story-bible/composer/status` | Story composer pipeline status |
| `POST` | `/creator/projects/:projectId/story-bible/composer/compose` | Generate story from premise (Claude) |
| `POST` | `/creator/projects/:projectId/story-bible/composer/expand-episodes` | Add episodes and sync summary |
| `POST` | `/creator/projects/:projectId/story-bible/composer/sync-summary` | Rewrite story bible summary from DB state |

**`GET` response `data`:** `StoryBible`

```json
{
  "overview": { "projectId", "logline", "synopsis", "themes[]", "tone", "targetAudience", "updatedAt" },
  "characters": [],
  "relationships": [],
  "timeline": [],
  "lore": [],
  "locations": [],
  "props": [],
  "wardrobe": [],
  "seasonArc": [],
  "ending": { "projectId", "summary", "twist", "sequelHook", "updatedAt" },
  "document": { "projectId", "format", "content", "updatedAt" },
  "versions": [{ "id", "label", "changeSummary", "content", "createdAt" }]
}
```

**`PATCH .../overview` body:** `{ logline, synopsis, themes[], tone, targetAudience }`  
**`PATCH .../ending` body:** `{ summary, twist, sequelHook }`  
**`PATCH .../document` body:** `{ content, format, extractEpisodes?, extractMode? }` where `extractMode` is `merge | replace`  
**`POST .../versions` body:** `{ label, changeSummary }`  
**`POST .../extract-episodes/preview` body:** `{ content? }` — uses saved document when `content` omitted  
**`POST .../extract-episodes` body:** `{ content?, mode?: 'merge' | 'replace' }`

Document structure for extraction: headings such as `Episode 1: Title`, `Scene 1: Title`, screenplay slug lines (`INT./EXT.`), optional `Characters:` and `Cliffhanger:` lines.

**Story Composer (guided flow — preferred over paste/extract):**

**`GET .../composer/status` response `data`:** `{ projectId, hasStoryOverview, hasDocument, episodeCount, scenesTotal, scenesReady, videoUnlocked, summarySyncedAt?, nextStep, overview? }` where `nextStep` is `compose | review-episodes | complete-scenes | generate-video | done`.

**`POST .../composer/compose` body:** `{ premise, episodeCount, episodeLengthSec?, seriesContext?, mode?: 'replace' | 'merge' }` — Claude expands the premise into overview, document, episodes, and scenes.

**`POST .../composer/expand-episodes` body:** `{ count, direction? }` — adds episodes, then rewrites the story summary.

**`POST .../composer/sync-summary` body:** none — rewrites overview/document from current episodes and scenes in the database.

Video generation is blocked until every scene has a description of at least 40 characters and status other than `draft`.

> **Note:** Nested sections (characters, locations, etc.) are currently bundled in `GET /story-bible`. Future CRUD endpoints for individual sections can be added; types are defined in `src/types/story-bible.types.ts`.

---

## Episode Planner (`/creator/projects/:projectId/episodes`)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/creator/projects/:projectId/episodes/summary` | Planner KPIs |
| `GET` | `/creator/projects/:projectId/episodes` | List episodes |
| `GET` | `/creator/projects/:projectId/episodes/:episodeId` | Episode + scenes |
| `POST` | `/creator/projects/:projectId/episodes/generate` | AI-generate episodes |
| `PATCH` | `/creator/projects/:projectId/episodes/:episodeId` | Update episode |
| `POST` | `/creator/projects/:projectId/episodes/:episodeId/cliffhanger/generate` | AI cliffhanger |
| `POST` | `/creator/projects/:projectId/episodes/:episodeId/scenes` | Create scene |
| `PATCH` | `/creator/projects/:projectId/episodes/:episodeId/scenes/reorder` | Reorder scenes |
| `PATCH` | `/creator/projects/:projectId/episodes/:episodeId/scenes/:sceneId/video/select` | Set active scene video version |
| `POST` | `/creator/projects/:projectId/episodes/:episodeId/assemble` | FFmpeg concat scene videos → episode MP4 |
| `GET` | `/creator/projects/:projectId/episodes/:episodeId/assembled-video` | Stream assembled episode MP4 (Bearer auth) |

See [EPISODE_ASSEMBLY.md](./EPISODE_ASSEMBLY.md) for FFmpeg deployment, storage, and troubleshooting.

**`Episode`** (planner list/detail) includes optional `assembledVideoUrl`, `assembledAt` after assembly.

**`POST .../assemble` response `data`:** `{ episodeId, projectId, sceneCount, assembledVideoUrl, assembledAt, message }`

**`Scene`** includes `videos[]` (version history) and `videoUrl` (selected version).

**`EpisodePlannerSummary`:** `{ projectId, totalEpisodes, completedEpisodes, totalScenes, plannedScenes, totalRuntimeSec, targetRuntimeSec, overallProgress }`

**`POST .../generate` body**

```json
{
  "count": 5,
  "targetRuntimeSec": 60,
  "useStoryBible": true
}
```

**`PATCH .../:episodeId` body**

```json
{
  "title": "string",
  "synopsis": "string",
  "cliffhanger": "string",
  "targetRuntimeSec": 60
}
```

**`POST .../cliffhanger/generate` body:** `{ "tone": "string?" }`  
**Response `data`:** `{ "text": "string", "tone": "string" }`

**`POST .../scenes` body**

```json
{
  "title": "string",
  "description": "string",
  "location": "string?",
  "characters": "comma-separated names",
  "durationSec": 30
}
```

**`PATCH .../scenes/reorder` body:** `{ "sceneIds": ["id1", "id2"] }`

---

## AI Settings (`/creator/ai/settings`)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/creator/ai/settings` | User AI model preferences + catalog |
| `PUT` | `/creator/ai/settings` | Update enabled models, auto/manual mode, fallbacks |

**`PUT` body:** `{ selectionMode: 'auto'|'manual', enabledModels: string[], manualSelections: {}, fallbackEnabled: boolean }`

Only **enabled** models with configured API keys are used for generation. Auto mode picks the best enabled model per task category; fallback tries the next enabled model on credit/rate-limit errors.

---

## AI Generation (`/creator/projects/:projectId/ai`)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/creator/projects/:projectId/ai/director` | AI director dashboard |
| `GET` | `/creator/projects/:projectId/ai/agents/:agentId` | Single agent detail |
| `POST` | `/creator/projects/:projectId/ai/agents/run` | Run one agent (optionally scoped to scene(s)) |
| `POST` | `/creator/projects/:projectId/ai/agents/run-batch` | Queue agent for multiple scenes |
| `GET` | `/creator/projects/:projectId/ai/scene-preview` | Scene context preview for agents |
| `POST` | `/creator/projects/:projectId/ai/pipeline/run` | Run full pipeline |
| `GET` | `/creator/projects/:projectId/ai/prompts/templates` | Prompt templates |
| `POST` | `/creator/projects/:projectId/ai/prompts/build` | Build prompt |
| `GET` | `/creator/projects/:projectId/ai/cost` | Cost estimate |
| `GET` | `/creator/projects/:projectId/ai/logs` | Agent logs |

**`POST .../agents/run` body**

```json
{
  "agentId": "string",
  "prompt": "string?",
  "episodeId": "string?",
  "sceneId": "string?",
  "sceneIds": ["string"]?,
  "runAllScenes": "boolean?",
  "modelId": "string?"
}
```

**`POST .../agents/run-batch` body:** `{ agentId, sceneIds[], prompt?, episodeId? }`

**`GET .../scene-preview?episodeId=`** — returns `ScenePreview` with assembled `contextPreview` per scene.

**Response `data` (`RunAgentResult`):** `{ agentId, jobId, status, message, sceneId?, modelId?, videoUrl?, outputPreview?, jobs? }`

Video agent (`agentId: video`) calls **Grok Imagine** when `XAI_API_KEY` is set: async `POST /v1/videos/generations` → poll until `done` → saves `videoUrl` on the scene.

**`POST .../prompts/build` body**

```json
{
  "agentId": "string",
  "basePrompt": "string",
  "style": "string",
  "constraints": "string"
}
```

**Response `data`:** `{ agentId, prompt }`

**`GET .../director` response:** `AiDirectorOverview` — agents list, pipeline status, recent jobs (see `src/types/ai-generation.types.ts`).

---

## Rendering (`/creator/projects/:projectId/rendering`)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/creator/projects/:projectId/rendering/overview` | Progress dashboard |
| `GET` | `/creator/projects/:projectId/rendering/queue` | Active render queue |
| `GET` | `/creator/projects/:projectId/rendering/retry-queue` | Failed/retry queue |
| `GET` | `/creator/projects/:projectId/rendering/workers` | Worker nodes |
| `GET` | `/creator/projects/:projectId/rendering/gpu` | GPU status |
| `GET` | `/creator/projects/:projectId/rendering/ffmpeg` | FFmpeg job details |
| `GET` | `/creator/projects/:projectId/rendering/history` | Completed jobs |
| `GET` | `/creator/projects/:projectId/rendering/monitoring` | Queue metrics |
| `POST` | `/creator/projects/:projectId/rendering/retry` | Retry failed job |
| `POST` | `/creator/projects/:projectId/rendering/cancel` | Cancel job |
| `GET` | `/creator/projects/:projectId/rendering/jobs/:jobId` | Single job detail |

**`POST .../retry` body:** `{ "jobId": "string" }`  
**`POST .../cancel` body:** `{ "jobId": "string" }`  
**Response `data` (`JobActionResult`):** `{ jobId, status, message }`

**`RenderJob`:** `{ id, projectId, episodeId?, title, status, progress, priority, workerId?, startedAt?, completedAt?, errorMessage? }`  
See `src/types/rendering.types.ts` for `RenderingOverview`, `RenderWorker`, `GpuNode`, `FfmpegJobDetail`, `QueueMetrics`.

---

## Publishing (`/creator/projects/:projectId/publishing`)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/creator/projects/:projectId/publishing/overview` | Publish wizard overview |
| `GET` | `/creator/projects/:projectId/publishing/settings` | Publish settings |
| `PUT` | `/creator/projects/:projectId/publishing/settings` | Update settings |
| `GET` | `/creator/projects/:projectId/publishing/schedule` | Release schedule |
| `POST` | `/creator/projects/:projectId/publishing/schedule` | Schedule release |
| `GET` | `/creator/projects/:projectId/publishing/hls` | HLS packages |
| `GET` | `/creator/publishing/categories` | Global category list |
| `GET` | `/creator/projects/:projectId/publishing/notifications/preview` | Push notification preview |
| `POST` | `/creator/projects/:projectId/publishing/publish` | Publish project/episodes |

**`PUT .../settings` body:** partial `PublishSettings` — visibility, tags, categories, monetization, etc.

**`POST .../schedule` body**

```json
{
  "episodeId": "string",
  "scheduledAt": "ISO-8601",
  "timezone": "Africa/Lagos"
}
```

**`POST .../publish` body:** `{ "episodeIds": ["string"]? }`  
**Response `data`:** `{ status, message, publishedAt? }`

**`CategoryOption`:** `{ id, label, description }`

---

## Analytics (`/creator/projects/:projectId/analytics`)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/creator/projects/:projectId/analytics/overview` | Dashboard overview |
| `GET` | `/creator/projects/:projectId/analytics/revenue` | Revenue metrics |
| `GET` | `/creator/projects/:projectId/analytics/earnings` | Creator earnings |
| `GET` | `/creator/projects/:projectId/analytics/watch-time` | Watch time |
| `GET` | `/creator/projects/:projectId/analytics/completion` | Completion rates |
| `GET` | `/creator/projects/:projectId/analytics/ai-cost` | AI spend |
| `GET` | `/creator/projects/:projectId/analytics/render-cost` | Render spend |
| `GET` | `/creator/projects/:projectId/analytics/growth` | User growth |
| `GET` | `/creator/projects/:projectId/analytics/retention` | Retention curves |
| `GET` | `/creator/projects/:projectId/analytics/cohorts` | Cohort analysis |
| `POST` | `/creator/projects/:projectId/analytics/export` | Export report |

**`POST .../export` body**

```json
{
  "format": "csv | json | pdf",
  "sections": ["dashboard", "revenue", "..."],
  "dateFrom": "ISO-8601",
  "dateTo": "ISO-8601"
}
```

**Response `data`:** `{ reportId, downloadUrl, expiresAt }`

See `src/types/analytics.types.ts` for metric shapes (`AnalyticsOverview`, `RevenueMetrics`, `WatchTimeMetrics`, etc.).

---

## Admin Portal (`/admin`)

All routes require `role: admin`.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/overview` | Platform overview |
| `GET` | `/admin/users` | User list |
| `PUT` | `/admin/users/status` | Update user status |
| `GET` | `/admin/creators` | Creator list |
| `PUT` | `/admin/creators/status` | Update creator status |
| `GET` | `/admin/moderation` | Moderation queue |
| `POST` | `/admin/moderation/action` | Approve/reject item |
| `GET` | `/admin/ai-usage` | AI usage metrics |
| `GET` | `/admin/subscriptions` | Subscription metrics |
| `GET` | `/admin/rewarded-ads` | Rewarded ads metrics |
| `GET` | `/admin/coins` | Coin economy metrics |
| `GET` | `/admin/reports` | Platform reports |
| `GET` | `/admin/audit-logs` | Audit log entries |
| `GET` | `/admin/feature-flags` | Feature flags |
| `PUT` | `/admin/feature-flags` | Toggle feature flag |
| `GET` | `/admin/system-health` | Service health |

**`PUT /admin/users/status` body:** `{ userId, status }`  
**`PUT /admin/creators/status` body:** `{ creatorId, status }`  
**`POST /admin/moderation/action` body:** `{ itemId, action: "approve" | "reject" }`  
**`PUT /admin/feature-flags` body:** `{ flagId, enabled: boolean }`  
**Action response `data`:** `{ success: boolean, message: string }`

See `src/types/admin-portal.types.ts` for full entity shapes.

---

## Endpoint summary

| Module | Count |
|--------|------:|
| Authentication | 11 |
| Creator studio | 16 |
| Story bible | 6 |
| Episode planner | 8 |
| AI generation | 8 |
| Rendering | 11 |
| Publishing | 9 |
| Analytics | 11 |
| Admin | 16 |
| **Total** | **96** |

---

## Implementation notes

### Priority order (suggested)

1. **Auth** — login, session, refresh, register, onboarding  
2. **Creator projects** — CRUD projects, series, seasons  
3. **Episode planner** — episodes, scenes  
4. **Story bible** — read/write bible document  
5. **AI generation & rendering** — job queue integration  
6. **Publishing & analytics** — read-heavy dashboards  
7. **Admin portal** — admin-only operations  

### Frontend type references

| Domain | TypeScript types |
|--------|------------------|
| Auth | `src/types/auth.types.ts` |
| Creator | `src/types/creator.types.ts` |
| Story bible | `src/types/story-bible.types.ts` |
| Episodes | `src/types/episode-planner.types.ts` |
| AI | `src/types/ai-generation.types.ts` |
| Rendering | `src/types/rendering.types.ts` |
| Publishing | `src/types/publishing.types.ts` |
| Analytics | `src/types/analytics.types.ts` |
| Admin | `src/types/admin-portal.types.ts` |
| API envelope | `src/types/api.types.ts` |

### API keys & cost projections

See **[API_KEYS_AND_COSTS.md](./API_KEYS_AND_COSTS.md)** for required environment variables, Grok Imagine vs Veo video pricing, and per-episode cost estimates.

### Mock data for seeding / testing

Backend seed templates live in `backend/src/seed-data/`. The frontend no longer uses mock fallbacks — all feature services call the NestJS API.

### CORS

Allow the Vite dev origin (`http://localhost:5173`) and your production frontend domain.

### Health check (recommended)

Not used by the frontend today, but useful for Docker/K8s:

```http
GET /health
→ 200 { "status": "ok" }
```

---

## Changelog

| Date | Notes |
|------|-------|
| 2026-07-27 | Initial spec generated from frontend services |
