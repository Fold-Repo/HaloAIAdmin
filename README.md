# AI Creator Studio

Enterprise-grade frontend for the AI Creator Studio platform — from story prompt to published vertical episodes.

Built with React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand, and TanStack Query.

---

## Quick start

```bash
npm install
cp .env.example .env
npm run dev
# → http://localhost:5173
```

Requires **Node.js ≥ 20** (see `.nvmrc`).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check and production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |
| `npm run test` | Run Vitest in watch mode |
| `npm run test:run` | Run unit + integration tests |
| `npm run test:integration` | Run integration tests only |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:e2e` | Run Playwright E2E + accessibility tests |
| `npm run test:all` | Run Vitest and Playwright |

## Project structure

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for feature-slice conventions. Backend implementation: [docs/BACKEND_PLAN.md](docs/BACKEND_PLAN.md) and [docs/API_SPEC.md](docs/API_SPEC.md).

```text
backend/              # NestJS API (deploy independently or with frontend)
docs/
├── API_SPEC.md       # 96-endpoint contract
├── BACKEND_PLAN.md   # Phased backend roadmap
└── ARCHITECTURE.md
src/                  # React frontend
```
src/
├── app/              # App shell
├── api/              # Axios client
├── components/       # Shared UI (ErrorBoundary, SkipToContent, shadcn)
├── features/         # Feature modules (auth, creator, story-bible, …)
├── layouts/          # MainLayout, CreatorLayout, AuthLayout
├── monitoring/       # Error reporting and web vitals
├── routes/           # Lazy-loaded React Router config
├── tests/
│   ├── unit/         # Vitest unit tests
│   ├── integration/  # Vitest integration tests
│   └── e2e/          # Playwright E2E + axe accessibility
k8s/                  # Kubernetes manifests
.github/workflows/    # CI and release pipelines
```

## Production readiness

| Area | Implementation |
|------|----------------|
| Unit tests | Vitest across all feature modules |
| Integration tests | Auth, providers, error boundaries |
| E2E tests | Playwright with API mocking for studio flows |
| Accessibility | Skip link, ARIA roles, axe WCAG scans in CI |
| Performance | Route lazy loading, manual chunk splitting (charts, editor) |
| Error boundaries | Global + layout-level with monitoring hooks |
| Monitoring | `monitoringService`, web vitals (LCP, CLS, TTFB) |
| Docker | Multi-stage build with nginx + healthcheck |
| Kubernetes | Deployment, Service, Ingress, HPA |
| CI/CD | Lint, test, coverage, E2E, Docker, k8s dry-run |
| Release | Tag-triggered workflow (`v*`) with GitHub Release |

# Demo login (development only)

| Role | Email | Password |
|------|-------|----------|
| Creator | `demo@creator.studio` | `Demo123!` |
| Admin | `admin@demo.com` | `Demo123!` |

These accounts work without a backend when running `npm run dev`. Use the **Use creator** / **Use admin** buttons on the login page to autofill credentials.

## Environment variables

See `.env.example`:

```env
VITE_APP_NAME=AI Creator Studio
VITE_API_BASE_URL=http://localhost:3000/api
VITE_AUTH_TOKEN_KEY=ai_creator_auth_token
```

## Docker

```bash
docker build -t ai-creator-admin .
docker run -p 8080:80 ai-creator-admin

# Or use compose
docker compose up --build
```

## Kubernetes

```bash
kubectl apply -f k8s/deployment.yaml
```

Update the image reference and `VITE_API_BASE_URL` ConfigMap before deploying.

## Testing

```bash
npm run test:run          # unit + integration
npm run test:coverage     # with coverage report
npm run test:e2e          # Playwright (starts dev server)
```

## CI/CD

**CI** (`.github/workflows/ci.yml`) on push/PR to `main` and `develop`:

1. Lint and format check
2. Unit + integration tests with coverage
3. Production build
4. Playwright E2E and accessibility scans
5. Docker image build + compose validation
6. Kubernetes manifest dry-run

**Release** (`.github/workflows/release.yml`) on version tags `v*`:

1. Full test + build pipeline
2. Docker image build
3. GitHub Release with deployment artifacts

## Feature modules

| Module | Route pattern |
|--------|---------------|
| Authentication | `/login`, `/register`, … |
| Creator Studio | `/dashboard`, `/studio/projects` |
| Story Bible | `/studio/projects/:id/story-bible/:section` |
| Episode Planner | `/studio/projects/:id/episodes` |
| AI Generation | `/studio/projects/:id/ai/:section` |
| Rendering | `/studio/projects/:id/rendering/:section` |
| Publishing | `/studio/projects/:id/publishing/:section` |
| Analytics | `/studio/projects/:id/analytics/:section` |
| Admin Portal | `/admin/:section` |

Dev mode uses mock API fallbacks when the backend is unavailable.

## Backend API

```bash
cd backend
cp .env.example .env
docker compose up -d postgres redis
npm install && npx prisma migrate dev --name init && npm run db:seed
npm run dev
# → http://localhost:3000/api
```

Deploy full stack (frontend + API + Postgres + Redis):

```bash
docker compose --profile full up --build
```

## Tech stack

| Category | Tools |
|----------|-------|
| Core | React 19, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui, Radix UI |
| State | Zustand, TanStack Query |
| Testing | Vitest, React Testing Library, Playwright, axe |
| Quality | ESLint, Prettier, Husky, GitHub Actions |
| Deploy | Docker, nginx, Kubernetes |
