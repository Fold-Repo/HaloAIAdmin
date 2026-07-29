# Agent Instructions

Read `docs/ARCHITECTURE.md` before adding or modifying features. For episode video assembly and FFmpeg deployment, see `docs/EPISODE_ASSEMBLY.md`.

## Required for every feature change

- TypeScript strict mode — no `any`, no unused imports
- Feature slice layout: `data → service → hooks → components → pages`
- Shared state UI: `LoadingScreen`, `EmptyState`, `QueryError`
- `combineQueryState()` for pages with multiple TanStack queries
- Responsive Tailwind layouts and accessible markup
- Unit tests for services/utils; integration tests for critical flows

## Commands

```bash
npm run dev          # local dev server
npm run build        # type-check + production build
npm run test:run     # unit + integration
npm run test:e2e     # Playwright
npm run lint         # ESLint
```

## Do not

- Commit secrets (`.env`, tokens)
- Import feature internals across module boundaries
- Skip loading/empty/error states on data pages
- Add unrelated refactors to focused tasks
