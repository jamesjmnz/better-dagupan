/**
 * Helpers for the city procurement notices feed: bid and award notices the
 * LGU posts on its own WordPress site. Titles and links pass through
 * unchanged apart from HTML entity decoding; nothing is rewritten.
 */

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

interface RawNotice {
  id: number;
  date: string;
  link: string;
  title?: { rendered?: string };
  [taxonomy: string]: unknown;
}

export const PAGE_SIZE = 20;
const MAX_SEARCH_LENGTH = 100;

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

/** Read and clamp the query string the portal sends. */
export function parseQuery(params: URLSearchParams): CityNoticesQuery {
  const page = Math.max(1, Math.min(1000, Number(params.get('page')) || 1));
  const search = (params.get('search') ?? '')
    .trim()
    .slice(0, MAX_SEARCH_LENGTH);
  const typeParam = Number(params.get('type'));
  const type = Number.isInteger(typeParam) && typeParam > 0 ? typeParam : null;
  return { page, search, type };
}

export function buildNoticesUrl(
  config: CityNoticesConfig,
  query: CityNoticesQuery
): string {
  const url = new URL(`${config.api.replace(/\/+$/, '')}/${config.postType}`);
  url.searchParams.set('per_page', String(PAGE_SIZE));
  url.searchParams.set('page', String(query.page));
  url.searchParams.set('_fields', `id,date,link,title,${config.typeTaxonomy}`);
  if (query.search) url.searchParams.set('search', query.search);
  if (query.type) url.searchParams.set(config.typeTaxonomy, String(query.type));
  return url.toString();
}

export function buildTypesUrl(config: CityNoticesConfig): string {
  const url = new URL(
    `${config.api.replace(/\/+$/, '')}/${config.typeTaxonomy}`
  );
  url.searchParams.set('per_page', '50');
  url.searchParams.set('_fields', 'id,name,count');
  return url.toString();
}

export function mapNotice(
  raw: RawNotice,
  typeTaxonomy: string,
  typeNames: Map<number, string>
): CityNotice {
  const typeIds = Array.isArray(raw[typeTaxonomy])
    ? (raw[typeTaxonomy] as number[])
    : [];
  const typeName = typeIds.map(id => typeNames.get(id)).find(Boolean) ?? null;
  return {
    id: raw.id,
    date: raw.date,
    title: decodeEntities(raw.title?.rendered ?? ''),
    link: raw.link,
    type: typeName,
  };
}
