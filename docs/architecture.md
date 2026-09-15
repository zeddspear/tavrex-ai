# Showcase architecture through Checkpoint F

```text
Clean browser → Cloudflare Pages → React / Vite SPA
                                      ↓
                         Zod-validated meeting metadata
                                      ↓ (on real meeting open)
                         Recording JSON + public WebM
                              ↓
                 Cached summaries + sourced actions
                              ↓
             Browser-persisted moments + public deep links
                              ↓
              Typed cross-meeting contextual search index
```

No runtime secrets, login, private database rows, or external media hosts are
needed for the reviewer path. Three original synthetic examples remain intact.
The recorded meeting loads its transcript separately, so the dashboard does not
fetch transcripts or video. Media uses `preload="metadata"` and native browser
controls. Plain Pages assets returned HTTP 200 for Range requests in production,
which broke seeking despite passing locally. A narrow Pages Function now returns
correct 206 responses for the one public video. `_routes.json` invokes it only
for that media path and `/api/*`; app assets remain static.

`apps/worker/src/index.ts` reads the public asset through the built-in ASSETS
binding and slices validated byte ranges. It supports GET, HEAD, open/suffix
ranges, invalid-range 416 responses and If-Range fallback. It limits the asset
to 12 MB, keeping this scoped to the ~3.4 MB reference fixture. This is not the
architecture for large private recordings; those use the separate private R2 ingestion flow below. Media requests
use the Pages Functions free-tier quota. No new account, binding secrets, or
paid resource is required.

The worker is typechecked with the app and emitted as `_worker.js` by the build.
Unit tests validate real response bytes and headers. Production verification
explicitly checks 206 and Content-Length alongside actual browser seeking.

References: [Pages serving behavior](https://developers.cloudflare.com/pages/configuration/serving-pages/)
and [Pages advanced-mode ASSETS binding](https://developers.cloudflare.com/pages/functions/advanced-mode/).

`packages/shared/meeting.ts` separates synthetic and reference provenance.
`packages/shared/recording.ts` validates speaker references, ordered non-overlapping
turns, intelligence-template keys, and every summary/action source bound. Imported
source timestamps are in seconds. Clicking one
sets the real media element's `currentTime`; clicks before metadata are queued.
Playback events drive time and active-turn state. Follow-scroll brings the active transcript row into the page viewport, only during
playback when enabled.

Meeting-data failures have a 15-second timeout and retry. Media errors retain the
transcript. Slow loading/buffering displays a connection notice and reload action.
An empty imported transcript still permits playback. No fake processing timers.

The recording JSON contains exactly three cached templates: General, Sales /
Customer, and Recruiting / Interview. Each uses a different title, framing, and
section structure. The recruiting view explicitly identifies the conversation as
a product walkthrough and withholds unsupported candidate judgments. Summary and
action citations call the same bounded seek function as transcript timestamps.
Switching templates is synchronous because all three outputs are already cached;
meeting JSON loading, validation failure, and retry states cover this data.

The analysis is a prepared demo fixture grounded in the supplied transcript and
summary evidence. The UI discloses that Tavrex did not run a live model for this
recording. This keeps reviewer behavior reliable without representing seeded output
as a live AI service. New uploads use live generation through the ingestion flow below.

The sanitized video is a deliberately public static asset. Its source recording
and unredacted references remain ignored. This is not a private-media architecture;
user uploads use Workers, Supabase and R2 with browser-scoped authorization.

Moments use the specification’s timestamp-reference approach rather than video
transcoding. The seeded public recording includes one validated shareable moment.
New moments are Zod-validated and saved under a meeting-scoped browser-storage key;
the share URL carries its validated start, end, title, and optional note. That URL
therefore works in a clean browser without relying on the creator’s local storage.
The public route accepts only the deliberately public recording, clamps ranges to
its media duration and 60 seconds, displays overlapping transcript turns, and pauses
at the range end. It renders no private workspace navigation or identifiers.

This is suitable for the public assessment fixture. Production user moments still
need authenticated persistence and opaque server-resolved share tokens as defined
in the specification.

Cross-meeting search runs against a small, Zod-validated public index covering all
four demo meetings. It matches title, summary, participant, and transcript text,
then returns the source type, speaker, contextual passage, and timestamp when one
exists. A transcript result for the real recording opens the meeting, applies the
source time after media metadata loads, highlights the active speaker turn, and can
return the transcript row to view. Synthetic passages are explicitly labeled and
open matching context without implying that media exists. Search remains lexical
and synchronous; semantic/vector infrastructure is unnecessary for this checkpoint.


## Private upload and processing

```text
Browser → Worker: create private meeting / short-lived signed PUT
Browser → R2: media bytes directly to staging object
Browser → Worker: process / check state
Worker → R2: verify and freeze playback object
Worker → Whisper: actual timestamped transcript
Worker → Supabase: store transcript before analysis
Worker → Llama: three validated summary views and sourced actions
Browser → same recording UI: authorized media ranges + persisted results
```

`apps/worker/src/ingestion.ts` scopes every data operation to the digest of an
HttpOnly guest cookie. RLS blocks direct anonymous/authenticated Supabase access;
only the server service role accesses private rows. Private media is streamed from
R2 through an authorized no-store route with range support. Neither storage keys
nor credentials are returned in meeting metadata. A signed PUT targets staging;
processed playback uses a separate object to prevent later overwrites.

`UploadMeeting.tsx` provides the upload form, progress/recovery UI, private library,
and adapter into the existing `RecordingExperience`. Public fixture paths remain
independent of backend availability. Stored private transcripts and summaries are
also searchable in the owner's library; private moments remain local and cannot
create public share links.

Provider timestamps are normalized without fabricated speaker identities. Model
output is schema-validated; unsupported summary sections can be empty. Template
keys, labels, and provenance are assigned by the server. A failed analysis retains
the playable transcript; retry skips transcription. Atomic leases and SQL quotas
bound concurrent work and demo usage. Processing runs within the request, without
an additional queue; interruptions are recoverable through the UI.

See [setup, verification, limits, and retention](ingestion-setup.md).
