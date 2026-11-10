/**
 * Helpers for the council ordinances feed: the ordinances the local council
 * posts on its own WordPress site. This is a live, link-back listing, not a
 * source of records for the legislative database.
 *
 * The feed's `date` is when the item was posted on the council's site, not
 * when the ordinance was enacted, and the feed carries no ordinance number,
 * so neither is reported.
 */
import {
  buildPostsUrl,
  buildTermsUrl,
  decodeEntities,
  mapPost,
  parseFeedQuery,
  type RawWordPressPost,
  type WordPressFeedConfig,
  type WordPressTerm,
} from './wordpress-feed';

export interface CouncilFeedConfig extends WordPressFeedConfig {
  pageUrl: string;
}

export interface CouncilOrdinancesQuery {
  page: number;
  search: string;
  classification: number | null;
}

export interface CouncilOrdinance {
  id: number;
  /** When the council posted it on its site (not the enactment date). */
  postedAt: string;
  title: string;
  link: string;
  classifications: string[];
}

/** Read and clamp the query string the portal sends. */
export function parseOrdinancesQuery(
  params: URLSearchParams
): CouncilOrdinancesQuery {
  const { page, search, term } = parseFeedQuery(params, 'classification');
  return { page, search, classification: term };
}

export function buildOrdinancesUrl(
  config: CouncilFeedConfig,
  query: CouncilOrdinancesQuery
): string {
  return buildPostsUrl(config, {
    page: query.page,
    search: query.search,
    term: query.classification,
  });
}

/** The classifications list, or null when no taxonomy is configured. */
export function buildClassificationsUrl(
  config: CouncilFeedConfig
): string | null {
  return buildTermsUrl(config);
}

/** Decode term names and drop terms that tag no ordinance. */
export function mapClassifications(raw: unknown): WordPressTerm[] {
  if (!Array.isArray(raw)) return [];
  return (raw as WordPressTerm[])
    .filter(term => Number.isInteger(term?.id) && term.count !== 0)
    .map(term => ({
      id: term.id,
      name: decodeEntities(String(term.name ?? '')),
      ...(typeof term.count === 'number' ? { count: term.count } : {}),
    }));
}

export function mapOrdinance(
  raw: RawWordPressPost,
  taxonomy: string | undefined,
  classificationNames: Map<number, string>
): CouncilOrdinance {
  const post = mapPost(raw, taxonomy, classificationNames);
  return {
    id: post.id,
    postedAt: post.date,
    title: post.title,
    link: post.link,
    classifications: post.terms,
  };
}
