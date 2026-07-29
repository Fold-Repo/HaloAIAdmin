# Backend Implementation Plan

Step-by-step plan to implement the API defined in [API_SPEC.md](./API_SPEC.md).

The backend lives in **`backend/`** as a standalone NestJS service. It can run alone, with Docker Compose, or together with the frontend via the root `docker-compose.yml` profile `full`.

---

## Architecture

```text
┌─────────────────┐     HTTP/JSON      ┌──────────────────────────────┐
│  React frontend │ ─────────────────► │  NestJS API  (port 3000)     │
│  (port 5173)    │   /api/*           │  backend/                    │
└─────────────────┘                    └──────────────┬───────────────┘
                                                      │
                        ┌─────────────────────────────┼─────────────────────────────┐
                        ▼                             ▼                             ▼
                 ┌─────────────┐              ┌─────────────┐              ┌─────────────┐
                 │ PostgreSQL  │              │    Redis    │              │  Workers*   │
                 │  (Prisma)   │              │   (BullMQ)  │              │  (future)   │
                 └─────────────┘              └─────────────┘              └─────────────┘
```

\* AI generation, FFmpeg rendering, and HLS packaging run in async workers (Phase 7), not in the API process.

### Stack

| Layer | Choice |
|-------|--------|
| Runtime | Node.js ≥ 20 |
| Framework | NestJS 11 + TypeScript |
| ORM | Prisma + PostgreSQL |
| Auth | JWT access + refresh tokens, bcrypt passwords |
| Queues | BullMQ + Redis (Phase 4+) |
| Validation | class-validator + class-transformer |
| Docs | Swagger at `/api/docs` (optional) |

### API contract rules

1. Global prefix: `/api`
2. Success envelope: `{ success: true, data, message? }`
3. Error envelope: `{ message, code?, status?, errors? }`
4. Protected routes: `Authorization: Bearer <accessToken>`
5. Role guard: `creator`, `viewer`, `admin` (see API_SPEC)

---

## Repository layout

```text
backend/
├── README.md                 # Run, test, deploy
├── package.json
├── Dockerfile
├── docker-compose.yml        # Standalone: api + postgres + redis
├── prisma/schema.prisma
└── src/
    ├── main.ts
    ├── app.module.ts
    ├── common/               # Envelope, filters, guards, decorators
    ├── config/
    └── modules/
        ├── health/
        ├── auth/             # Phase 1
        ├── creator/          # Phase 2
        ├── story-bible/      # Phase 3
        ├── episodes/         # Phase 3
        ├── ai/               # Phase 4
        ├── rendering/        # Phase 4
        ├── publishing/       # Phase 5
        ├── analytics/        # Phase 5
        └── admin/            # Phase 6
```

Frontend type reference (keep DTOs aligned):

```text
../src/types/*.types.ts
../src/features/*/data/mock-*.data.ts   ← seed data
docs/API_SPEC.md                        ← endpoint contract
```

---

## Phased delivery

### Phase 0 — Foundation (Week 1)

**Goal:** Bootable API with health check, DB, Docker, response envelope.

| Task | Details |
|------|---------|
| NestJS bootstrap | `backend/` app, CORS for `localhost:5173`, global prefix `/api` |
| Response interceptor | Wrap all success responses in `{ success, data }` |
| Exception filter | Map errors to frontend `ApiError` shape |
| Config module | `.env`: `DATABASE_URL`, `JWT_SECRET`, `PORT`, `CORS_ORIGIN` |
| Prisma + PostgreSQL | Initial schema: `User`, `RefreshToken` |
| Health | `GET /api/health` |
| Docker | `backend/docker-compose.yml`, `backend/Dockerfile` |
| Root compose profile | `docker compose --profile full up` |

**Exit criteria:** `curl http://localhost:3000/api/health` returns 200; frontend can reach API without CORS errors.

---

### Phase 1 — Authentication (Week 1–2)

**Spec:** [API_SPEC § Authentication](./API_SPEC.md#authentication-auth)

| Endpoint group | Priority |
|----------------|----------|
| `POST /auth/login` | P0 |
| `GET /auth/session` | P0 |
| `POST /auth/refresh` | P0 |
| `POST /auth/logout` | P0 |
| `POST /auth/register` | P1 |
| `PATCH /auth/onboarding` | P1 |
| OTP + password reset | P2 |
| OAuth redirect | P3 |

**Tasks:**

1. Prisma models: `User`, `RefreshToken`, optional `OtpCode`
2. Password hashing (bcrypt)
3. JWT strategy + `@Public()` decorator for open routes
4. Seed demo users matching frontend (`demo@creator.studio`, `admin@demo.com`)
5. Disable frontend demo-auth fallback when `VITE_API_BASE_URL` points to real API

**Exit criteria:** Login from frontend works end-to-end; session restore on refresh works.

---

### Phase 2 — Creator studio core (Week 2–3)

**Spec:** [API_SPEC § Creator](./API_SPEC.md#creator-studio-creator)

| Domain | Endpoints | Prisma models |
|--------|-----------|---------------|
| Dashboard | `GET /creator/dashboard/stats` | aggregates |
| Projects | CRUD `/creator/projects` | `Project` |
| Series | CRUD `/creator/series` | `Series` |
| Seasons | CRUD nested under series | `Season` |
| Jobs | `GET /creator/jobs` | `Job` (stub) |
| Notifications | list + mark read | `Notification` |

**Tasks:**

1. Creator-scoped queries (`userId` / ownership)
2. Seed from `mock-creator.data.ts`
3. Project creation wizard payload validation
4. Pagination prep (optional query params for future)

**Exit criteria:** Projects page, dashboard, series/seasons pages load from API.

---

### Phase 3 — Story bible & episodes (Week 3–4)

**Spec:** [Story bible](./API_SPEC.md#story-bible) + [Episode planner](./API_SPEC.md#episode-planner)

| Module | Models |
|--------|--------|
| Story bible | `StoryBible`, nested JSON or normalized tables for characters, locations, etc. |
| Versions | `StoryDocumentVersion` |
| Episodes | `Episode`, `Scene` |

**Tasks:**

1. `GET /story-bible` returns full document tree
2. PATCH endpoints for overview, ending, document
3. Episode generate (sync stub → queue in Phase 4)
4. Scene create + reorder

**Exit criteria:** Story bible and episode planner pages fully API-driven.

---

### Phase 4 — AI & rendering (Week 4–6)

**Spec:** [AI generation](./API_SPEC.md#ai-generation) + [Rendering](./API_SPEC.md#rendering)

| Concern | Approach |
|---------|----------|
| Agent runs | Enqueue BullMQ job; return `{ jobId, status: 'queued' }` |
| Pipeline | Multi-step job chain |
| Render queue | `RenderJob` model + worker status polling |
| GPU/workers | Read from worker registry (mock → real agents) |

**Tasks:**

1. Redis + BullMQ setup
2. Job status transitions: `queued → running → completed | failed`
3. `POST /rendering/retry`, `POST /rendering/cancel`
4. Webhook or polling for progress updates (optional SSE later)

**Exit criteria:** AI director and rendering pages show real job states from DB/queue.

---

### Phase 5 — Publishing & analytics (Week 6–7)

**Spec:** [Publishing](./API_SPEC.md#publishing) + [Analytics](./API_SPEC.md#analytics)

| Module | Notes |
|--------|-------|
| Publishing | Settings, schedule, HLS metadata, categories catalog |
| Analytics | Pre-aggregated tables or materialized views; export generates signed URL |

**Tasks:**

1. `PublishSettings` per project
2. Scheduled release cron job
3. Analytics read models (daily rollups)
4. Export job → object storage URL

**Exit criteria:** Publishing wizard and analytics dashboards use live data.

---

### Phase 6 — Admin portal (Week 7–8)

**Spec:** [Admin portal](./API_SPEC.md#admin-portal-admin)

| Feature | Guard |
|---------|-------|
| User/creator management | `@Roles('admin')` |
| Moderation queue | audit log on action |
| Feature flags | `FeatureFlag` table |
| System health | probe DB, Redis, queue depth |

**Exit criteria:** Admin routes reject non-admin; admin UI fully functional.

---

### Phase 7 — Production hardening (Week 8+)

| Task | Details |
|------|---------|
| Worker services | Separate containers for AI + FFmpeg |
| OAuth | Google/GitHub/Apple passport strategies |
| Email | OTP + forgot password via SendGrid/SES |
| Object storage | S3/GCS for thumbnails, HLS, exports |
| Observability | OpenTelemetry, structured logs |
| CI | GitHub Actions: lint, test, migrate, build image |
| K8s | `backend/k8s/` deployment manifest |

---

## Deployment modes

### 1. Backend only (local dev)

```bash
cd backend
cp .env.example .env
docker compose up -d postgres redis
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

API → `http://localhost:3000/api`

### 2. Frontend + backend (local dev)

Terminal A:

```bash
cd backend && npm run dev
```

Terminal B:

```bash
cp .env.example .env   # VITE_API_BASE_URL=http://localhost:3000/api
npm run dev
```

### 3. Backend standalone (Docker)

```bash
cd backend
docker compose up --build
```

### 4. Full stack (repo root)

```bash
docker compose --profile full up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:8080 |
| API | http://localhost:3000/api |
| Postgres | localhost:5432 |
| Redis | localhost:6379 |

### 5. Independent production deploy

- **Frontend:** existing Dockerfile + nginx → CDN/K8s
- **Backend:** `backend/Dockerfile` → separate K8s service / Cloud Run
- Set `VITE_API_BASE_URL` at frontend build time to production API URL
- Configure `CORS_ORIGIN` on API to production frontend origin

---

## Database schema (initial)

Start minimal; expand per phase.

```text
User
RefreshToken
Project ── Series ── Season
StoryBible / StoryDocumentVersion
Episode ── Scene
Job / RenderJob
Notification
PublishSettings / ReleaseSchedule
AnalyticsDailyRollup (Phase 5)
AuditLog / FeatureFlag (Phase 6)
```

See `backend/prisma/schema.prisma` for the Phase 0–1 starter.

---

## Testing strategy

| Layer | Tool |
|-------|------|
| Unit | Jest (NestJS default) |
| Integration | Supertest + test PostgreSQL |
| Contract | Compare responses to `src/types` shapes |
| E2E | Point frontend E2E at real API with test DB seed |

---

## Definition of done (full backend)

- [ ] All 96 endpoints in API_SPEC implemented or explicitly deferred
- [ ] Frontend runs without dev mock fallbacks
- [ ] Demo users seeded in DB
- [ ] Docker Compose `full` profile passes health checks
- [ ] Migration + seed documented in `backend/README.md`
- [ ] OpenAPI/Swagger optional but recommended

---

## Next action

Start **Phase 0 + Phase 1**:

```bash
cd backend
npm install
docker compose up -d postgres redis
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Then implement auth controllers method-by-method against [API_SPEC.md](./API_SPEC.md).
