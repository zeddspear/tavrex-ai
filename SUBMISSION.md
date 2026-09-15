# Tavrex AI assessment hand-in

- **Live application:** https://tavrex-ai.pages.dev
- **Public repository:** https://github.com/zeddspear/tavrex-ai
- **Camera-on walkthrough (5 minutes maximum):** pending recording link

The live app opens directly to four seeded conversations. One uses a permissioned,
sanitized real recording with an imported timestamped transcript; the other three
are clearly labeled synthetic examples. The real recording's prepared summaries
are disclosed as demo output. New private uploads use live transcription and
analysis, stored separately from public fixtures.

## Five-minute recording route

Record the **live URL** with your camera visible. Rehearse in the browser you will
record; public sharing can be opened in a separate clean/incognito window.

| Time      | Show                                                                                                                          | Say briefly                                                                                                                                                                                         |
| --------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0:00–0:20 | Landing dashboard and four meetings                                                                                           | Tavrex returns you to the source of a decision. Capture is upload-first; conferencing bots are intentionally omitted.                                                                               |
| 0:20–1:10 | Open **From conversation to recording**; play/pause; click a transcript timestamp                                             | The transcript and player stay synchronized. This seeded recording uses imported source timestamps.                                                                                                 |
| 1:10–1:50 | General → Sales / Customer → Recruiting / Interview; click an action's source time                                            | The views differ by purpose and ground claims in recording timestamps. Unsupported recruiting claims are withheld.                                                                                  |
| 1:50–2:35 | Save a moment from the 1:37 transcript turn; title it; open the public view                                                   | A moment is a bounded timestamp reference, so there is no transcoding delay.                                                                                                                        |
| 2:35–2:55 | Show that public view in a separate clean window                                                                              | It opens without a workspace account and includes transcript context.                                                                                                                               |
| 2:55–3:30 | Return to Meetings; search `video is not getting recorded`; open its transcript result                                        | Search returns a contextual source rather than only a meeting title.                                                                                                                                |
| 3:30–4:20 | Open **Upload recording**; choose a permissioned file; start upload; show processing and an already processed private meeting | New recordings go directly to private storage. Whisper stores actual timestamped speech before summary generation. Show the earlier processed recording separately if this upload is still working. |
| 4:20–4:40 | Briefly show the responsive layout or an empty/retry state                                                                    | The experience remains readable and recoverable.                                                                                                                                                    |
| 4:40–5:00 | Public repository and `.agent-logs/`                                                                                          | The repository includes capture evidence. Bots, diarization, account recovery, and automatic storage cleanup were deferred in favor of this working post-meeting flow.                              |

A full 1:44 file can take longer than the 50-second upload segment to transcribe.
Before recording, upload one permitted demo file in the same browser and confirm
its private meeting shows a saved transcript and analysis. In the recording, start
another permitted upload to show the real progress state, then open the earlier
completed private meeting. Make clear they are separate recordings. The demo
allowance is three uploads per browser per rolling day; avoid repeated rehearsals
that consume the quota.

## Reviewer notes

- Public meeting/moment flows need no credentials. Private uploaded meetings require
  the seven-day guest cookie from the browser that uploaded them; incognito visitors
  cannot see them.
- The public moment route works only for the permissioned public seeded recording.
- File limits are 25 MB and ten minutes. Provider and workspace quotas are bounded;
  processing uses a foreground request with check/resume and retry states.
- The app has no live conferencing bot or calendar integration. The real public
  recording's transcript and summaries are imported/prepared; private uploads run
  live Whisper and Llama models.
- [Checkpoint verification](docs/checkpoints.md), [architecture](docs/architecture.md),
  and [private ingestion setup](docs/ingestion-setup.md) provide implementation evidence.

Replace the pending walkthrough field with the final share URL after verifying that
it opens externally, includes camera video, and runs no longer than five minutes.
