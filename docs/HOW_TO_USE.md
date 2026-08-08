# How to use — in-app help & tutorial videos

Contextual **How to use** help for every major page in AI Creator Admin, plus a master script for recording / generating per-page tutorial videos.

## What shipped in the app

| Piece                 | Location                                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Guide registry        | [`src/features/how-to-use/content/how-to-use.content.ts`](../src/features/how-to-use/content/how-to-use.content.ts) |
| Modal trigger         | [`HowToUseButton`](../src/features/how-to-use/components/HowToUseButton.tsx)                                        |
| Studio chrome         | `CreatorTopBar` (every `/dashboard` + `/studio/*` page)                                                             |
| Public / admin chrome | `AppHeader`                                                                                                         |
| Auth screens          | `AuthLayout` (login, register, OTP, …)                                                                              |

The button opens a dialog for the **current route** (best matching guide). Links to the full Tutorial pages remain available.

### Adding or editing a page guide

1. Open `how-to-use.content.ts`.
2. Add or update a `HowToUseGuide`:
   - `match` — path pattern (`:projectId` style params supported)
   - `steps` — numbered help in the modal
   - `videoBeats` + `estimatedVideoSec` — for the video master script
3. Prefer more specific patterns over generic ones (specificity ranking is automatic).
4. Re-run the video script generator (below) so docs stay in sync.

### Fallback

Unknown URLs get a short generic guide pointing at Tutorial + the main workflow.

## Tutorial video master script

### Generate / refresh

```bash
cd aiCreatorAdmin
node docs/scripts/generate-how-to-video-script.mjs
```

Writes:

[`docs/generated/HOW_TO_USE_VIDEO_SCRIPT.md`](./generated/HOW_TO_USE_VIDEO_SCRIPT.md)

That file is the **master shot list + VO script** for every page clip (`howto-<id>.mp4`).

> Keep the inline `GUIDES` array in the `.mjs` script aligned with `how-to-use.content.ts` when you change copy (or later wire the script to import TS directly via `tsx`).

### Production checklist

- Demo login when UI is required: `demo@creator.studio` / `Demo123!`
- No API keys or PII in frame
- Show the **How to use** control once in the dashboard clip so viewers learn the affordance
- Export captions (SRT) per clip

### Suggested course order

1. Home → Login → Dashboard
2. New project → Project detail → Composer → Story Bible
3. Episodes → Episode detail → Video Agent → Publishing
4. Series → Notifications → AI Settings
5. Admin (ops track)

## Related docs

- [EPISODE_ASSEMBLY.md](./EPISODE_ASSEMBLY.md) — FFmpeg assemble flow
- [MANUAL_VIDEO_UPLOAD_PLAN.md](./MANUAL_VIDEO_UPLOAD_PLAN.md) — manual MP4 path
- In-app Tutorial: `/tutorial` and `/studio/tutorial`

## UX notes

- Help is **contextual** (modal), not a second full tutorial page per route.
- Full narrative onboarding stays on the existing Tutorial feature.
- Video Agent / Composer background jobs are called out in those guides so creators know buttons lock until the job finishes.
