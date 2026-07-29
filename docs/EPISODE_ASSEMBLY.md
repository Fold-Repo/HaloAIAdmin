# Episode Assembly (FFmpeg)

How scene videos are combined into a single episode MP4, where FFmpeg must be installed, and how to deploy assembly in production.

**Related:** [API_SPEC.md](./API_SPEC.md) · [API_KEYS_AND_COSTS.md](./API_KEYS_AND_COSTS.md) · [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## Who needs FFmpeg?

| Environment | FFmpeg required? | Why |
|-------------|------------------|-----|
| **Creator’s browser** | No | Assembly runs on the API server |
| **Frontend (Vite / CDN)** | No | Static React app only |
| **Backend API (local dev)** | **Yes** | `EpisodeAssemblyService` shells out to `ffmpeg` |
| **Backend API (production)** | **Yes** | Same — install in the server VM or Docker image |

FFmpeg is a **server-side dependency** of the NestJS backend, like Postgres or Node. End users never install it.

---

## What assembly does

1. Loads all scenes for an episode in **timeline order** (`Scene.order`).
2. Uses each scene’s **selected** video (`Scene.videoUrl`).
3. **Downloads** each clip (from Grok temporary URLs or any HTTP(S) URL).
4. Runs **FFmpeg concat** to produce one MP4.
5. Saves the file on the API host and records metadata on the episode.

```text
Scene 1 video ──┐
Scene 2 video ──┼──► FFmpeg concat ──► backend/storage/assembled/{projectId}/{episodeId}.mp4
Scene 3 video ──┘
```

**API**

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/creator/projects/:projectId/episodes/:episodeId/assemble` | Download scenes + concat |
| `GET` | `/creator/projects/:projectId/episodes/:episodeId/assembled-video` | Stream assembled MP4 (auth required) |

**UI**

- Episode detail → **Assemble episode from scenes**
- Rendering → Progress → **Episode assembly** (links to each episode)

**Episode fields after assembly:** `assembledVideoUrl`, `assembledAt`

---

## Local development

### macOS (Homebrew)

```bash
brew install ffmpeg
ffmpeg -version
```

The backend auto-checks, in order:

1. `FFMPEG_PATH` from `backend/.env`
2. `/opt/homebrew/bin/ffmpeg` (Apple Silicon)
3. `/usr/local/bin/ffmpeg` (Intel Mac)
4. `ffmpeg` on `PATH`

If the API was started from the IDE before Homebrew was installed, **restart the backend** after installing.

Optional explicit path in `backend/.env`:

```env
FFMPEG_PATH=/opt/homebrew/bin/ffmpeg
```

### Linux (Ubuntu / Debian)

```bash
sudo apt update && sudo apt install -y ffmpeg
ffmpeg -version
```

### Verify from the backend host

```bash
source ~/.nvm/nvm.sh && nvm use 20
cd backend
node -e "require('child_process').execFile('ffmpeg',['-version'],(e,o)=>console.log(e||o.split('\n')[0]))"
```

---

## Production deployment

### Docker (recommended)

The repo’s `backend/Dockerfile` installs FFmpeg in the runtime image (`apk add ffmpeg` on Alpine). Rebuild and deploy:

```bash
docker build -f backend/Dockerfile -t ai-creator-api ./backend
docker run --env-file backend/.env -p 3000:3000 ai-creator-api
```

**Persistent storage:** Mount a volume for assembled files so they survive container restarts:

```bash
docker run -v ai-creator-assembled:/app/storage/assembled ...
```

Without a volume, assembled MP4s are lost when the container is recreated (DB still has URLs, but files are gone).

### VM / bare metal (no Docker)

Install FFmpeg on the **same machine** that runs `node dist/main.js`:

```bash
# Ubuntu/Debian
sudo apt install -y ffmpeg

# Amazon Linux 2023
sudo dnf install -y ffmpeg
```

Set `FFMPEG_PATH` if the binary is not on the service user’s `PATH` (common with systemd):

```env
FFMPEG_PATH=/usr/bin/ffmpeg
```

### Kubernetes

1. Use an image that includes FFmpeg (build from `backend/Dockerfile`).
2. Mount a `PersistentVolumeClaim` at `/app/storage/assembled`.
3. Optional: set `FFMPEG_PATH` in the Deployment env if needed.

### Platform notes

| Platform | Guidance |
|----------|----------|
| **Railway / Render / Fly.io** | Use Docker deploy with `backend/Dockerfile`, or add FFmpeg via buildpack/Nixpacks config |
| **AWS ECS / EKS** | FFmpeg in container image + EFS/EBS for `storage/assembled` |
| **Serverless (Lambda)** | Not supported as-is — assembly needs long-running FFmpeg + disk; use a worker VM or container |
| **Vercel / Netlify (frontend only)** | No FFmpeg — only host the React app; API runs elsewhere |

---

## Storage & backups

| Asset | Location | Persist? |
|-------|----------|----------|
| Scene videos (Grok) | URL in DB only | Expires — download or assemble promptly |
| Assembled episode | `backend/storage/assembled/{projectId}/{episodeId}.mp4` | Yes, on server disk |
| Scene video history | `SceneVideo` table + URLs | URLs may expire |

**Production checklist**

1. Mount persistent disk (or S3 upload — future) for `storage/assembled/`.
2. Back up that directory with your normal server backups.
3. Use **Download episode MP4** in the UI for off-site copies.
4. Add `backend/storage/` to `.gitignore` (already done) — never commit MP4s.

Future improvement: upload assembled (and scene) files to **S3 / R2** and store permanent CDN URLs in the DB.

---

## Environment variables

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `FFMPEG_PATH` | No | `/opt/homebrew/bin/ffmpeg` | Override when `ffmpeg` is not on the process `PATH` |

Frontend timeout for assembly (client waits for the full download + concat):

| Variable | Default | Notes |
|----------|---------|-------|
| `VITE_API_ASSEMBLE_TIMEOUT` | `600000` (10 min) | Root `.env` / `.env.example` |

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `FFmpeg is not installed or not on PATH` | Install FFmpeg on the **API server**; set `FFMPEG_PATH`; restart backend |
| `Failed to download scene video (403/404)` | Grok URL expired — regenerate scene videos, then re-assemble |
| `Assembled episode video file is missing on disk` | DB has metadata but file deleted — re-run **Assemble episode** |
| Assembly works locally but not in prod | Prod image/VM missing FFmpeg or read-only filesystem without `storage/` write access |

---

## Prerequisites for assembly

- Every scene has a **selected** `videoUrl` (generate video + pick version if multiple).
- Scene URLs must still be **reachable** at assembly time (download happens on the server).
- FFmpeg available on the backend host.
- Writable `backend/storage/assembled/` directory.

---

## Changelog

| Date | Notes |
|------|-------|
| 2026-07-28 | Initial guide: FFmpeg local vs production, Docker, storage, API, troubleshooting |
