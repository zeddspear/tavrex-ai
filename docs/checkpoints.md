# Checkpoint evidence

## 0 — Assessment prerequisites

- Full 2,818-line specification, all six PNGs, transcript, summary and capture
  instructions inspected before coding.
- Two original CLI canaries, a later IDE prompt/response canary, and the current
  automatically recorded build prompt verified. Hooks and historical logs unchanged.
- Privacy review: raw local references excluded from Git; research records behavior.
- Commit: `c71275b`.

## A — Public reviewer entry

- Live: https://tavrex-ai.pages.dev
- Initial immutable deployment: https://d50de4da.tavrex-ai.pages.dev
- Final Checkpoint A deployment: https://4c40bd54.tavrex-ai.pages.dev
- Clean Firefox context returned HTTP 200, populated the dashboard, opened the
  meeting route and rendered a 390px mobile layout without horizontal overflow.
- Desktop (1440px) and mobile (390px) screenshots visually inspected.
- Final public-deployment acceptance: Firefox 155 — 3 passed; Chromium 149 desktop
  and mobile — 5 passed, 1 intentionally skipped (desktop-only help dialog).
  Includes filtering, sorting, empty recovery, direct route reload, missing route,
  actual clipboard copy, and keyboard dialog focus return. Chromium's headless
  context explicitly grants clipboard access and reads back the copied text.
- Unit tests: 5 passed. Strict typecheck and production build passed.
- Latest Chromium download timed out; the smaller retry remained slow. Used the
  existing Chrome for Testing 149.0.7827.55 executable through the optional
  `TAVREX_CHROMIUM_EXECUTABLE` test configuration instead. Canceled the redundant
  download after tests passed. No Safari or real mobile-device pass is claimed.
- All three current meetings are clearly synthetic. Real video has now been
  supplied in response to the request for approved public demo media; it has not
  been published or processed yet. This remains a later submission requirement.
- No Supabase migration or empty backend is added at this checkpoint: only public
  fixtures are served, so reviewer access needs no backend credentials.

Initial failures resolved: sandbox blocked npm network access and Vite's port;
re-ran with required tool permissions. Latest Wrangler's default Pages delegation
failed; explicit Pages project creation succeeded. Initial browser attempts lacked
the correct Playwright binaries; Firefox was installed and rerun successfully.
The first headless Chromium copy test hit the readable permission-denied state;
the test then granted clipboard permission and verified the actual copied text.

Credential-pattern scan: no matches in the 18 scanned source/build/document/log
files. No private reference identity or recording link matches in app source or
production assets. Raw references remain ignored. `git diff --check` passes for
code/docs; the raw captured prompt has trailing whitespace, preserved verbatim
as required by the assessment capture rules.

Next: Checkpoint B — inspect the supplied recording for publication safety,
add real playback and timestamped transcript, and verify seeking. No B feature is
claimed complete in this checkpoint.

## B / checkpoint 2 — Flagship playback and transcript

Implementation:
- The dashboard opens one real, sanitized 1:44 recording. The three synthetic
  meetings and their existing filtering/copy/navigation behavior remain available.
- Native video/audio controls, five speeds, original speaker timestamps, active
  speaker highlighting, and optional transcript-only follow-scroll work together.
- Timestamp clicks before metadata are queued. Seeking shows buffering until
  frames are ready; slow loads offer reload, errors preserve the transcript and
  offer retry. Meeting-data failure and empty transcript have dedicated states.
- Public media is a 3.4 MB VP8/Opus derivative with masked name labels, frequent
  keyframes and a front-loaded seek index. Original private references stay ignored.
- A narrowly routed Pages Function supplies HTTP 206 byte ranges for this asset.
  Plain Pages returned the complete file for Range requests and broke public seeks;
  the function fixes that production-only difference. An internal ASSETS response
  omitted Content-Length, so bounds now derive from the actual bytes (unit tested).

Validation:
- Strict typecheck, ESLint, production build: passed.
- Vitest: 16 passed, including transcript bounds and actual byte-range responses.
- Local Playwright: 20 passed, 1 intentional desktop-dialog skip on mobile.
- Final public deployment: https://a4b6396e.tavrex-ai.pages.dev (also live at
  https://tavrex-ai.pages.dev). Fresh-context Playwright: 20 passed, 1 intentional
  mobile skip across Chromium 149 and Firefox 155. Covers real play/pause,
  timestamp seeks with decoded frames, speed changes, speaker-follow scrolling,
  pre-metadata seek, media/data failure recovery, empty transcript, and all
  established dashboard tests. Public full playback cases took 14–25 seconds.
- Final clean Firefox visual review: 1440px desktop, 390px mobile, and the final
  participant frame inspected. No horizontal overflow; decoded media measured
  640 × 360 / 103.827 seconds. Range 0–1023 returned HTTP 206 and exactly 1024 bytes.
- Browser seek assertions wait for decoded frames and seek completion, not merely
  the synchronous currentTime assignment. Cold public seeks exceeded the former
  five-second test allowance; network media assertions allow up to 30 seconds.
- Credential-pattern scan: no matches in 24 source/document/log files. Eleven
  private reference email/URL identifiers had no matches in app source/build.
  Raw logs are preserved verbatim; code/docs pass git diff whitespace checks.

Limits: the transcript is imported with two verified speaker-turn timestamps.
It is not generated by Tavrex; real ingestion remains checkpoint F. Testing uses
Firefox and Chromium desktop/mobile emulation, not Safari or a physical phone.
Cold public media can buffer depending on network speed, with visible feedback.

Next: Checkpoint C — summary, three meaningful templates, and action items with
source timestamps. No C or bonus functionality was started in this iteration.

## C — AI output

Implementation:
- The real recording now includes an intelligence panel beside the player and a
  transcript beneath the player in the left column, preserving the readable
  playback/transcript flow.
- General, Sales / Customer, and Recruiting / Interview are three cached,
  materially distinct analysis views. Each changes the title, executive framing,
  and sections instead of merely changing a tab label.
- The recruiting view marks the meeting as a product walkthrough and deliberately
  withholds unsupported candidate claims. The sales view identifies customer value
  and the observed recording issue without inventing a commercial commitment.
- Two action items preserve the transcript-supported owner, timing and source at
  1:14. Every rendered key point and action contains a bounded source timestamp;
  clicking any source calls the same playback seek used by the transcript.
- Intelligence is Zod-validated inside the public recording fixture. It checks
  all three template keys, distinct output, and citations within media duration.
  The UI explains that this is prepared, transcript-grounded demo output rather
  than live Tavrex generation.

Validation:
- Strict typecheck, ESLint, and production build passed.
- Vitest: 18 passed, including missing/duplicate template and out-of-range source
  rejection.
- Local Playwright: 23 passed, 1 intentional desktop-dialog skip on mobile.
  The new test switches all three templates, confirms their different content,
  and verifies an action-source button seeks the real video to 1:14.
- Deployed to https://9434a18e.tavrex-ai.pages.dev (canonical:
  https://tavrex-ai.pages.dev). Chromium and Firefox completed their full public
  suites before a transient network change affected the combined mobile run.
  A fresh, isolated mobile run against the immutable deployment then passed all 5
  recording cases, including playback, error/retry, pre-metadata seek, templates,
  and action source seeking. The endpoint returned HTTP 200 for the page and the
  existing range function remained verified in clean-browser checks.
- Final local visual review: desktop player/intelligence pairing and mobile stacked
  layout were inspected; mobile had no horizontal overflow.

Limits: analysis is cached demo output, not model-generated or persisted per user.
Loading and retry states apply to the combined recording/intelligence fixture, and
the output state is immediately ready once that fixture validates. Live generation
and customization remain intentionally deferred.

Next: Checkpoint D — create a saved moment and make its public timestamped share
route work in a clean browser. No D or bonus functionality was started here.

### Meeting-detail layout correction

After Checkpoint C, the sticky `.recording-column` was constrained by the whole
two-row grid rather than the player row. It stayed pinned while the separate,
full-width transcript row moved underneath it, producing the reported overlap.
The transcript's 650px nested scroller compounded the collision.

The grid now names explicit player, transcript, and intelligence areas. Player and
transcript remain in normal flow in the left column; only intelligence is sticky
in the right column, with a 24px offset and viewport-bounded internal scrolling.
At 1100px and below it becomes static and the areas stack player, intelligence,
then transcript. Follow Playback now brings the active transcript row into the
page viewport instead of scrolling a removed nested container.

Verification:
- 1920×1080, 1440×900, 1024×768, and 390×844 were checked at top, intermediate,
  and bottom scroll positions. Column/stack order, child containment, and document
  width are asserted in `tests/recording-layout.spec.ts`.
- Local suite: 24 passed, 3 intentional project-specific skips. ESLint, strict
  typecheck, and production build passed.
- Public immutable deployment: https://13c0cb3e.tavrex-ai.pages.dev. Layout matrix
  passed, and 15 meeting-detail interaction checks passed across Chromium,
  Firefox, and mobile emulation; 2 layout-project skips were intentional.
- Video controls, transcript timestamps, all three summary templates, action
  timestamps, Follow Playback, loading/error recovery, and pre-metadata seeks
  remained operational.

## D — Saved moments and public timestamped sharing

Implementation:
- The real meeting includes one seeded, transcript-supported moment. Reviewers can
  create another from either the current player position or a transcript turn,
  edit its title/note/start/end, and see it attached to the meeting immediately.
- New moments are schema-validated, limited to a 60-second range within the media,
  and persisted under a meeting-scoped browser-storage key. Invalid stored entries
  are ignored; a storage failure retains the moment for the current visit and is
  disclosed in the UI.
- Copy link writes the actual public URL. Open public view launches a standalone
  `/share/:token` page with no workspace navigation or login dependency. The URL
  contains the bounded moment data, so a fresh browser does not depend on the
  creator’s local storage.
- The public page loads the original range-enabled recording, seeks to the moment
  start, displays title, note, meeting context and overlapping transcript turns,
  pauses at the exact end, and offers replay. Invalid links, recording-data failure,
  media failure, retry, and missing transcript context have explicit recovery states.
- Sharing remains zero-transcode and is limited to the deliberately public demo
  recording. Production opaque tokens and authenticated database persistence remain
  future infrastructure work.

Validation:
- Strict typecheck, ESLint, production build, and 21 Vitest checks passed.
- Local Playwright suite: 33 passed, with 3 intentional project-specific skips.
  Moment-specific scenarios passed in Chromium, Firefox, and mobile emulation:
  create/edit/save, reload persistence, actual clipboard output, independent browser
  context, 1:37 automatic seek, transcript context, bounded pause/replay, data/media
  failure retry, invalid-link recovery, and no horizontal overflow.
- Manual browser review confirmed the desktop meeting composer and standalone public
  page composition; browser console error/warning logs were empty. The responsive
  public route was also inspected at 390px through its accessibility surface, while
  the full mobile interaction and overflow assertions ran in Playwright.
- Final immutable deployment: https://e9b6be97.tavrex-ai.pages.dev (canonical:
  https://tavrex-ai.pages.dev). All 9 moment-specific public checks passed across
  Chromium, Firefox, and mobile emulation. A separate canonical-browser inspection
  loaded the 1:37 seed moment and its participant context with an empty console.

Next: Checkpoint E — search titles, summaries, and transcript text across meetings
with contextual snippets and useful destination links. No E functionality was
started in this checkpoint.

### Checkpoint D audit

A follow-up specification audit found that the public moment page exposed the
meeting title only through the media accessibility label. The title is now visibly
rendered with the required meeting summary. The corrected immutable deployment is
https://8dbe49e0.tavrex-ai.pages.dev; all 9 local and all 9 public moment checks
passed across Chromium, Firefox, and mobile emulation after this correction.

## E — Cross-meeting contextual search

Implementation:
- The meeting library searches title, summary, participant, and transcript text
  across all four public demo meetings. Category filters continue to intersect the
  query, while clearing search restores the existing sorted library.
- Results are grouped by meeting and expose source type, highlighted contextual
  passages, speaker identity, and timestamp where available. Empty searches explain
  which fields can be searched and provide a working reset action.
- A real transcript result opens the recorded meeting at its source time. Media seeks
  after metadata loads, the matching speaker turn becomes active, and “View transcript
  context” brings the source row into view. Synthetic transcript results open a
  clearly labeled context panel and never imply that playable media exists.
- The public search index is Zod-validated for unique meeting/segment identities and
  bounded timestamps. Search is local and synchronous, so no artificial loading or
  failure state is shown; those states would misrepresent this implementation.

Validation:
- Strict typecheck, ESLint, production build, and 26 Vitest checks passed.
- The full local Playwright suite passed 48 scenarios across Chromium, Firefox, and
  mobile emulation, with 3 intentional project-specific skips. Search coverage includes
  multiple contextual results, category intersection, title/summary/participant
  matches, empty-state recovery, responsive containment, synthetic navigation, and
  a decoded media seek to the real participant turn at 1:37.
- The 1440px result composition was rendered and visually inspected. A separate local
  browser pass exercised the 1:37 search arrival and confirmed the participant source.
- Final immutable deployment: https://b10fac7a.tavrex-ai.pages.dev (canonical:
  https://tavrex-ai.pages.dev). The same complete Playwright suite passed publicly:
  48 passed and 3 intentional skips. A clean canonical-browser inspection opened the
  1:37 transcript result, rendered its source turn, and reported no console errors.

Limit: search uses a deliberately small lexical public index. Synthetic examples
contain labeled excerpts rather than complete recordings. Semantic/vector retrieval
and private indexed storage remain outside this checkpoint.

Next: Checkpoint F — real upload, processing, and transcription. No ingestion or
Tier C bonus functionality was started in this checkpoint.

### Checkpoint F prerequisite audit — incomplete

The current capture includes this iteration's prompt. Checkpoint E is committed
as `306a072`. The available authoritative file is `TAVREX_AI_AGENT_BUILD_SPEC.md`;
no separate revised file is present. The ingestion acceptance path requires real
media upload, transcription, persisted transcript, and the existing meeting view.

Cloudflare OAuth access is valid, but the account has no R2 buckets, the Pages
project has no production secrets, and no local Supabase/R2 credentials exist.
The missing server configuration was requested through the input panel. No
credentials were read into the prompt or assessment capture.

Preparation only:
- `packages/shared/ingestion.ts` validates upload metadata, normalizes provider
  timestamps, and defines processing transitions and retry stages.
- Five ingestion unit tests cover file limits/types/paths, timestamp preservation,
  empty/invalid provider output, transcript order, and retry stages.
- `supabase/migrations/202609150001_private_ingestion.sql` defines a private table
  with RLS, server-only access, processing leases, and stored transcript/analysis.
  The migration has not been applied or tested against a live database.
- `.env.example` lists the missing server variable names; `docs/ingestion-setup.md`
  records setup and the remaining acceptance path.

Typecheck, ESLint, build, and 31 unit tests passed. The production frontend asset
hashes are unchanged from Checkpoint E. No upload UI, API, or live transcription is
claimed complete or deployed. Checkpoint F remains the next incomplete checkpoint;
real ingestion and browser acceptance await service access.

## F — Real private ingestion

Final deployment: https://5a71249d.tavrex-ai.pages.dev (canonical:
https://tavrex-ai.pages.dev).

Completed after the prerequisite audit above:
- Applied the private ingestion SQL migration through the authorized database
  connection. Rechecked RLS and denied direct browser-role table access.
- Configured runtime secrets securely and direct R2 PUT CORS. The original R2 token
  denied writes; after its scope was corrected, signed PUTs returned HTTP 200.
- Added a real upload form, browser progress, recoverable processing states, a
  private library, and the existing meeting view for uploaded media. Metadata and
  quotas are validated in both application and database layers.
- Whisper produces real provider timestamps; the transcript is persisted before
  Llama analysis. Three named summary views receive server-owned labels/provenance.
  Unsupported sections can remain empty. Analysis errors retain playback and the
  transcript; retry skips transcription. Speaker identities are not inferred.
- Private media is scoped to an HttpOnly guest cookie, with authenticated range
  responses and no-store headers. Public sharing remains limited to the public
  fixture. Existing public showcase routes work without backend credentials.

Verification:
- Strict typecheck, ESLint, production build, and all 37 unit tests passed.
- The real browser upload test passed against https://tavrex-ai.pages.dev in
  Chromium. It uploaded the sanitized public WebM directly to R2, waited for real
  transcription and generated analysis, played/paused, sought to a late transcript
  timestamp with decoded frames, switched summary views, reloaded persisted results,
  returned to the private library, and verified that an independent browser could
  access neither the transcript nor private media (HTTP 401).
- A separate live API run persisted 22 Whisper segments despite an analysis
  validation failure. Provider output exposed a conflict between empty unsupported
  sections and the former schema minimum; correcting that contract enabled the
  successful complete browser run. No fabricated fallback analysis was substituted.
- Nine controlled ingestion-state checks passed across Chromium, Firefox, and mobile:
  playable transcript after analysis failure, processing retry, interrupted upload
  recovery, empty transcript with playback, invalid-file validation, and containment.
- Full deployed regression: 53 passed, 3 intentional skips, 4 initial Chromium
  timeouts under six-worker concurrency. All four failed cases passed with two
  workers (57 distinct passing scenarios total). Public playback, source seeking,
  Follow Playback, moments/sharing, cross-meeting search, and the 1920/1440/1024/390px
  scroll-layout matrix remained intact. No test assertions or timeouts were weakened.
- Upload-page screenshots at 1440×1000 and 390×844 were rendered and visually
  inspected; document width stayed within the viewport.
- `.dev.vars` remains ignored. Exact configured-value scanning found no matches
  in 84 repository/log/build files. Code/doc diffs passed whitespace validation;
  historical capture content is preserved verbatim.

Limits: 25 MB / ten minutes, three uploads per browser per rolling day, twenty
workspace uploads per rolling day, one hundred stored rows total, and three
processing attempts per recording. Provider allowances still apply. Keep the tab
open during processing; there is no job queue, diarization, automatic retention
cleanup, or account recovery. Guest access expires with its seven-day cookie.
Real provider acceptance used WebM in Chromium; other accepted codec combinations
are not claimed as individually tested. Safari and physical devices were not tested.

Next: Checkpoint G — submission readiness, public repository verification, and the
camera-on walkthrough of no more than five minutes. No Tier C work was started.

## G — Submission readiness audit (walkthrough link pending)

The final camera-on walkthrough is the one outstanding hand-in artifact; the user
will provide it after the rest of the checkpoint is prepared. No video or duration
is claimed as verified yet.

Prepared and verified:

- Canonical live HTTPS app opened in a fresh Chromium browser with four visible
  seeded meetings, including one permissioned real recording and three labeled
  synthetic examples. The repository is publicly reachable; `mvp` includes F and
  committed `.agent-logs/`. The default branch is fast-forwarded as part of this
  audit so a reviewer landing at the repo root sees the implementation.
- Rehearsed the actual live five-minute route: dashboard → real meeting → decoded
  play/pause and transcript seek → all three differentiated templates and an action
  source seek → saved moment → public view in an independent clean browser →
  transcript search source destination → upload page. The route reported no page
  script errors or horizontal overflow. Desktop dashboard, meeting, search, share,
  upload, and 390px mobile meeting screenshots were rendered and visually inspected.
- Production regression across Chromium, Firefox, and mobile emulation: 56 passed,
  one intentional mobile help-dialog skip, using two workers. The earlier F upload
  verification remains the live provider acceptance; no extra model quota was
  consumed solely for submission rehearsal.
- Strict TypeScript check, ESLint, production build, and all 37 unit tests passed.
  The build kept the deployed client asset hashes, so documentation changes do not
  require another Pages deployment.
- The exact configured-value scan found no credential matches in 85 repository/log/
  build files; `.dev.vars` remained ignored. No email-address patterns were found
  in public source, fixtures, documentation, or committed capture logs. The logged
  assessment prompts and capture canaries remain committed without hook changes.
- [SUBMISSION.md](../SUBMISSION.md) contains labeled live/repository fields,
  reviewer notes, and a timed camera-on recording route. It explains how to show
  a new processing state and a separately preprocessed private meeting honestly
  within five minutes.

Pending before marking G complete: receive the user's camera-on walkthrough, verify
that its public link opens externally and lasts no more than five minutes, then fill
its submission field. This is a required assessment artifact, not bonus scope.
