# Checkpoint A architecture

```text
Clean browser → Cloudflare Pages (deployment pending)
                    ↓
              React / Vite SPA
                    ↓
       Zod-validated public synthetic fixtures
```

No credentials, backend, authentication, private rows, or external media are
required to run this checkpoint. The dashboard loads only compact meeting
metadata and sample overviews; future transcript payloads should load on detail.

`packages/shared/meeting.ts` defines the initial contract. All fixtures explicitly
declare synthetic provenance. Public deployment does not expose local references.

The later media/ingestion checkpoints use the specified Workers, Supabase and R2
stack. Those services are deliberately not scaffolded before access is available
and the public entry checkpoint passes. No database or AI capability is claimed.
