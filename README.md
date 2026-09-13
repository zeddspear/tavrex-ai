# Tavrex AI

A focused meeting intelligence workspace. Built for the assessment showcase:
meetings → playback and transcript → summaries → sourced actions → moments → sharing → search.

## Current status

**Checkpoints 0 and A complete. Live: https://tavrex-ai.pages.dev**
This is a foundation, not a completed meeting intelligence product.

Working features:
- Responsive, no-login meeting library with three original synthetic examples.
- Search titles, sample summaries, and participants; category filters and date sorting.
- Meeting overview routes, copy overview, missing-meeting recovery, keyboard-accessible help.
- Explicit synthetic data labels and no reference account information in fixtures.

Not implemented yet: media playback, timestamped transcript, AI generation/templates,
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
Browser → Cloudflare Pages → React app → Public synthetic fixtures
```

The specified Workers / Supabase / R2 services are later checkpoints, not connected
in this build. Details: [architecture](docs/architecture.md).

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
Verify `/`, `/app`, and `/app/meetings/product-direction` in a fresh browser context.

Alternatively connect this repository through Pages Git integration with build
command `npm run build` and output directory `apps/web/dist`.

Official deployment reference:
[Cloudflare React guide](https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/).

`.env.example` lists server-side deployment variable names only. Prefer Wrangler's
local login; never paste tokens into chat or put secrets in browser variables.

## Assessment decisions and privacy

- Upload-first capture is planned; conferencing bots are intentionally omitted.
- The first checkpoint establishes reviewer entry before media/AI infrastructure.
- All current examples and analysis are original synthetic fixtures. There is no
  real recording processed by Tavrex yet; this remains a submission blocker.
- Supplied Fathom materials are behavioral references and excluded from Git.
- [Research notes](docs/reference-research/fathom-flow-notes.md) distinguish observed
  evidence, inference, and Tavrex decisions. Screenshots are not publicly republished.
- `.agent-logs/` is intentionally committed incrementally for assessment review.
  See [capture verification](CAPTURE-TEST.md). Historical entries remain untouched.
- No paid services are required for this foundation. No live AI/storage quota is
  used. Upload limits and provider quotas must be documented when ingestion exists.

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

Permissioned real recording/playback/transcript →
three summary templates and sourced actions → public moments → transcript-context
search → real ingestion → submission checks. No bonus work before these are safe.
