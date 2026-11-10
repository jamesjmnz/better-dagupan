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
import {
  feedJson,
  fetchFeedJson,
  readTotals,
  serveCachedFeed,
} from '../utils/wordpress-feed';

const feed = (
  lguConfig.transparency.procurement as { cityNotices?: CityNoticesConfig }
).cityNotices;

export async function onRequestGet(context: {
  request: Request;
  waitUntil: (promise: Promise<unknown>) => void;
}) {
  if (!feed?.api)
    return feedJson({ error: 'city_notices_not_configured' }, 404);

  const query = parseQuery(new URL(context.request.url).searchParams);

  return serveCachedFeed(
    context,
    async () => {
      const [notices, types] = await Promise.all([
        fetchFeedJson(buildNoticesUrl(feed, query)),
        fetchFeedJson(buildTypesUrl(feed)),
      ]);
      const typeList = (types.data as { id: number; name: string }[]) ?? [];
      const typeNames = new Map(typeList.map(t => [t.id, t.name]));
      const items = (notices.data as Parameters<typeof mapNotice>[0][]).map(
        raw => mapNotice(raw, feed.typeTaxonomy, typeNames)
      );
      return {
        items,
        page: query.page,
        pageSize: PAGE_SIZE,
        ...readTotals(notices.headers, items.length),
        types: typeList,
      };
    },
    'city_notices_unavailable'
  );
}
