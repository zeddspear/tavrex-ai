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
