# Tavrex AI

AI-powered meeting intelligence for uploaded recordings.

Tavrex AI turns meeting audio and video into searchable transcripts, summaries, decisions, action items, topics, follow-up drafts, and grounded AI answers with clickable timestamp citations.

> Built as a 24-hour assessment MVP with a strict focus on reliability, polished UX, evidence-grounded AI, and free-tier deployment.

---

## Features

- Upload MP4, MOV, MP3, WAV, M4A, or WebM recordings
- Timestamped transcription
- Video/audio playback synchronized with transcript timestamps
- Transcript search
- Manual speaker renaming
- AI-generated:
  - meeting title
  - executive summary
  - key points
  - decisions
  - action items
  - risks/blockers
  - topics/chapters
  - follow-up email draft
- Ask AI questions about a meeting
- Timestamp-grounded answers with clickable citations
- Meeting history and search
- Read-only share links
- Copy/export actions
- Responsive desktop/mobile UI
- Processing, loading, empty, retry, and error states

### Optional / Bonus Scope

- Browser microphone recording
- Near-live transcription
- Cross-meeting AI search
- Automatic speaker diarization
- Markdown export

---

## Core User Flow

```text
Sign up
→ Upload recording
→ Processing
→ Transcript
→ AI intelligence
→ Ask a question
→ Click source timestamp
→ Share result
```

---

## Architecture

```text
                        ┌──────────────────────┐
                        │      Tavrex AI       │
                        │   React + Vite UI    │
                        └──────────┬───────────┘
                                   │
                                   ▼
                        ┌──────────────────────┐
                        │ Cloudflare Workers   │
                        │        API           │
                        └───────┬───────┬──────┘
                                │       │
                     ┌──────────┘       └──────────┐
                     ▼                             ▼
          ┌────────────────────┐        ┌────────────────────┐
          │ Supabase           │        │ Cloudflare R2      │
          │ Auth + PostgreSQL  │        │ Recording storage  │
          │ + pgvector         │        └────────────────────┘
          └──────────┬─────────┘
                     │
                     ▼
          ┌────────────────────┐
          │ Workers AI         │
          │ Transcription      │
          │ Summaries          │
          │ Embeddings / Q&A   │
          └────────────────────┘
```

Large media files should upload directly to R2 instead of passing through a Worker.

---

## Tech Stack

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- Radix UI
- Lucide Icons
- TanStack Query
- React Hook Form
- Zod

### Backend

- Cloudflare Workers
- TypeScript

### Data

- Supabase PostgreSQL
- Supabase Auth
- pgvector

### Storage

- Cloudflare R2

### AI

Primary:

- Cloudflare Workers AI

Local development fallback:

- `whisper.cpp` + Vulkan
- `llama.cpp` + Vulkan

### Deployment

- Cloudflare Pages
- Cloudflare Workers
- Supabase
- Cloudflare R2

---

## Repository Structure

```text
/
├─ apps/
│  ├─ web/
│  │  ├─ src/
│  │  └─ public/
│  └─ worker/
│     └─ src/
│
├─ packages/
│  └─ shared/
│     ├─ schemas/
│     ├─ types/
│     └─ utils/
│
├─ supabase/
│  └─ migrations/
│
├─ docs/
│  ├─ architecture.md
│  └─ demo.md
│
├─ .env.example
├─ README.md
└─ AGENT_BUILD_SPEC.md
```

---

## Main Routes

```text
/login
/signup
/app
/app/meetings/:id
/share/:token
```

---

## Meeting Processing Pipeline

```text
created
→ uploading
→ uploaded
→ transcribing
→ analyzing
→ complete
```

On failure:

```text
failed
```

Processing data should include:

```text
processing_stage
processing_progress
processing_error
```

If AI analysis fails after transcription succeeds, the transcript remains available and analysis can be retried without re-uploading the recording.

---

## AI Output

Tavrex AI generates structured meeting intelligence.

Example:

```json
{
  "title": "Customer onboarding discussion",
  "summary": [
    "The customer reviewed current onboarding pain points."
  ],
  "keyPoints": [
    {
      "text": "The current onboarding flow takes too long.",
      "timestamp": 742
    }
  ],
  "decisions": [
    {
      "text": "The new flow will be tested next month.",
      "timestamp": 1224
    }
  ],
  "actionItems": [
    {
      "task": "Prepare onboarding prototype",
      "owner": "Sarah",
      "dueDate": null,
      "timestamp": 1320
    }
  ],
  "risks": [],
  "topics": [
    {
      "title": "Onboarding workflow",
      "start": 742,
      "summary": "Discussion of current onboarding issues."
    }
  ]
}
```

All structured AI output is validated before rendering.

---

## Ask AI

Meeting Q&A is retrieval-grounded.

```text
Transcript
→ Chunk
→ Embed
→ Store in pgvector
→ Retrieve relevant chunks
→ LLM
→ Answer + timestamp citations
```

Example:

```text
Q: What budget did the customer mention?

A: The customer mentioned approximately $2,500/month.

Sources:
12:47 — “Around $2,500 per month.”
```

Clicking `12:47` seeks the media player to that moment.

If the transcript does not support an answer, Tavrex AI should return:

```text
I couldn't find that information in this meeting.
```

---

## Database Model

Core tables:

```text
profiles
meetings
speakers
transcript_segments
meeting_insights
transcript_chunks
share_links
```

Supabase Row Level Security should ensure that users cannot access private meetings belonging to other users.

---

## Local Development

### Prerequisites

- Node.js
- npm / pnpm
- Supabase project
- Cloudflare account
- Wrangler CLI

Clone the repository:

```bash
git clone <your-repository-url>
cd tavrex-ai
```

Install dependencies:

```bash
npm install
```

Copy environment variables:

```bash
cp .env.example .env
```

Run the frontend:

```bash
npm run dev
```

Run the Worker locally if it is configured as a separate workspace:

```bash
cd apps/worker
npm run dev
```

---

## Environment Variables

Example only:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=

CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=
```

Do not expose private credentials through `VITE_*` variables.

Never commit real secrets.

---

## Deployment

### 1. Supabase

Create a Supabase project and apply the migrations in:

```text
supabase/migrations/
```

Enable:

- authentication
- Row Level Security
- pgvector

### 2. Cloudflare R2

Create a private R2 bucket for meeting recordings.

Use signed/direct uploads so large media files do not pass through Cloudflare Workers.

### 3. Cloudflare Workers

Deploy the API Worker and configure:

- Supabase credentials
- R2 bindings
- Workers AI bindings
- production environment variables

Example:

```bash
npx wrangler deploy
```

### 4. Cloudflare Pages

Build the frontend:

```bash
npm run build
```

Deploy the web application to Cloudflare Pages.

Configure public frontend environment variables in the Pages project settings.

### 5. Smoke Test

Before submission, verify:

```text
signup
login
upload
transcription
summary
timestamp seek
Ask AI
share link
delete meeting
mobile layout
```

---

## Free-Tier Strategy

The assessment build is designed around free-tier infrastructure.

Primary services:

- Cloudflare Pages
- Cloudflare Workers
- Cloudflare Workers AI
- Cloudflare R2
- Supabase
- GitHub

The app should enforce demo-safe limits such as:

```text
MAX_FILE_MB=500
MAX_DURATION_MINUTES=60
```

Additional rate limits can be added to AI Q&A and upload endpoints.

This architecture is intended for an assessment/demo workload, not unlimited production traffic.

---

## Local AI Fallback

Development hardware can optionally run AI locally.

Target machine:

```text
Ryzen 5 5600
32 GB RAM
AMD RX 6700 XT 12 GB
```

Recommended local fallback:

```text
whisper.cpp + Vulkan
llama.cpp + Vulkan
```

Local AI is for development/testing only.

The deployed application must remain functional when the development PC is turned off.

---

## Security

The application should enforce:

- Supabase Row Level Security
- private/signed media access
- server-only service-role credentials
- Zod validation for API payloads
- MIME and file-size validation
- sanitized filenames
- unguessable share tokens
- authorization checks on every private meeting endpoint
- rate limiting where practical
- deletion of associated media/data when deleting meetings

Raw stack traces and secret values must never be shown to users.

---

## UX Principles

Tavrex AI is intentionally not a visual clone of Fathom.

The interface prioritizes:

- strong typography
- clear hierarchy
- spacious layouts
- minimal clutter
- fast transcript navigation
- evidence-linked AI output
- polished loading/error states
- subtle motion
- responsive design

The target visual quality is closer to modern products such as Linear, Raycast, Vercel, Granola, and other AI-native SaaS interfaces.

The UI should not look like a default admin dashboard or an unmodified shadcn template.

---

## Current MVP Tradeoffs

The 24-hour version intentionally does not prioritize:

- Zoom meeting bots
- Google Meet bots
- Microsoft Teams bots
- calendar sync
- CRM integrations
- billing
- organizations
- enterprise RBAC
- SSO
- desktop apps
- browser extensions
- native mobile apps

Uploaded recordings are the primary workflow.

Speaker renaming may remain manual if automatic diarization cannot be completed within the time limit.

Free-tier AI and storage limits also apply.

---

## Testing

Minimum checks before deployment:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Manual checks:

- Chrome desktop
- Firefox desktop
- mobile viewport
- video upload
- audio upload
- interrupted/failed upload
- transcript search
- timestamp seek
- Ask AI citations
- public share page
- delete meeting
- logout/login

---

## Definition of Done

```text
[ ] public HTTPS URL works
[ ] signup works
[ ] login works
[ ] video upload works
[ ] audio upload works
[ ] upload progress works
[ ] real transcript is generated
[ ] transcript timestamps work
[ ] player seek works
[ ] summary works
[ ] key points work
[ ] decisions work
[ ] action items work
[ ] topics work
[ ] follow-up draft works
[ ] Ask AI works
[ ] timestamp citations work
[ ] transcript search works
[ ] speaker rename works
[ ] public share page works
[ ] delete works
[ ] mobile UI works
[ ] secrets are not committed
[ ] lint passes
[ ] typecheck passes
[ ] tests pass
[ ] production build passes
```

---

## Product Principle

> **Evidence-first meeting intelligence.**

Every important AI-generated decision, action, or answer should be traceable back to the original conversation through a timestamp.

---

## License

Add the license appropriate for the assessment/repository before publishing.
