import civicSourcesRaw from '@/data/sources/civic-sources.json';

import type { CivicSource } from '@/types/civicSourceTypes';

/**
 * Lookup for the civic-source citations that back every published record.
 *
 * Records store source ids rather than embedded citations, so one document is
 * described in exactly one place and a re-verification updates every record
 * that cites it. See src/types/civicSourceTypes.ts for why these are called
 * civic sources and not OpenLGU source records.
 */
const civicSources = civicSourcesRaw as CivicSource[];

const byId = new Map(civicSources.map(source => [source.id, source]));

/** Every citation, in the order they are declared. */
export const allCivicSources = (): CivicSource[] => [...civicSources];

/**
 * Resolve one citation.
 *
 * Throws rather than returning undefined: an unresolvable id means a published
 * record claims a provenance that does not exist, which must fail loudly in
 * tests and in the build rather than render as a blank source line.
 */
export function getCivicSource(id: string): CivicSource {
  const source = byId.get(id);

  if (!source) {
    throw new Error(
      `Unknown civic source "${id}". Add it to src/data/sources/civic-sources.json before citing it.`
    );
  }

  return source;
}

/** Resolve a record's `sources` list for rendering, preserving its order. */
export function resolveCivicSources(ids: readonly string[]): CivicSource[] {
  return ids.map(getCivicSource);
}

/** True when the id is known. For validation paths that must not throw. */
export function hasCivicSource(id: string): boolean {
  return byId.has(id);
}

/**
 * The most recent verification date across a record's citations, which is the
 * honest "last verified" figure for that record: it is only as current as its
 * least recently checked source, but the record as a whole was reviewed when
 * the newest of them was.
 */
export function latestVerifiedDate(ids: readonly string[]): string | null {
  const dates = resolveCivicSources(ids)
    .map(source => source.verified)
    .sort();

  return dates.length > 0 ? dates[dates.length - 1] : null;
}

/** Render an ISO date as e.g. "22 August 2026". */
export function formatVerificationDate(isoDate: string): string {
  const parsed = new Date(`${isoDate}T00:00:00Z`);

  if (Number.isNaN(parsed.getTime())) return isoDate;

  return new Intl.DateTimeFormat('en-PH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsed);
}
