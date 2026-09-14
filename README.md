# Tavrex AI

A focused meeting intelligence workspace. Built for the assessment showcase:
meetings → playback and transcript → summaries → sourced actions → moments → sharing → search.

## Current status

**Checkpoints 0, A and B completed and verified. Live: https://tavrex-ai.pages.dev**
The playback/transcript showcase is implemented; later intelligence and sharing checkpoints remain.

Working features:
- Responsive, no-login library with one real reference recording and three original synthetic examples.
- Real video/audio playback, native seek/volume controls, five playback speeds.
- Timestamped speaker turns that seek the player, active-turn highlighting, optional follow-scroll.
- Loading, buffering, failure/retry, and empty-transcript states.
- Search titles, sample summaries, and participants; category filters and date sorting.
- Meeting overview routes, copy overview, missing-meeting recovery, keyboard-accessible help.
- Explicit synthetic data labels and no reference account information in fixtures.

Not implemented yet: AI generation/templates,
sourced actions, moments/sharing, transcript search, upload/transcription, and private storage.
No live bot, calendar connection, or authentication is represented as functional.

## Run locally

Requires Node 22.12+ (validated here using Node 24).

```sh
npm ci
npm run dev
```

Open http://localhost:5173. No environment variables or account required.

```sh
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium firefox
npm run test:e2e
```

Build output: `apps/web/dist`. Preview it with `npm run preview`.

## Architecture and stack

React + Vite + strict TypeScript, Tailwind CSS, custom CSS, Radix Dialog, Lucide,
Zod. Vitest and Playwright verify the critical reviewer entry path.

```text
Browser → Cloudflare Pages → React app → Public metadata
                                     → Recording JSON + sanitized WebM on meeting open
```

A narrow Pages Function serves byte ranges for the one public demo video.
The ingestion API, Supabase, and R2 remain later checkpoints. Details: [architecture](docs/architecture.md).

## Deploy to Cloudflare Pages

Authenticate locally with `npx wrangler login`, then:

```sh
npx wrangler pages project create tavrex-ai --production-branch mvp
npm run deploy
```

The deployment command builds first and uploads only `apps/web/dist`.
For a new project, Wrangler 4.131's default Pages delegation may fail to detect
the nested build directory. In that case use `--force` only on the project-create
command to select Pages directly; do not add it to deployment commands.
Cloudflare Pages supplies SPA route fallback when no top-level 404.html is present.
Verify `/`, `/app`, and `/app/meetings/recording-walkthrough` in a fresh browser context.

Alternatively connect this repository through Pages Git integration with build
command `npm run build` and output directory `apps/web/dist`.

Official deployment reference:
[Cloudflare React guide](https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/).

`.env.example` lists server-side deployment variable names only. Prefer Wrangler's
local login; never paste tokens into chat or put secrets in browser variables.

## Assessment decisions and privacy

- Upload-first capture is planned; conferencing bots are intentionally omitted.
- The first checkpoint establishes reviewer entry before media/AI infrastructure.
- The recorded demo uses a supplied real recording and imported reference transcript.
  It is not synthetic, but it is also not Tavrex-generated transcription. End-to-end
  ingestion remains an unmet later requirement. The other three examples are synthetic.
- Raw Fathom materials remain excluded from Git. A sanitized, permissioned video
  derivative and neutral-speaker transcript are included for the real playback demo.
  See [media provenance](docs/reference-research/recording-provenance.md).
- [Research notes](docs/reference-research/fathom-flow-notes.md) distinguish observed
  evidence, inference, and Tavrex decisions. Screenshots are not publicly republished.
- `.agent-logs/` is intentionally committed incrementally for assessment review.
  See [capture verification](CAPTURE-TEST.md). Historical entries remain untouched.
- No paid services or live AI calls are required. The ~3.4 MB public demo video is
  served through a media-only Pages Function because plain Pages assets do not
  return partial HTTP responses. Media requests consume the Functions free-tier
  quota; app pages remain static. The handler is capped at 12 MB and is not intended
  for arbitrary uploads. Private R2 storage and upload quotas are not yet implemented.

## Submission

- Live URL: https://tavrex-ai.pages.dev
- Public repository URL: not yet verified.
- Walkthrough URL: pending; camera-on recording must be no longer than 5 minutes.

Current acceptance evidence: [checkpoint report](docs/checkpoints.md). Production
browser checks can be repeated with
`TAVREX_VERIFY_URL=https://tavrex-ai.pages.dev npm run test:e2e`.
If browser downloads are unavailable, `TAVREX_CHROMIUM_EXECUTABLE` optionally selects
an already-installed Chromium executable. Mobile checks emulate a viewport;
they do not constitute testing on a physical iPhone or in Safari.

## Next checkpoints

Three summary templates and sourced actions → public moments → transcript-context
search → real ingestion → submission checks. No bonus work before these are safe.
