# API Keys & Cost Projections

Environment variables and estimated spend for the **AI Creator Studio** pipeline. Provider keys belong in **`backend/.env` only** — never in the frontend or git.

**Related:** [API_SPEC.md](./API_SPEC.md) · [ARCHITECTURE.md](./ARCHITECTURE.md) · [EPISODE_ASSEMBLY.md](./EPISODE_ASSEMBLY.md)

---

## Selected models (current stack)

These are the agents configured in `backend/src/seed-data/module-defaults.ts` and shown in the AI Director UI:

| Agent         | Model (UI) | Provider          | Purpose                                   |
| ------------- | ---------- | ----------------- | ----------------------------------------- |
| Story Planner | GPT-5      | OpenAI            | Arc planning from story bible             |
| Script        | Claude     | Anthropic         | Screenplay drafts                         |
| Character     | FLUX       | Black Forest Labs | Character reference sheets                |
| **Video**     | **Veo**    | **Google**        | Vertical scene video (currently selected) |
| Voice         | ElevenLabs | ElevenLabs        | Dialogue synthesis                        |
| Subtitle      | Whisper    | OpenAI            | Transcription / captions                  |
| Music         | AudioGen   | Internal / TBD    | Background score & SFX                    |

---

## Required environment variables

### Frontend (`.env` at repo root)

| Variable                      | Required | Example                     | Notes                                                           |
| ----------------------------- | -------- | --------------------------- | --------------------------------------------------------------- |
| `VITE_API_BASE_URL`           | Yes      | `http://localhost:3000/api` | NestJS API base URL                                             |
| `VITE_API_TIMEOUT`            | No       | `30000`                     | Default request timeout (ms)                                    |
| `VITE_API_AI_TIMEOUT`         | No       | `180000`                    | Timeout for story compose / script agent calls (ms)             |
| `VITE_API_VIDEO_TIMEOUT`      | No       | `600000`                    | Timeout for Grok video generation (ms); backend may poll ~5 min |
| `VITE_API_ASSEMBLE_TIMEOUT`   | No       | `600000`                    | Timeout for episode assembly (download + FFmpeg)                |
| `VITE_AUTH_TOKEN_KEY`         | No       | `ai_creator_auth_token`     | localStorage key                                                |
| `VITE_AUTH_REFRESH_TOKEN_KEY` | No       | `ai_creator_refresh_token`  | localStorage key                                                |

No AI provider keys in the frontend. All generation runs server-side.

### Backend — core (`backend/.env`)

| Variable                 | Required    | Example                    | Notes                                                  |
| ------------------------ | ----------- | -------------------------- | ------------------------------------------------------ |
| `DATABASE_URL`           | Yes         | `postgresql://...`         | Aiven or local Postgres (quoted if URL contains `&`)   |
| `PGSSLROOTCERT`          | If Aiven    | `certs/ca.pem`             | SSL CA for managed Postgres                            |
| `JWT_ACCESS_SECRET`      | Yes         | 32+ char secret            | Access token signing                                   |
| `JWT_REFRESH_SECRET`     | Yes         | 32+ char secret            | Refresh token signing                                  |
| `JWT_ACCESS_EXPIRES_IN`  | No          | `15m`                      | Access token TTL                                       |
| `JWT_REFRESH_EXPIRES_IN` | No          | `7d`                       | Refresh token TTL                                      |
| `CORS_ORIGIN`            | No          | `http://localhost:5173`    | Vite dev origin                                        |
| `REDIS_URL`              | Recommended | `redis://localhost:6379`   | Job queue / caching                                    |
| `FFMPEG_PATH`            | No          | `/opt/homebrew/bin/ffmpeg` | Episode assembly; auto-detects Homebrew paths if unset |

### Backend — AI providers (when wiring real generation)

| Variable                | Provider                       | Get a key                                                                          |
| ----------------------- | ------------------------------ | ---------------------------------------------------------------------------------- |
| `OPENAI_API_KEY`        | OpenAI (GPT-5, Whisper)        | [platform.openai.com/api-keys](https://platform.openai.com/api-keys)               |
| `ANTHROPIC_API_KEY`     | Anthropic (Claude)             | [console.anthropic.com](https://console.anthropic.com/)                            |
| `BFL_API_KEY`           | Black Forest Labs (FLUX)       | [api.bfl.ai](https://api.bfl.ai/)                                                  |
| `GOOGLE_GEMINI_API_KEY` | Google (Veo video)             | [aistudio.google.com/apikey](https://aistudio.google.com/apikey)                   |
| `XAI_API_KEY`           | xAI (Grok Imagine video/image) | [console.x.ai](https://console.x.ai/)                                              |
| `ELEVENLABS_API_KEY`    | ElevenLabs (voice)             | [elevenlabs.io/app/settings/api-keys](https://elevenlabs.io/app/settings/api-keys) |

### Backend — optional (production)

| Variable                                                                 | Purpose                                                        |
| ------------------------------------------------------------------------ | -------------------------------------------------------------- |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Episode-ready video storage (manual upload + AI-assembled MP4) |
| `CLOUDINARY_FOLDER`                                                      | Optional folder prefix (default `ai-creator/episodes`)         |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_S3_BUCKET`          | Alternate rendered asset storage (future)                      |
| `STRIPE_SECRET_KEY`                                                      | Subscriptions / coin economy                                   |
| `SENDGRID_API_KEY` or `RESEND_API_KEY`                                   | OTP / password reset email                                     |
| `SENTRY_DSN`                                                             | Error monitoring                                               |

Copy `backend/.env.example` → `backend/.env` and fill in real values. **Do not** run `cp .env.example .env` after configuring Aiven — placeholders break Prisma (`P1013`).

---

## Grok Imagine — does it have an API?

**Yes.** xAI exposes Grok Imagine via the [Imagine API](https://docs.x.ai/developers/model-capabilities/imagine):

- **Image generation** — flat per-image pricing
- **Video generation** — **per-second** billing (async: submit → poll → download URL)
- **Image-to-video** — animate a still frame with a text prompt
- Models: `grok-imagine-video`, `grok-imagine-video-1.5`, `grok-imagine-image`, etc.

Official pricing (verify before production): [x.ai/developers/pricing](https://docs.x.ai/developers/pricing)

| Model                        | Unit                 | Price (USD) |
| ---------------------------- | -------------------- | ----------- |
| `grok-imagine-video`         | per second of output | **$0.05**   |
| `grok-imagine-video-1.5`     | per second of output | **$0.08**   |
| `grok-imagine-image`         | per image            | $0.02       |
| `grok-imagine-image-quality` | per image            | $0.05       |

Video input (when used): ~$0.01/sec · Image input: ~$0.002/image (per third-party summaries of xAI docs; recheck official page).

---

## Video generation pricing comparison

Assumptions for this product: **vertical short drama**, **720p**, **~60 s per episode**, **3 scenes** (~20 s each if generated separately).

### Per-second rates (official API tiers, July 2026)

| Provider | Model / tier                          | 720p (with audio where noted) | 8 s clip  | 60 s episode |
| -------- | ------------------------------------- | ----------------------------- | --------- | ------------ |
| **xAI**  | Grok Imagine `grok-imagine-video`     | **$0.05/s**                   | **$0.40** | **$3.00**    |
| **xAI**  | Grok Imagine `grok-imagine-video-1.5` | **$0.08/s**                   | **$0.64** | **$4.80**    |
| Google   | Veo 3.1 **Lite** (with audio)         | $0.05/s                       | $0.40     | $3.00        |
| Google   | Veo 3.1 **Fast** (with audio)         | $0.10/s                       | $0.80     | $6.00        |
| Google   | Veo 3.1 **Standard** (with audio)     | $0.40/s                       | $3.20     | **$24.00**   |
| Google   | Veo 3.1 Standard **4K**               | $0.60/s                       | $4.80     | $36.00       |

Sources: [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing), [xAI pricing](https://docs.x.ai/developers/pricing). Third-party blogs may cite 720p Grok at $0.07/s — **always confirm on the official model page before budgeting.**

### Side-by-side (60 s episode, video only)

```
Grok Imagine (standard)     $3.00   ████
Veo 3.1 Lite                $3.00   ████
Grok Imagine 1.5            $4.80   ██████
Veo 3.1 Fast                $6.00   ████████
Veo 3.1 Standard (current) $24.00   ████████████████████████████████
```

**Takeaway:** For budget vertical shorts, **Grok Imagine standard ($0.05/s) matches Veo Lite** and is **~8× cheaper than Veo Standard**, which is what the UI currently labels as “Veo”. Grok 1.5 adds quality at $0.08/s — still ~5× cheaper than Veo Standard.

### Feature trade-offs

|                    | Grok Imagine                                         | Veo 3.1                          |
| ------------------ | ---------------------------------------------------- | -------------------------------- |
| API                | Yes — REST, async video jobs                         | Yes — Gemini API                 |
| Audio in clip      | Check current model docs                             | Included (Lite/Fast/Standard)    |
| Max duration       | Up to ~15 s per request (typical); stitch for longer | Configurable; 8 s common default |
| Vertical 9:16      | Supported                                            | Supported (since Veo 3 update)   |
| Reference-to-video | `grok-imagine-video` only (not 1.5)                  | Image-to-video supported         |
| Best for           | Cost-sensitive vertical drama at scale               | Highest polish + native audio    |

For **60 s episodes**, both stacks usually require **multiple segments** (e.g. 4× 15 s or 8× 8 s), so multiply segment count × per-second rate.

---

## Full pipeline cost projection

Estimates for **one 60-second vertical episode** (Midnight Alley–style: 3 scenes, 4 characters, ~800 characters dialogue). Token/image assumptions are conservative; actual spend varies with bible size and retries.

### Non-video agents (per episode)

| Step                    | Model                 | Assumption             | Est. cost (USD)     |
| ----------------------- | --------------------- | ---------------------- | ------------------- |
| Story Planner           | GPT-5.5 / GPT-5.6 Sol | 20K in + 3K out tokens | $0.19               |
| Script                  | Claude Sonnet 4.6     | 25K in + 5K out tokens | $0.15               |
| Character refs          | FLUX.1 Kontext [pro]  | 6 images × $0.04       | $0.24               |
| Voice                   | ElevenLabs Flash v2.5 | ~800 characters        | $0.04               |
| Subtitles               | Whisper               | 1 minute audio         | $0.01               |
| Music                   | AudioGen / Suno (TBD) | 1 track                | $0.50 (placeholder) |
| **Subtotal (no video)** |                       |                        | **~$1.13**          |

Reference rates: OpenAI [$5/$30 per 1M tokens](https://developers.openai.com/api/docs/pricing), Anthropic Claude Sonnet [$3/$15 per 1M](https://docs.anthropic.com/en/docs/about-claude/pricing), BFL [~$0.04/image](https://docs.bfl.ml/quick_start/pricing), ElevenLabs [~$50 per 1M characters (Flash)](https://elevenlabs.io/pricing/api).

### Total per episode (including video)

| Video provider                  | Video (60 s) | Non-video | **Total / episode** |
| ------------------------------- | ------------ | --------- | ------------------- |
| **Grok Imagine** (standard)     | $3.00        | $1.13     | **~$4.13**          |
| **Grok Imagine 1.5**            | $4.80        | $1.13     | **~$5.93**          |
| Veo 3.1 Lite                    | $3.00        | $1.13     | **~$4.13**          |
| Veo 3.1 Fast                    | $6.00        | $1.13     | **~$7.13**          |
| **Veo 3.1 Standard (selected)** | $24.00       | $1.13     | **~$25.13**         |

### Project-level projections

Default seed project **Midnight Alley**: 3 episodes × 60 s.

| Scenario               | Episodes | Video model  | Est. total  |
| ---------------------- | -------- | ------------ | ----------- |
| Seed series (3 ep)     | 3        | Grok Imagine | **~$12**    |
| Seed series (3 ep)     | 3        | Veo Standard | **~$75**    |
| Active creator / month | 10       | Grok Imagine | **~$41**    |
| Active creator / month | 10       | Veo Standard | **~$251**   |
| Studio scale / month   | 100      | Grok Imagine | **~$413**   |
| Studio scale / month   | 100      | Veo Standard | **~$2,513** |

Add **~15–25% buffer** for retries, failed renders, and prompt iteration.

### Switching video model in the app

1. Set `XAI_API_KEY` in `backend/.env`
2. Open **Studio → AI Settings** and enable **Grok Imagine Video**
3. Run the **Video** agent from a scene (Episode detail or AI Generation → Video)

Grok Imagine is wired live: submit → poll → save `videoUrl` on the scene. URLs are temporary — download promptly or **assemble episode** to persist a combined MP4 on the server (see [EPISODE_ASSEMBLY.md](./EPISODE_ASSEMBLY.md)).

For Veo, keep `GOOGLE_GEMINI_API_KEY` and enable Veo Lite in AI Settings (API integration pending).

---

## Cost controls (recommended)

1. **Cap video tier** — Default to Grok Imagine or Veo Lite for drafts; Veo Standard only on final export.
2. **Segment length** — Generate 8–15 s clips per scene; avoid single 60 s requests where unsupported.
3. **Cache story bible context** — Use provider prompt caching (OpenAI ~90% input discount, Anthropic cache reads ~10% of input).
4. **Batch API** — OpenAI Batch API (~50% off) for non-interactive script/planning jobs.
5. **Per-project budget** — Surface `GET /creator/projects/:id/ai/cost` in UI before running full pipeline.
6. **Admin alerts** — Track `aiSpendUsd` in `/admin/ai-usage` against monthly caps.

---

## Changelog

| Date       | Notes                                                                                                    |
| ---------- | -------------------------------------------------------------------------------------------------------- |
| 2026-07-28 | Episode assembly doc link; `FFMPEG_PATH` env var                                                         |
| 2026-07-28 | Initial doc: env vars, Grok Imagine API confirmation, Veo vs Grok video pricing, per-episode projections |
