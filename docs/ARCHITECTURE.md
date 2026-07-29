# Architecture & Development Conventions

This document defines how features are structured and the rules every new module must follow.

## Layered feature slices

Each feature lives under `src/features/<module>/` and follows clean architecture boundaries:

```text
features/<module>/
├── data/           # Mock data for dev fallback
├── schemas/        # Zod validation schemas
├── services/       # HTTP API layer (Axios)
├── hooks/          # TanStack Query + mutations
├── components/     # Presentational and container UI
├── pages/          # Route entry points
├── utils/          # Pure helpers
└── index.ts        # Public barrel exports
```

**Dependency direction:** `pages → hooks → services → api`. Types live in `src/types/`. Shared UI lives in `src/components/`.

## TypeScript

- `strict: true` in `tsconfig.app.json`
- No unused locals/parameters
- Prefer explicit types on public APIs; infer locally where obvious

## Shared UI patterns

| State | Component | Usage |
|-------|-----------|-------|
| Loading | `LoadingScreen`, `PageSkeleton`, `Spinner` | Full-page or section loading |
| Empty | `EmptyState` | Lists/grids with no data |
| Error | `QueryError` | Failed TanStack Query fetches |
| Crash | `ErrorBoundary`, `FeatureErrorBoundary` | Uncaught render errors |

Use `combineQueryState()` from `@/utils/query-state` when a page coordinates multiple queries.

## API services

- One `*.service.ts` per feature module
- Use `withDevFallback()` pattern when mock data exists for offline dev
- Auth service: `src/features/authentication/services/auth.service.ts`

## Hooks

- Query hooks wrap services with TanStack Query
- Mutation hooks invalidate related query keys on success
- Pages should not call services directly

## Page requirements

Every data-driven page must handle:

1. **Loading** — `LoadingScreen` or skeleton
2. **Error** — `QueryError` with retry via `refetch()`
3. **Empty** — `EmptyState` when data arrays are empty
4. **Responsive** — mobile-first Tailwind (`sm:`, `md:`, `lg:`)
5. **Accessibility** — labels, roles, keyboard support

## Feature isolation

- Export only through `features/<module>/index.ts`
- Cross-feature imports are allowed for shared domain context (e.g. `useProject` from creator)
- Do not import another feature's internal components directly

## Testing

| Layer | Tool | Location |
|-------|------|----------|
| Unit | Vitest | `src/tests/unit/` |
| Integration | Vitest + RTL | `src/tests/integration/` |
| E2E | Playwright | `src/tests/e2e/` |
| Accessibility | axe-core | `src/tests/e2e/accessibility.spec.ts` |

## Adding a new feature module

1. Create types in `src/types/<module>.types.ts`
2. Add mock data, service, schemas, hooks, components, page
3. Register lazy route in `src/routes/index.tsx`
4. Export public API from `features/<module>/index.ts`
5. Add unit tests in `src/tests/unit/<module>.test.ts`
6. Handle loading, empty, and error states with shared components

## Infrastructure

| Path | Purpose |
|------|---------|
| `src/api/` | Axios client, interceptors, token refresh |
| `src/store/` | Zustand global state (auth) |
| `src/layouts/` | App shells with error boundaries |
| `src/routes/` | React Router config |
| `src/monitoring/` | Error reporting, web vitals |
| `k8s/` | Kubernetes manifests |
| `.github/workflows/` | CI and release pipelines |
| `backend/storage/assembled/` | Episode MP4s after FFmpeg assembly (gitignored; persist in prod) |

Episode video assembly requires **FFmpeg on the backend host** (not the browser). See [EPISODE_ASSEMBLY.md](./EPISODE_ASSEMBLY.md).
