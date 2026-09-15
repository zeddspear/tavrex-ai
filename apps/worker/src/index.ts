/** Byte ranges for the single deliberately public demo asset. Not an upload API. */
import { ingestionApi, type IngestionEnv } from './ingestion';
export const PUBLIC_MEDIA_PATH = '/media/recording-walkthrough-optimized.webm';

type AssetBinding = { fetch(request: Request): Promise<Response> };
type ByteRange = { start: number; end: number } | 'invalid' | null;

export function parseRange(value: string | null, size: number): ByteRange {
  if (!value || !value.startsWith('bytes=') || value.includes(',')) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(value);
  if (!match || (!match[1] && !match[2])) return 'invalid';
  if (!match[1]) {
    const suffix = Number(match[2]);
    return Number.isSafeInteger(suffix) && suffix > 0
      ? { start: Math.max(0, size - suffix), end: size - 1 }
      : 'invalid';
  }
  const start = Number(match[1]);
  const end = match[2] ? Number(match[2]) : size - 1;
  if (
    !Number.isSafeInteger(start) ||
    !Number.isSafeInteger(end) ||
    start >= size ||
    end < start
  )
    return 'invalid';
  return { start, end: Math.min(end, size - 1) };
}

export default {
  async fetch(
    request: Request,
    env: { ASSETS: AssetBinding } & Partial<IngestionEnv>,
  ): Promise<Response> {
    if (new URL(request.url).pathname.startsWith('/api/'))
      return ingestionApi(request, env as IngestionEnv);
    if (new URL(request.url).pathname !== PUBLIC_MEDIA_PATH)
      return env.ASSETS.fetch(request);
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', {
        status: 405,
        headers: { Allow: 'GET, HEAD' },
      });
    }

    // ASSETS bypasses this Function. Pages itself ignores Range, so fetch one
    // full immutable ~3.4 MB demo asset and return only the requested bytes.
    const assetRequest = new Request(request.url, { method: 'GET' });
    let asset: Response;
    try {
      asset = await env.ASSETS.fetch(assetRequest);
    } catch {
      return new Response('Recording temporarily unavailable', { status: 503 });
    }
    if (!asset.ok) return asset;
    // The internal ASSETS response need not expose Content-Length, even when
    // the public edge response does. Derive range bounds from the actual bytes.
    let bytes: ArrayBuffer;
    try {
      bytes = await asset.arrayBuffer();
    } catch {
      return new Response('Recording temporarily unavailable', { status: 503 });
    }
    const size = bytes.byteLength;
    if (size <= 0 || size > 12 * 1024 * 1024) {
      return new Response('Recording temporarily unavailable', { status: 503 });
    }
    const headers = new Headers(asset.headers);
    headers.delete('Content-Encoding');
    headers.set('Content-Length', String(size));
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Content-Type', 'video/webm');
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Cache-Control', 'public, max-age=3600');
    if (request.method === 'HEAD') {
      return new Response(null, { headers });
    }

    const ifRange = request.headers.get('If-Range');
    const range = parseRange(
      ifRange && ifRange !== asset.headers.get('ETag')
        ? null
        : request.headers.get('Range'),
      size,
    );
    if (range === 'invalid') {
      return new Response(null, {
        status: 416,
        headers: {
          'Content-Range': `bytes */${size}`,
          'Accept-Ranges': 'bytes',
        },
      });
    }
    if (!range) return new Response(bytes, { headers });

    headers.set('Content-Range', `bytes ${range.start}-${range.end}/${size}`);
    headers.set('Content-Length', String(range.end - range.start + 1));
    return new Response(bytes.slice(range.start, range.end + 1), {
      status: 206,
      headers,
    });
  },
};
