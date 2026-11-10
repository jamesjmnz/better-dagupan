/**
 * Council ordinances
 * GET /api/council-ordinances?page=&search=&classification=
 *
 * Proxies the ordinances the local council posts on its own website, so the
 * OpenLGU page has something to show while the legislative database is not
 * bound. Responses are cached at the edge for 30 minutes to spare the
 * council's server; nothing is stored, and links point back to the council's
 * own pages.
 */
import lguConfig from '../../config/lgu.config.json';
import {
  buildClassificationsUrl,
  buildOrdinancesUrl,
  type CouncilFeedConfig,
  mapClassifications,
  mapOrdinance,
  parseOrdinancesQuery,
} from '../utils/council-ordinances';
import {
  feedJson,
  fetchFeedJson,
  PAGE_SIZE,
  type RawWordPressPost,
  readTotals,
  serveCachedFeed,
} from '../utils/wordpress-feed';

const feed = (lguConfig as { openlgu?: { councilFeed?: CouncilFeedConfig } })
  .openlgu?.councilFeed;

export async function onRequestGet(context: {
  request: Request;
  waitUntil: (promise: Promise<unknown>) => void;
}) {
  if (!feed?.api || !feed.postType) {
    return feedJson({ error: 'council_ordinances_not_configured' }, 404);
  }

  const query = parseOrdinancesQuery(new URL(context.request.url).searchParams);
  const classificationsUrl = buildClassificationsUrl(feed);

  return serveCachedFeed(
    context,
    async () => {
      const [ordinances, classifications] = await Promise.all([
        fetchFeedJson(buildOrdinancesUrl(feed, query)),
        classificationsUrl ? fetchFeedJson(classificationsUrl) : null,
      ]);
      if (!Array.isArray(ordinances.data)) {
        throw new Error('Unexpected ordinances response');
      }
      const classificationList = mapClassifications(classifications?.data);
      const names = new Map(classificationList.map(c => [c.id, c.name]));
      const items = (ordinances.data as RawWordPressPost[]).map(raw =>
        mapOrdinance(raw, feed.taxonomy, names)
      );
      return {
        items,
        page: query.page,
        pageSize: PAGE_SIZE,
        ...readTotals(ordinances.headers, items.length),
        classifications: classificationList,
      };
    },
    'council_ordinances_unavailable'
  );
}
