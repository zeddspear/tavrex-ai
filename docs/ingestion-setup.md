# Checkpoint F setup — pending access

Checkpoint E remains the deployed product. The ingestion contract and SQL migration
are preparation only; no upload UI or transcription capability has been deployed.

## Required access

Supply these server-only values in the already ignored `.dev.vars` file:

```dotenv
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
```

Use a Supabase project dedicated to Tavrex and an R2 token with Object Read & Write
permissions. Never put these values in chat, a `VITE_` variable, or a tracked file.
The Cloudflare login is available, but no R2 bucket or Pages secrets were configured
when this checkpoint was inspected. Workers AI will use a server binding.

The migration at `supabase/migrations/202609150001_private_ingestion.sql` is ready
for review and must be applied through the project's SQL editor or an authorized
database connection before the API is enabled. It has not been applied here.

## Smallest complete flow

1. Validate the recording in the browser and on the server. Initial demo limits are
   25 MB and 10 minutes, explicitly displayed to the uploader. This is a reduced
   demo limit permitted by the specification's configurable-limits requirement.
2. Create a private meeting row scoped to an opaque guest session. Set an HttpOnly,
   Secure cookie; store only its digest in the database. Keep public fixture access
   independent of this session.
3. Issue a short-lived signed R2 PUT URL with the expected content type. Configure
   bucket CORS for the application origin. Upload directly from the browser.
4. Verify the stored object's size/type before invoking speech-to-text. Reject or
   delete objects that violate the declared limits.
5. Transcribe through Workers AI; normalize actual provider timestamps and persist
   the transcript before requesting analysis. A neutral speaker label must be used
   when speaker identity is unavailable.
6. Reuse the existing meeting composition and timestamp seek behavior. Present real
   processing, empty transcript, failure, and retry states. Analysis failure must
   retain the transcript and retry without re-uploading or re-transcribing.
7. Verify a real upload on the deployment, transcript persistence after reload,
   isolation from a second browser, media seeking, retry, and the existing A–E suite.

Processing requests need an atomic lease with a stale timeout, and upload/model
quotas must bound use of the free-tier services. No user-provided recording or
transcript is added to public fixtures or assessment logs.

## Provider references

- [Cloudflare R2 signed URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/)
- [R2 browser CORS](https://developers.cloudflare.com/r2/buckets/cors/)
- [Workers AI Whisper output](https://developers.cloudflare.com/workers-ai/models/whisper-large-v3-turbo/)

No live ingestion acceptance pass can be claimed until these services are
configured and the entire deployed user path has been exercised.
