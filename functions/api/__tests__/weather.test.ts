import { describe, expect, it } from 'vitest';

import type { Env } from '../../types';
import { onRequest } from '../weather';

const ctx = { waitUntil: () => {} } as unknown as ExecutionContext;

describe('weather endpoint', () => {
  it('answers 503 when no API key or cache is configured', async () => {
    const res = await onRequest({
      request: new Request('http://localhost:8788/api/weather?city=Dagupan'),
      env: {} as Env,
      ctx,
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
      ctx,
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(cached);
  });
});
