# Tavrex AI product review

- **Live application:** https://tavrex-ai.pages.dev
- **Public repository:** https://github.com/zeddspear/tavrex-ai

The live app opens directly to four seeded conversations. One uses a permissioned,
sanitized real recording with an imported timestamped transcript; the other three
are clearly labeled synthetic examples. The real recording's prepared summaries
are disclosed as demo output. New private uploads use live transcription and
analysis, stored separately from public fixtures.

## What to try

1. Open **From conversation to recording**. Play the media and use a transcript
   timestamp to seek. Switch the three summary views and follow an action source.
2. Save a moment from the transcript, then open its public view in a clean browser.
3. Search `video is not getting recorded` across meetings and open the transcript
   result at its source time.
4. Open **Upload recording** to inspect the real private ingestion path and its
   processing, empty, and retry states. A private meeting belongs to the browser
   session that uploaded it.

## Reviewer notes

- Public meeting and moment flows need no credentials. Private uploaded meetings
  require the seven-day guest cookie from the browser that uploaded them; incognito
  visitors cannot see them.
- The public moment route works only for the permissioned public seeded recording.
- File limits are 25 MB and ten minutes. Provider and workspace quotas are bounded;
  processing uses a foreground request with check/resume and retry states.
- The app has no live conferencing bot or calendar integration. The real public
  recording's transcript and summaries are imported/prepared; private uploads run
  live Whisper and Llama models.
- [Checkpoint verification](docs/checkpoints.md), [architecture](docs/architecture.md),
  and [private ingestion setup](docs/ingestion-setup.md) provide implementation evidence.

The assessment brief lists a camera-on walkthrough of five minutes or less as a
required hand-in artifact. The candidate has chosen to omit it and focus this
review on the live product and public implementation. This leaves that official
submission requirement unmet.
