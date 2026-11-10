/**
 * City procurement notices
 * GET /api/city-procurement?page=&search=&type=
 *
 * Proxies the bid and award notices the LGU posts on its own website, so the
 * portal can list them next to PhilGEPS records. Responses are cached at the
 * edge for 30 minutes to spare the city's server; links point back to the
 * city's own pages.
 */
import lguConfig from '../../config/lgu.config.json';
import {
  buildNoticesUrl,
  buildTypesUrl,
  type CityNoticesConfig,
  mapNotice,
  PAGE_SIZE,
  parseQuery,
} from '../utils/city-notices';

const CACHE_SECONDS = 1800;

const feed = (
  lguConfig.transparency.procurement as { cityNotices?: CityNoticesConfig }
).cityNotices;

function json(body: unknown, status = 200, maxAge = CACHE_SECONDS) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control':
        status === 200 ? `public, max-age=${maxAge}` : 'no-store',
    },
  });
}

async function fetchJson(url: string) {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    cf: { cacheTtl: CACHE_SECONDS, cacheEverything: true },
  } as RequestInit);
  if (!response.ok) throw new Error(`Upstream ${response.status}`);
  return { data: await response.json(), headers: response.headers };
}

export async function onRequestGet(context: {
  request: Request;
  waitUntil: (promise: Promise<unknown>) => void;
}) {
  if (!feed?.api) return json({ error: 'city_notices_not_configured' }, 404);

  const cache = (caches as unknown as { default: Cache }).default;
  const cached = await cache.match(context.request);
  if (cached) return cached;

  const query = parseQuery(new URL(context.request.url).searchParams);

  try {
    const [notices, types] = await Promise.all([
      fetchJson(buildNoticesUrl(feed, query)),
      fetchJson(buildTypesUrl(feed)),
    ]);
    const typeList = (types.data as { id: number; name: string }[]) ?? [];
    const typeNames = new Map(typeList.map(t => [t.id, t.name]));
    const items = (notices.data as Parameters<typeof mapNotice>[0][]).map(raw =>
      mapNotice(raw, feed.typeTaxonomy, typeNames)
    );
    const response = json({
      items,
      page: query.page,
      pageSize: PAGE_SIZE,
      total: Number(notices.headers.get('X-WP-Total')) || items.length,
      totalPages: Number(notices.headers.get('X-WP-TotalPages')) || 1,
      types: typeList,
    });
    context.waitUntil(cache.put(context.request, response.clone()));
    return response;
  } catch (error) {
    console.error('City notices fetch failed:', error);
    return json({ error: 'city_notices_unavailable' }, 502);
  }
}
