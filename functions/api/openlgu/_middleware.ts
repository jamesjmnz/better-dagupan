import { Env } from '../../types';

interface MiddlewareContext {
  env: Partial<Env>;
  next: () => Promise<Response>;
}

/**
 * The legislative database is bound only once Dagupan's records exist.
 * Until then every OpenLGU endpoint answers 503 instead of throwing.
 */
export async function onRequest(context: MiddlewareContext) {
  if (!context.env.BETTERLB_DB) {
    return new Response(
      JSON.stringify({ error: 'legislative_data_unavailable' }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      }
    );
  }
  return context.next();
}
