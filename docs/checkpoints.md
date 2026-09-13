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
