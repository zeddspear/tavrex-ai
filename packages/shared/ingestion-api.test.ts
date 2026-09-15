import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ingestionApi,
  type IngestionEnv,
} from '../../apps/worker/src/ingestion';

const env = {
  SUPABASE_URL: 'https://database.example',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service',
  R2_ACCOUNT_ID: 'test',
  R2_BUCKET_NAME: 'test',
  R2_ACCESS_KEY_ID: 'test',
  R2_SECRET_ACCESS_KEY: 'test',
  AI: { run: vi.fn() },
} satisfies IngestionEnv;
afterEach(() => vi.unstubAllGlobals());

describe('private ingestion API', () => {
  it('persists transcription before analysis and retries only the failed analysis step', async () => {
    let row: Record<string, unknown> = {
      id: '77777777-7777-4777-8777-777777777777',
      title: 'Test conversation',
      media_type: 'video/webm',
      media_size: 4,
      duration_seconds: 104,
      status: 'uploaded',
      processing_progress: 30,
      processing_error: null,
      created_at: '2026-09-14T12:00:00Z',
      transcript: null,
      intelligence: null,
      owner_hash: 'b'.repeat(64),
      storage_key: 'uploads/test',
      processing_lease: null,
      processing_started_at: null,
      processing_attempts: 0,
      media_uploaded_at: '2026-09-14T12:00:00Z',
    };
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string | Request, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : input.url;
        if (url.startsWith(env.SUPABASE_URL)) {
          if (init?.method === 'PATCH')
            row = { ...row, ...JSON.parse(String(init.body)) };
          return Response.json([row]);
        }
        return new Response(new Uint8Array([1, 2, 3, 4]), {
          headers: { 'Content-Length': '4' },
        });
      }),
    );
    let analysisFails = true;
    const run = vi.fn(async (model: string) => {
      if (model.includes('whisper'))
        return {
          text: 'We will review the plan.',
          segments: [{ start: 2.7, end: 8, text: 'We will review the plan.' }],
        };
      expect(row.transcript).not.toBeNull();
      expect(row.status).toBe('analyzing');
      if (analysisFails) throw new Error('Provider failure');
      return {
        response: {
          actions: [],
          ...Object.fromEntries(
            ['general', 'sales_customer', 'recruiting_interview'].map((key) => [
              key,
              {
                title: 'Plan review',
                overview: 'A plan review was discussed.',
                sections: ['Discussion', 'Next step'].map((title) => ({
                  title,
                  items:
                    key === 'recruiting_interview'
                      ? []
                      : [{ text: 'Review the plan.', source: 2.7 }],
                })),
              },
            ]),
          ),
        },
      };
    });
    const request = () =>
      new Request(
        'https://app.example/api/uploads/77777777-7777-4777-8777-777777777777/process',
        {
          method: 'POST',
          headers: {
            Cookie: `__Host-tavrex=${'a'.repeat(64)}`,
            Origin: 'https://app.example',
            'Content-Type': 'application/json',
          },
          body: '{}',
        },
      );
    const failed = await ingestionApi(request(), { ...env, AI: { run } });
    const result = (await failed.json()) as {
      status: string;
      processing_error: string;
      transcript: unknown[];
    };
    expect(result.status).toBe('failed');
    expect(result.processing_error).toBe('analysis_failed');
    expect(result.transcript).toHaveLength(1);
    analysisFails = false;
    const recovered = await ingestionApi(request(), { ...env, AI: { run } });
    expect(((await recovered.json()) as { status: string }).status).toBe(
      'complete',
    );
    expect(
      run.mock.calls.filter(([model]) => model.includes('whisper')),
    ).toHaveLength(1);
  });
  it('leaves the public demo independent of credentials or guest authentication', async () => {
    const response = await ingestionApi(
      new Request('https://app.example/api/uploads'),
      {} as IngestionEnv,
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([]);
    expect(response.headers.get('Cache-Control')).toContain('no-store');
  });
  it('creates an HttpOnly secure guest cookie without returning its value as JSON', async () => {
    const response = await ingestionApi(
      new Request('https://app.example/api/session', {
        method: 'POST',
        headers: {
          Origin: 'https://app.example',
          'Content-Type': 'application/json',
        },
        body: '{}',
      }),
      env,
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('Set-Cookie')).toMatch(
      /^__Host-tavrex=[a-f0-9]{64}; Path=\/; HttpOnly; Secure; SameSite=Strict;/,
    );
    expect(await response.json()).toEqual({ ready: true });
  });
  it('rejects cross-origin writes and unauthenticated private media', async () => {
    const external = await ingestionApi(
      new Request('https://app.example/api/session', {
        method: 'POST',
        headers: {
          Origin: 'https://elsewhere.example',
          'Content-Type': 'application/json',
        },
        body: '{}',
      }),
      env,
    );
    expect(external.status).toBe(403);
    const media = await ingestionApi(
      new Request(
        'https://app.example/api/uploads/77777777-7777-4777-8777-777777777777/media',
      ),
      env,
    );
    expect(media.status).toBe(401);
  });
  it('scopes database reads to a cookie digest and never returns another visitor’s row', async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json([]));
    vi.stubGlobal('fetch', fetcher);
    const response = await ingestionApi(
      new Request(
        'https://app.example/api/uploads/77777777-7777-4777-8777-777777777777',
        {
          headers: { Cookie: `__Host-tavrex=${'a'.repeat(64)}` },
        },
      ),
      env,
    );
    expect(response.status).toBe(404);
    expect(fetcher.mock.calls[0][0]).toMatch(/owner_hash=eq\.[a-f0-9]{64}$/);
    expect(fetcher.mock.calls[0][0]).not.toContain('a'.repeat(64));
  });
  it('does not expose provider errors or service credentials', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          Response.json(
            { message: 'private-provider-diagnostic' },
            { status: 500 },
          ),
        ),
    );
    const response = await ingestionApi(
      new Request('https://app.example/api/uploads', {
        headers: { Cookie: `__Host-tavrex=${'a'.repeat(64)}` },
      }),
      env,
    );
    expect(response.status).toBe(503);
    const text = await response.text();
    expect(text).not.toContain('private-provider-diagnostic');
    expect(text).not.toContain(env.SUPABASE_SERVICE_ROLE_KEY);
  });
});
