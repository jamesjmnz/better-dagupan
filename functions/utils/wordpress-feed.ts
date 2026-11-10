/**
 * Shared helpers for the live feeds the portal reads from LGU WordPress sites
 * (the city's procurement notices, the council's posted ordinances). Titles
 * and links pass through unchanged apart from HTML entity decoding; nothing
 * is rewritten, stored or re-hosted.
 */

export interface WordPressFeedConfig {
  /** The site's REST base, e.g. https://example.gov.ph/wp-json/wp/v2 */
  api: string;
  postType: string;
  /** Optional taxonomy to filter by and to name terms from. */
  taxonomy?: string;
}

export interface WordPressFeedQuery {
  page: number;
  search: string;
  /** A term id in `taxonomy`, or null for every post. */
  term: number | null;
}

export interface WordPressPost {
  id: number;
  date: string;
  title: string;
  link: string;
  /** Names of the post's terms in the configured taxonomy, in feed order. */
  terms: string[];
}

export interface WordPressTerm {
  id: number;
  name: string;
  count?: number;
}

export interface RawWordPressPost {
  id: number;
  date: string;
  link: string;
  title?: { rendered?: string };
  [taxonomy: string]: unknown;
}

export const PAGE_SIZE = 20;
const MAX_SEARCH_LENGTH = 100;

/** How long the edge and the upstream fetch keep a feed response. */
export const FEED_CACHE_SECONDS = 1800;
/** Give up on a slow LGU server so the page can fall back to its own link. */
export const FEED_TIMEOUT_MS = 8000;

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

/** Decode the HTML entities WordPress puts in rendered titles. */
export function decodeEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCodePoint(parseInt(code, 16))
    )
    .replace(/&([a-z]+);/gi, (match, name) => NAMED_ENTITIES[name] ?? match)
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Read and clamp the query string the portal sends. `termParam` names the
 * parameter that carries the term id.
 */
export function parseFeedQuery(
  params: URLSearchParams,
  termParam: string
): WordPressFeedQuery {
  const page = Math.max(1, Math.min(1000, Number(params.get('page')) || 1));
  const search = (params.get('search') ?? '')
    .trim()
    .slice(0, MAX_SEARCH_LENGTH);
  const termValue = Number(params.get(termParam));
  const term = Number.isInteger(termValue) && termValue > 0 ? termValue : null;
  return { page, search, term };
}

const restBase = (config: WordPressFeedConfig) =>
  config.api.replace(/\/+$/, '');

export function buildPostsUrl(
  config: WordPressFeedConfig,
  query: WordPressFeedQuery
): string {
  const url = new URL(`${restBase(config)}/${config.postType}`);
  url.searchParams.set('per_page', String(PAGE_SIZE));
  url.searchParams.set('page', String(query.page));
  url.searchParams.set(
    '_fields',
    ['id', 'date', 'link', 'title', config.taxonomy].filter(Boolean).join(',')
  );
  if (query.search) url.searchParams.set('search', query.search);
  if (query.term && config.taxonomy) {
    url.searchParams.set(config.taxonomy, String(query.term));
  }
  return url.toString();
}

export function buildTermsUrl(config: WordPressFeedConfig): string | null {
  if (!config.taxonomy) return null;
  const url = new URL(`${restBase(config)}/${config.taxonomy}`);
  url.searchParams.set('per_page', '50');
  url.searchParams.set('_fields', 'id,name,count');
  return url.toString();
}

export function mapPost(
  raw: RawWordPressPost,
  taxonomy: string | undefined,
  termNames: Map<number, string>
): WordPressPost {
  const termIds =
    taxonomy && Array.isArray(raw[taxonomy]) ? (raw[taxonomy] as number[]) : [];
  return {
    id: raw.id,
    date: raw.date,
    title: decodeEntities(raw.title?.rendered ?? ''),
    link: raw.link,
    terms: termIds
      .map(id => termNames.get(id))
      .filter((name): name is string => Boolean(name)),
  };
}

/** Fetch one upstream JSON document, with a timeout and the edge cache. */
export async function fetchFeedJson(url: string) {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(FEED_TIMEOUT_MS),
    cf: { cacheTtl: FEED_CACHE_SECONDS, cacheEverything: true },
  } as RequestInit);
  if (!response.ok) throw new Error(`Upstream ${response.status}`);
  return { data: await response.json(), headers: response.headers };
}

/** A JSON response that the edge may cache only when it succeeded. */
export function feedJson(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control':
        status === 200 ? `public, max-age=${FEED_CACHE_SECONDS}` : 'no-store',
    },
  });
}

/**
 * Answer from the edge cache, or build the body with `load` and cache it.
 * Any failure becomes a 502 carrying `errorCode`, so the page can fall back
 * to a link to the LGU's own page.
 */
export async function serveCachedFeed(
  context: {
    request: Request;
    waitUntil: (promise: Promise<unknown>) => void;
  },
  load: () => Promise<unknown>,
  errorCode: string
): Promise<Response> {
  const cache = (caches as unknown as { default: Cache }).default;
  const cached = await cache.match(context.request);
  if (cached) return cached;

  try {
    const response = feedJson(await load());
    context.waitUntil(cache.put(context.request, response.clone()));
    return response;
  } catch (error) {
    console.error(`${errorCode}:`, error);
    return feedJson({ error: errorCode }, 502);
  }
}

/** Read the paging totals WordPress sends in its response headers. */
export function readTotals(headers: Headers, fallbackTotal: number) {
  return {
    total: Number(headers.get('X-WP-Total')) || fallbackTotal,
    totalPages: Number(headers.get('X-WP-TotalPages')) || 1,
  };
}
