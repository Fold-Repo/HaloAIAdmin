# Manual Video Upload — Development Plan

Plan to add a **manual / ready-video** creation path beside the existing AI Story Composer flow, for both **frontend** (`aiCreatorAdmin`) and **backend** (`backend`).

**Implement in batches (do not build all at once):** [MANUAL_VIDEO_UPLOAD_BATCHES.md](./MANUAL_VIDEO_UPLOAD_BATCHES.md)

Related docs: [ARCHITECTURE.md](./ARCHITECTURE.md), [API_SPEC.md](./API_SPEC.md), [BACKEND_PLAN.md](./BACKEND_PLAN.md), [EPISODE_ASSEMBLY.md](./EPISODE_ASSEMBLY.md).

---

## 1. Goal

Creators can:

1. Start a **new project** the same way as today (wizard).
2. Choose **AI generation** (current flow) **or** **upload ready videos**.
3. If uploading:
   - **Standalone project** → declare episode count → upload one video per episode.
   - **Series** → declare how many series (and episodes per series) → create structure → upload videos into each episode slot.
4. Later grow **series**, **projects**, and **episode counts** the same way the existing system already grows structure (add season/project/episode, then fill content).

Videos land on `Episode.assembledVideoUrl`. When Cloudinary is configured, that value is the Cloudinary CDN URL for **episode-ready** MP4s (manual upload and AI-assembled). Scene-level Grok clips are not uploaded to Cloudinary.

---

## 2. Current system (baseline)

| Concept   | Role today                                          |
| --------- | --------------------------------------------------- |
| `Series`  | Optional catalog container                          |
| `Season`  | Nested under series                                 |
| `Project` | Production unit (story + episodes)                  |
| `Episode` | Lives on **project**; optional `assembledVideoUrl`  |
| Wizard    | Story → Series assignment → Review → Story Composer |

Today there is **no user video upload**. Assembled MP4s are written by FFmpeg to `storage/assembled/{projectId}/{episodeId}.mp4`.

**Entity mapping for this feature** (do not invent a parallel hierarchy):

```text
User mental model          →  Existing entities
─────────────────────────     ─────────────────────────────
Standalone project         →  Project (no series) + Episodes
Series with N series       →  N × Series (+ Season 1) + Project each + Episodes
Episodes under a project   →  Episode rows on that Project
Grow later                 →  Existing series/season/project/episode APIs
```

> “How many series” in the wizard means creating **N Series**, each with a default Season + one Project that holds that series’ episode slots. Episode count is stored on the Project (`episodeCount` + real `Episode` rows), consistent with today.

---

## 3. Product decisions

| Decision           | Choice                                                                               |
| ------------------ | ------------------------------------------------------------------------------------ |
| Creation entry     | Extend `NewProjectWizard` (do not fork a separate “upload app”)                      |
| Mode split         | Early wizard step: **AI flow** vs **Manual upload**                                  |
| Manual video grain | **One full episode video** per upload (not per-scene)                                |
| Storage field      | Set `Episode.assembledVideoUrl` (+ `assembledAt`) like assembly does                 |
| Scenes             | Manual episodes start with **no scenes** (skip AI/scene pipeline)                    |
| Status             | Episode → `ready` (or `complete`) once video uploaded; Project progress recalculated |
| Growth             | Add series / seasons / projects / empty episode slots later; upload into empty slots |
| Replace video      | Allow re-upload on an episode (overwrite file + update URL/timestamp)                |
| Auth               | Same JWT + `creator`/`admin` roles                                                   |

### Out of scope (v1)

- Scene-level manual clips / re-assembly from uploaded scenes
- Transcoding to HLS (keep progressive MP4 for now; HLS stays Phase 7)
- Public anonymous upload
- Bulk zip import (optional later)
- Editing video in-browser

---

## 4. UX flow

### 4.0 Interaction principles (required)

Keep the creator **in one continuous flow**. Do not bounce them across pages mid-setup.

| Principle         | Behavior                                                                                                                                                         |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Progressive steps | Vertical accordion on one route: current step expands; completed steps collapse to a summary (“Edit” to reopen)                                                  |
| Auto-advance      | Finishing a step **opens the next step automatically** (no separate “leave this page” hop)                                                                       |
| Choice steps      | Discrete choices (AI vs Manual, structure type, standalone series) are **cards** — selecting a complete choice advances immediately                              |
| Form steps        | Multi-field steps use **Continue** after validation, then auto-open the next panel                                                                               |
| Post-create       | Manual path: **same page morphs** into the upload workspace (or same-shell phase). Do not dump the user on an empty project detail and make them hunt for upload |
| Context           | Completed step summaries stay visible above so the user never loses where they are                                                                               |
| Motion            | Expand/collapse in place (height/opacity). Avoid full-card horizontal slide that feels like navigation                                                           |

Reference implementation pattern: current `NewProjectWizard` progressive accordion.

### 4.1 Shared entry

```text
New project  (single page shell)
    │
    ▼
[Step] Creation mode  (choice cards → auto-advance)
    ├─ AI generation  → Story → Series → Review → create → Composer
    └─ Manual upload  → structure steps below → create → Upload phase (same shell)
```

### 4.2 Manual — standalone project

```text
Same page, auto-advancing panels:
[1] Project details → Continue → next opens
[2] Episode count → Continue → next opens
[3] Series assignment (cards; standalone auto-advances)
[4] Review → Create
    Backend: Project + N placeholder Episodes
[5] Upload workspace (in-flow phase — same route/shell)
    Episode rows → drag/drop; stay here until done
```

### 4.3 Manual — multi-series create

When the user chooses **series structure** (not a single standalone project):

```text
Same page, auto-advancing panels:
[1] “How many series?” → Continue → next opens
[2] Per series (accordion: series 1..N)
    title, genre, description, episode count
    finishing series i auto-opens series i+1; last → Review
[3] Review → Create
    For each series i:
      Series → Season 1 → Project → Ei Episodes
[4] Upload hub (same shell)
    Series accordion → episode upload rows
```

### 4.4 Grow later (parity with existing system)

| Action                   | UI / API reuse                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| Add another series       | Existing Series page + new manual project under it, or “Add series” on catalog                   |
| Add season               | Existing Seasons APIs/UI                                                                         |
| Add project under series | New project wizard with mode=manual + existing series                                            |
| Add more episodes        | “Add episodes” on project (reuse generate-placeholder pattern) → empty slots appear in upload UI |
| Upload later             | Project detail → Manual uploads tab/page for episodes missing video                              |

Empty episode = `assembledVideoUrl == null`. Upload UI filters or badges: **Missing** / **Ready**.

---

## 5. Data model changes

### 5.1 Prisma

```prisma
enum ProjectCreationMode {
  ai_generated
  manual_upload
}

model Project {
  // ...existing fields...
  creationMode  ProjectCreationMode @default(ai_generated)
}

model Episode {
  // ...existing fields...
  // assembledVideoUrl / assembledAt already exist — reuse
  sourceType    EpisodeSourceType?  // optional: ai_assembled | manual_upload
}
```

Optional but useful:

```prisma
enum EpisodeSourceType {
  ai_assembled
  manual_upload
}
```

No new “VideoAsset” table required for v1 if files stay on disk like assembled videos.

### 5.2 Module data

Seed `ProjectModuleData` for manual projects:

```json
{
  "module": "composer",
  "data": {
    "mode": "manual_upload",
    "targetEpisodeCount": N,
    "skipAutoCompose": true
  }
}
```

Skip Story Composer auto-run when `creationMode === manual_upload`.

### 5.3 File layout

Reuse assembled path convention so streaming endpoints stay shared:

```text
backend/storage/assembled/{projectId}/{episodeId}.mp4
```

`assembledVideoUrl` stays an API path, e.g.  
`/creator/projects/{projectId}/episodes/{episodeId}/assembled-video`

---

## 6. Backend plan

### Phase B1 — Schema & create APIs

1. Migration: `Project.creationMode`, optional `Episode.sourceType`.
2. Extend `CreateProjectDto`:
   - `creationMode: 'ai_generated' | 'manual_upload'`
   - When manual: `seedEpisodeCount` (create N episode stubs)
   - Keep existing series assignment fields
3. New DTO / endpoint for **bulk series+projects** (manual catalog create):

   `POST /api/creator/manual/catalog`

   ```ts
   {
     series: Array<{
       title: string;
       description?: string;
       genre?: string;
       seasonTitle?: string;
       episodeCount: number;
       targetFormat?: string;
       episodeLength?: number;
     }>;
   }
   ```

   Response: created series/projects/episodes summary for the upload UI.

4. Episode stub helper (shared with “add episodes later”):

   - Create episodes `number` 1..N, title `Episode {n}`, empty synopsis, `status: draft`, no scenes.
   - Update `Project.episodeCount`.

### Phase B2 — Upload & serve

1. Enable multipart upload (Nest `FileInterceptor` / `AnyFilesInterceptor`).
2. Endpoints:

   | Method   | Path                                                     | Purpose                             |
   | -------- | -------------------------------------------------------- | ----------------------------------- |
   | `POST`   | `/creator/projects/:projectId/episodes/:episodeId/video` | Upload/replace episode MP4          |
   | `GET`    | `/creator/.../assembled-video`                           | Already exists — keep               |
   | `DELETE` | `/creator/projects/:projectId/episodes/:episodeId/video` | Clear file + null URL (optional v1) |
   | `POST`   | `/creator/projects/:projectId/episodes/add`              | Add K empty episode slots (growth)  |

3. Upload service responsibilities:
   - Validate MIME (`video/mp4`, optionally `video/webm`, `video/quicktime`)
   - Max size (config, e.g. 500MB–2GB via env `MANUAL_VIDEO_MAX_BYTES`)
   - Write to `storage/assembled/{projectId}/{episodeId}.mp4` (overwrite on replace)
   - Set `assembledVideoUrl`, `assembledAt`, `sourceType: manual_upload`
   - Set episode `status` → ready/complete; recompute project `progress` / `status`
4. Ownership checks: same as other creator project routes.
5. Do **not** require scenes for manual episodes; guard AI assemble so it no-ops or 400s with clear message if `sourceType === manual_upload` and no scenes.

### Phase B3 — Growth APIs

Reuse / thin wrappers:

- Existing `POST /creator/series`, `POST .../seasons`
- `POST /creator/projects` with `creationMode: manual_upload` + `seriesId`
- `POST .../episodes/add` for extra slots
- List episodes already available via project episodes API

### Phase B4 — Docs & config

- Document endpoints in `API_SPEC.md`
- Env: `MANUAL_VIDEO_MAX_BYTES`, optional allowed MIME list
- Note in `EPISODE_ASSEMBLY.md`: manual path writes same storage contract

---

## 7. Frontend plan

### Phase F1 — Wizard mode branch

**Files (expected):**

- `NewProjectWizard.tsx` / `NewProjectPage.tsx`
- `creator.schemas.ts` — extend zod schema with `creationMode`, series catalog fields
- `useCreateProject` + new `useCreateManualCatalog`

**Steps when `creationMode === manual_upload`:**

1. Mode choice (AI vs Manual)
2. Structure choice: **Single project** vs **Multiple series**
3. Details + counts (as in §4)
4. Review → create
5. Navigate to **Manual Upload workspace** (not Story Composer)

When AI: keep current 3 steps + composer redirect.

### Phase F2 — Upload workspace

New page, e.g. `ManualUploadPage` at  
`/studio/projects/:projectId/manual-upload`  
(and optionally `/studio/manual-upload?catalog=...` after multi-series create).

UI requirements:

- Episode table/list: number, title (editable later), status badge, file name, progress bar
- Per-row upload + drag-and-drop
- Disable submit while uploading; show retry on failure
- “Add episodes” control → calls add-slots API → appends rows
- Link back to project detail

For multi-series create response: landing page with series accordion, each linking into its project upload list.

### Phase F3 — Project detail integration

- Badge on project card: **Manual** vs **AI**
- If manual: primary CTA “Upload videos” instead of “Compose story”
- Hide or soft-disable Story Composer / scene AI for `creationMode === manual_upload` (or show read-only empty state)
- Episode detail: show player from `assembledVideoUrl` + “Replace video”

### Phase F4 — Growth UX

- Series pages unchanged for CRUD; when creating a project under a series, wizard remembers `creationMode`
- “Add episodes” on upload page and episode list
- Adding a new series later: Series page → New manual project under that series

### Phase F5 — Types & services

- Extend `creator.types.ts` with `creationMode`, upload DTOs
- `creator.service.ts` / episode service: `uploadEpisodeVideo(projectId, episodeId, file, onProgress)`
- Use `FormData` + axios upload progress events

---

## 8. API sketch (summary)

```http
POST   /api/creator/projects
  body: { ..., creationMode, episodeCount, series assignment }

POST   /api/creator/manual/catalog
  body: { series: [{ title, genre, episodeCount, ... }] }

POST   /api/creator/projects/:projectId/episodes/add
  body: { count: number }

POST   /api/creator/projects/:projectId/episodes/:episodeId/video
  multipart: file
  → { episodeId, assembledVideoUrl, assembledAt, status }

GET    /api/creator/projects/:projectId/episodes/:episodeId/assembled-video
  (existing stream)

DELETE /api/creator/projects/:projectId/episodes/:episodeId/video
  (optional)
```

---

## 9. Implementation order

Use the batch flow (authoritative): [MANUAL_VIDEO_UPLOAD_BATCHES.md](./MANUAL_VIDEO_UPLOAD_BATCHES.md).

| Batches | Outcome                                                                 |
| ------- | ----------------------------------------------------------------------- |
| 0       | Lock defaults                                                           |
| 1–5     | Vertical slice: standalone manual project → upload → stream + UI polish |
| 6–8     | Growth + multi-series catalog/hub                                       |
| 9       | Docs + full QA                                                          |

Do not implement Batches 6–8 until 1–5 pass.

---

## 10. Acceptance criteria

- [ ] Wizard asks AI vs Manual before structure details
- [ ] Standalone manual project creates N empty episodes
- [ ] Multi-series manual create creates N series, each with project + requested episode count
- [ ] Upload sets `assembledVideoUrl` and video is playable via existing assembled-video route
- [ ] Re-upload replaces previous file
- [ ] User can add more episodes later and upload into new slots
- [ ] User can add another series/project later and upload there
- [ ] AI composer does not auto-start for manual projects
- [ ] Invalid file type / oversize returns clear API errors
- [ ] Existing AI projects remain unchanged

---

## 11. Risks & mitigations

| Risk                           | Mitigation                                                                        |
| ------------------------------ | --------------------------------------------------------------------------------- |
| Large uploads timeout / memory | Stream to disk; raise proxy body limits (nginx/Nest); optional later direct-to-S3 |
| Disk fill on server            | Max size + monitor `storage/`; plan S3/R2 move (already in BACKEND_PLAN Phase 7)  |
| Confusion with scene pipeline  | `creationMode` gates UI; assemble endpoint rejects manual-without-scenes          |
| Multi-series vs Season wording | UI copy: “series”; backend still creates Season 1 under each Series               |
| Partial catalog failure        | Transaction per series or all-or-nothing with Prisma `$transaction`               |

---

## 12. Open questions (resolve before build)

1. **Max file size** and allowed formats for v1?
2. After multi-series create, land on a **catalog upload hub** or first project’s upload page?
3. Should manual episode **titles** be editable in the upload list before/after upload?
4. Is **WebM/MOV** allowed, or MP4-only for mobile compatibility?
5. When adding episodes later under a series-linked project, should Season.`episodeCount` be updated too (today it is loosely maintained)?

---

## 13. Success definition

Creators can publish ready-made episode videos through the same Project → Episode → `assembledVideoUrl` pipeline the AI path already ends on, without running Story Composer, scene generation, or FFmpeg assembly — and they can expand series/projects/episodes over time using the same structural APIs as the current studio.
