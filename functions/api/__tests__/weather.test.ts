import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Env } from '../../types';
import { onRequest } from '../weather';

const waitUntil = vi.fn();

afterEach(() => {
  vi.unstubAllGlobals();
  waitUntil.mockClear();
});

describe('weather endpoint', () => {
  it('answers 503 when no API key or cache is configured', async () => {
    const res = await onRequest({
      request: new Request('http://localhost:8788/api/weather?city=Dagupan'),
      env: {} as Env,
      waitUntil,
    });
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: 'weather_unavailable' });
  });

  it('serves the cached city when a KV namespace is bound', async () => {
    const cached = { dagupan: { name: 'Dagupan' } };
    const kv = { get: async () => cached } as unknown as KVNamespace;
    const res = await onRequest({
      request: new Request('http://localhost:8788/api/weather?city=Dagupan'),
      env: { WEATHER_KV: kv } as Env,
      waitUntil,
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(cached);
  });

  it('fetches live weather with a key and hands the cache write to waitUntil', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({ name: 'Dagupan', weather: [], list: [] })
      )
    );
    const res = await onRequest({
      request: new Request('http://localhost:8788/api/weather?city=Dagupan'),
      env: { OPENWEATHERMAP_API_KEY: 'test-key' } as Env,
      waitUntil,
    });
    expect(res.status).toBe(200);
    expect(Object.keys((await res.json()) as object)).toHaveLength(1);
    expect(waitUntil).toHaveBeenCalledOnce();
  });
});
