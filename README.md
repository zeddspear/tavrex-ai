# Tavrex AI

A focused meeting intelligence workspace. Built for the assessment showcase:
meetings → playback and transcript → summaries → sourced actions → moments → sharing → search.

## Current status

**Checkpoints 0 through F completed and verified. Live: https://tavrex-ai.pages.dev**
The playback, transcript, intelligence, public-moment, search, and private ingestion flows are implemented.

Working features:
- Responsive, no-login library with one real reference recording and three original synthetic examples.
- Real video/audio playback, native seek/volume controls, five playback speeds.
- Timestamped speaker turns that seek the player, active-turn highlighting, optional follow-scroll.
- Three cached summary templates with materially different General, Sales / Customer,
  and Recruiting / Interview structures.
- Two transcript-supported action items with owner, timing, and media source links.
- Saved moments from the current player position or a transcript turn, with editable
  title, note, and a bounded range that persists in the reviewer’s browser.
- Public, no-login moment links that seek the real recording, show transcript context,
  and pause at the shared range end without transcoding.
- Loading, buffering, failure/retry, and empty-transcript states.
- Search titles, summaries, participants, and transcript content across meetings,
  with highlighted contextual passages and source-specific destination links.
- Meeting overview routes, copy overview, missing-meeting recovery, keyboard-accessible help.
- Explicit synthetic data labels and no reference account information in fixtures.

Private uploads go directly to R2, receive live Whisper transcription and Llama analysis,
and persist in Supabase behind a browser-scoped guest session. Failed analysis can
retry using its saved transcript. See [ingestion setup and limits](docs/ingestion-setup.md).
No live bot, calendar connection, or authentication is represented as functional.

## Run locally

Requires Node 22.12+ (validated here using Node 24).

```sh
npm ci
npm run dev
```

Open http://localhost:5173 for the public UI. No environment variables or account
are required for that path. Private ingestion needs the configured full-stack
preview described in [ingestion setup](docs/ingestion-setup.md).

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
                                     → Recording JSON + cached intelligence
                                     → Sanitized WebM on meeting open
                                     → Self-contained public moment route
                                     → Typed local cross-meeting search index
```

A narrow Pages Function serves byte ranges for the one public demo video.
The same worker serves the private ingestion API, with Supabase, R2, and Workers AI.
Details: [architecture](docs/architecture.md).

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

- Capture uses real file upload; conferencing bots are intentionally omitted.
- The first checkpoint establishes reviewer entry before media/AI infrastructure.
- The recorded demo uses a supplied real recording and imported reference transcript.
  It is not synthetic, but it is also not Tavrex-generated transcription. End-to-end
  ingestion is independently available through Upload recording. The other three examples are synthetic.
- Its three summaries and action items are prepared, transcript-grounded demo output.
  Template switching does not call a model or imply live generation.
- Raw Fathom materials remain excluded from Git. A sanitized, permissioned video
  derivative and neutral-speaker transcript are included for the real playback demo.
  See [media provenance](docs/reference-research/recording-provenance.md).
- [Research notes](docs/reference-research/fathom-flow-notes.md) distinguish observed
  evidence, inference, and Tavrex decisions. Screenshots are not publicly republished.
- `.agent-logs/` is intentionally committed incrementally for assessment review.
  See [capture verification](CAPTURE-TEST.md). Historical entries remain untouched.
- The public showcase requires no live AI calls. The ~3.4 MB public demo video is
  served through a media-only Pages Function because plain Pages assets do not
  return partial HTTP responses. Media requests consume the Functions free-tier
  quota; app pages remain static. The handler is capped at 12 MB and is not intended
  for arbitrary uploads. Private uploads use R2 and live Workers AI within bounded
  demo quotas; provider free-tier limits still apply.

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

Checkpoint G — submission checks, public repository, and the camera-on walkthrough.
No bonus work before these are safe.
