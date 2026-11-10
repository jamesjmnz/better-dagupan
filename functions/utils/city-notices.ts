/**
 * Helpers for the city procurement notices feed: bid and award notices the
 * LGU posts on its own WordPress site. The shared WordPress handling lives
 * in ./wordpress-feed.
 */
import {
  buildPostsUrl,
  buildTermsUrl,
  mapPost,
  parseFeedQuery,
  type RawWordPressPost,
  type WordPressFeedConfig,
} from './wordpress-feed';

export { decodeEntities, PAGE_SIZE } from './wordpress-feed';

export interface CityNoticesConfig {
  api: string;
  postType: string;
  typeTaxonomy: string;
}

export interface CityNoticesQuery {
  page: number;
  search: string;
  type: number | null;
}

export interface CityNotice {
  id: number;
  date: string;
  title: string;
  link: string;
  type: string | null;
}

const feedConfig = (config: CityNoticesConfig): WordPressFeedConfig => ({
  api: config.api,
  postType: config.postType,
  taxonomy: config.typeTaxonomy,
});

/** Read and clamp the query string the portal sends. */
export function parseQuery(params: URLSearchParams): CityNoticesQuery {
  const { page, search, term } = parseFeedQuery(params, 'type');
  return { page, search, type: term };
}

export function buildNoticesUrl(
  config: CityNoticesConfig,
  query: CityNoticesQuery
): string {
  return buildPostsUrl(feedConfig(config), {
    page: query.page,
    search: query.search,
    term: query.type,
  });
}

export function buildTypesUrl(config: CityNoticesConfig): string {
  return buildTermsUrl(feedConfig(config)) as string;
}

export function mapNotice(
  raw: RawWordPressPost,
  typeTaxonomy: string,
  typeNames: Map<number, string>
): CityNotice {
  const { terms, ...post } = mapPost(raw, typeTaxonomy, typeNames);
  return { ...post, type: terms[0] ?? null };
}
