# Manual Video Upload — Batch Implementation Flow

Follow this document **one batch at a time**. Do not start the next batch until the current batch’s **Done when** checklist passes.

Parent plan: [MANUAL_VIDEO_UPLOAD_PLAN.md](./MANUAL_VIDEO_UPLOAD_PLAN.md)

---

## How to use

1. Pick the next unfinished batch (start at **Batch 0**).
2. Implement only that batch’s scope (backend + frontend listed).
3. Verify **Done when** + **Manual test**.
4. Mark the batch checkbox complete, then move on.

```text
Batch 0  Defaults & locks
   ↓
Batch 1  Schema + seed episodes (standalone create)
   ↓
Batch 2  Episode video upload API
   ↓
Batch 3  Wizard: AI vs Manual + standalone create UI
   ↓
Batch 4  Manual upload workspace (single project)
   ↓
Batch 5  Project detail polish (CTAs, badges, hide AI)
   ↓
Batch 6  Add episode slots (growth)
   ↓
Batch 7  Multi-series catalog create (API + wizard)
   ↓
Batch 8  Multi-series upload hub + growth UX
   ↓
Batch 9  Docs, config, end-to-end QA
```

**Rule:** Batches 1–5 = vertical slice (standalone project works end-to-end). Batches 6–8 = expand. Batch 9 = harden.

### UX rule for every frontend batch

Build a **progressive accordion wizard** on one route:

- Finish step → **next step opens automatically**
- Completed steps collapse to a summary (click **Edit** to go back)
- Choice cards auto-advance when the choice is complete
- Manual path: after create, **morph into upload** in the same shell (no mid-flow page hop)
- Motion: expand/collapse in place — do not slide the whole form away

See parent plan §4.0. Pattern already started in `NewProjectWizard`.

---

## Batch 0 — Lock defaults (no code)

**Goal:** Remove ambiguity before coding.

| Question                      | Default for v1 (use unless you change it)              |
| ----------------------------- | ------------------------------------------------------ |
| Max upload size               | `500MB` via `MANUAL_VIDEO_MAX_BYTES`                   |
| Formats                       | **MP4 only** (`video/mp4`)                             |
| After multi-series create     | Land on **catalog upload hub**                         |
| Episode titles in upload list | Editable (inline)                                      |
| Season.episodeCount on add    | Update when episodes added under that season’s project |

**Done when**

- [ ] Team agrees with the defaults above (or edits this table)
- [ ] No open blockers for Batch 1

---

## Batch 1 — Schema + standalone manual create (backend)

**Goal:** Persist `creationMode` and create empty episode stubs when creating a manual project.

### Scope

| Area                           | Work                                                                                                                        |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| Prisma                         | `ProjectCreationMode` enum; `Project.creationMode` (default `ai_generated`); optional `Episode.sourceType`                  |
| Migration                      | Apply migration                                                                                                             |
| `CreateProjectDto`             | Accept `creationMode`; when `manual_upload`, use `episodeCount` to seed stubs                                               |
| `CreatorService.createProject` | If manual: create N episode rows (no scenes); seed module data with `skipAutoCompose: true`; do not change AI path behavior |
| Mapper / responses             | Return `creationMode` on project payloads                                                                                   |

### Out of scope this batch

- File upload
- Multi-series catalog endpoint
- Frontend changes

### Done when

- [ ] `POST /api/creator/projects` with `creationMode: "manual_upload"` and `episodeCount: 3` creates project + 3 episodes with null `assembledVideoUrl`
- [ ] AI create (omit mode or `ai_generated`) behaves as before (no auto episode stubs unless that already existed)
- [ ] Project JSON includes `creationMode`

### Manual test

```bash
# login → create manual project → GET project episodes → expect N drafts
```

---

## Batch 2 — Episode video upload API (backend)

**Goal:** Upload/replace an MP4 onto an episode; stream via existing assembled-video route.

### Scope

| Area           | Work                                                                                                                                                                                                |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Config         | `MANUAL_VIDEO_MAX_BYTES` in env example                                                                                                                                                             |
| Endpoint       | `POST /creator/projects/:projectId/episodes/:episodeId/video` (multipart `file`)                                                                                                                    |
| Service        | Validate MIME + size; write `storage/assembled/{projectId}/{episodeId}.mp4`; set `assembledVideoUrl`, `assembledAt`, `sourceType: manual_upload`; update episode status; recompute project progress |
| Guards         | Ownership checks; clear 400 on bad type/size                                                                                                                                                        |
| Assemble guard | AI assemble returns clear error if manual episode has no scenes (optional soft guard)                                                                                                               |
| Keep           | Existing `GET .../assembled-video`                                                                                                                                                                  |

### Out of scope this batch

- DELETE video endpoint (optional later)
- Frontend upload UI
- Add-episode-slots endpoint

### Done when

- [ ] Upload MP4 → episode has `assembledVideoUrl`
- [ ] Re-upload overwrites file and updates `assembledAt`
- [ ] `GET .../assembled-video` streams the file
- [ ] Non-MP4 / oversized → 400 with clear message

### Manual test

```bash
curl -H "Authorization: Bearer $TOKEN" \
  -F "file=@sample.mp4" \
  "$API/creator/projects/$PID/episodes/$EID/video"
```

---

## Batch 3 — Wizard: mode choice + standalone manual create (frontend)

**Goal:** User can choose Manual and create a standalone project with N episode slots; stay in the progressive wizard and auto-advance into an upload phase (stub OK).

### Scope

| Area               | Work                                                                                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Types / schemas    | `creationMode` on wizard + API types                                                                                                                                      |
| `NewProjectWizard` | Extend progressive accordion: Step 0 AI vs Manual **choice cards → auto-advance**; Manual → **Single project** only (defer multi-series to Batch 7)                       |
| Manual single path | Details → Continue auto-opens next; episode count; series cards (standalone auto-advances); review                                                                        |
| Create mutation    | Send `creationMode: manual_upload`; **do not** send user to Story Composer                                                                                                |
| After create       | Same shell advances to **Upload phase** (stub list OK). Prefer in-flow phase over hard navigate; if route change is needed, keep wizard chrome / return focus immediately |
| AI path            | Still composer after create (existing)                                                                                                                                    |

### Out of scope this batch

- Real upload UI (Batch 4)
- Multi-series wizard branch
- Project card badges

### Done when

- [ ] Wizard shows AI vs Manual first; selecting a mode opens the next step automatically
- [ ] Completing each manual step auto-opens the next panel (user does not hunt for another page)
- [ ] Manual standalone create hits API and lands in upload phase/stub
- [ ] AI path still opens composer
- [ ] Completed steps remain visible as summaries with Edit

### Manual test

Walk AI vs Manual choices; create one manual project with 2 episodes without leaving the flow mid-setup; confirm episodes exist via API.

---

## Batch 4 — Manual upload workspace (frontend)

**Goal:** Per-episode upload with progress for a single project, preferably as the next auto-opened phase of the same wizard shell (or a focused page that feels continuous).

### Scope

| Area          | Work                                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------------------- |
| Phase / route | Upload phase after create on same shell, or `/studio/projects/:projectId/manual-upload` with seamless handoff |
| Service       | `uploadEpisodeVideo(..., onProgress)` via `FormData`                                                          |
| UI            | Episode list: number, title, Missing/Ready badge, file picker / drop, progress, retry                         |
| Player        | Optional: simple video preview when Ready                                                                     |
| Continuity    | After last Missing episode becomes Ready, show clear “Done / View project” — do not leave the user stranded   |

### Out of scope this batch

- Add episodes button (Batch 6)
- Multi-series hub (Batch 8)
- Title inline edit (nice-to-have; can slip here if quick)

### Done when

- [ ] User reaches upload without losing the creation flow context
- [ ] User uploads video for episode 1 → badge Ready
- [ ] Progress bar updates during upload
- [ ] Failed upload shows error + retry
- [ ] Replace works on an already-Ready episode

### Manual test

Create manual project (Batch 3) → upload 2 MP4s without hunting menus → refresh → still Ready.

---

## Batch 5 — Project detail polish (frontend)

**Goal:** Manual projects feel first-class and don’t push users into AI composer.

### Scope

| Area                | Work                                                                                      |
| ------------------- | ----------------------------------------------------------------------------------------- |
| Project card / list | Badge: Manual vs AI                                                                       |
| Project detail      | Primary CTA “Upload videos” for manual; avoid auto-compose prompts                        |
| Gating              | Soft-hide or disable Story Composer / scene AI entry for `creationMode === manual_upload` |
| Episode detail      | Show player + “Replace video” → upload page or inline replace                             |

### Done when

- [ ] Manual project never auto-starts composer
- [ ] Clear path to upload workspace from list/detail
- [ ] AI projects unchanged

### Manual test

Open an old AI project and a new manual project; confirm CTAs differ.

---

## Batch 6 — Add episode slots (growth)

**Goal:** Increase episode count later without recreating the project.

### Scope

| Area     | Work                                                                                                                                     |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Backend  | `POST /creator/projects/:projectId/episodes/add` `{ count }` — append stubs, bump `episodeCount` (and season count if locked in Batch 0) |
| Frontend | “Add episodes” on upload page + refresh list                                                                                             |
| Reuse    | Same stub helper as Batch 1                                                                                                              |

### Done when

- [ ] Add 2 episodes to a 3-episode project → 5 rows, new ones Missing
- [ ] Upload works on new slots

### Manual test

Add slots → upload into a new slot → Ready.

---

## Batch 7 — Multi-series catalog create

**Goal:** Wizard can create N series, each with episode count; backend creates structure in one call.

### Scope

| Area     | Work                                                                                                               |
| -------- | ------------------------------------------------------------------------------------------------------------------ |
| Backend  | `POST /api/creator/manual/catalog` — transactional create Series → Season 1 → Project (`manual_upload`) → episodes |
| Frontend | Wizard branch: structure **Multiple series** → “How many series?” → per-series fields → review → call catalog API  |
| Navigate | Catalog hub route (stub OK until Batch 8), e.g. `/studio/manual-upload/catalog` with created ids in state/query    |

### Out of scope this batch

- Full multi-project upload UI (Batch 8)

### Done when

- [ ] Catalog API with 2 series (3 + 5 episodes) creates correct rows
- [ ] Wizard multi-series path works and does not break single-project path

### Manual test

Create 2 series via wizard; verify in Series list + each project’s episode counts.

---

## Batch 8 — Multi-series upload hub + growth UX

**Goal:** Upload across all series created in a catalog; grow series/projects later.

### Scope

| Area     | Work                                                                                                                 |
| -------- | -------------------------------------------------------------------------------------------------------------------- |
| Frontend | Catalog hub: accordion/tabs per series → project → episode upload (reuse Batch 4 row component)                      |
| Growth   | From Series page / wizard: add another manual project under existing series; deep-link to that project’s upload page |
| Copy     | UI says “series”; backend still Season 1                                                                             |

### Done when

- [ ] After multi-series create, user can upload into every series’ episodes from the hub
- [ ] User can add a new series later and upload there
- [ ] User can add a manual project under an existing series

### Manual test

Catalog create → upload one episode per series → add third series later → upload.

---

## Batch 9 — Docs, config, QA

**Goal:** Spec and acceptance criteria from the parent plan are complete.

### Scope

| Area       | Work                                                        |
| ---------- | ----------------------------------------------------------- |
| Docs       | Update `API_SPEC.md`, note in `EPISODE_ASSEMBLY.md`         |
| Config     | `.env.example` documents `MANUAL_VIDEO_MAX_BYTES`           |
| QA         | Walk parent plan §10 acceptance checklist                   |
| Regression | AI wizard + composer + assemble still work on an AI project |

### Done when

- [ ] All acceptance criteria in parent plan §10 checked
- [ ] Docs match implemented endpoints
- [ ] No known AI-path regressions

---

## Progress tracker

| Batch | Name                   | Status |
| ----- | ---------------------- | ------ |
| 0     | Lock defaults          | [x]    |
| 1     | Schema + seed episodes | [x]    |
| 2     | Upload API             | [x]    |
| 3     | Wizard standalone      | [x]    |
| 4     | Upload workspace       | [x]    |
| 5     | Project detail polish  | [x]    |
| 6     | Add episode slots      | [ ]    |
| 7     | Multi-series catalog   | [ ]    |
| 8     | Catalog hub + growth   | [ ]    |
| 9     | Docs + QA              | [ ]    |

---

## Agent / implementer notes

When implementing in Cursor (or another agent), prompt with:

> Implement **only Batch N** from `aiCreatorAdmin/docs/MANUAL_VIDEO_UPLOAD_BATCHES.md`. Do not start Batch N+1. Follow Done when + Manual test.

Stop after each batch for review before continuing.
