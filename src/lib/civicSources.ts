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
 * The verification date a record as a whole can honestly claim: the OLDEST
 * verification date among its citations.
 *
 * A record is only as current as its least recently checked source. Reporting
 * the newest date would overstate freshness - a record citing one source
 * checked in June and another in August would advertise August while part of
 * its evidence had gone unchecked for two months. Understating freshness is
 * the safe direction to be wrong in.
 *
 * Per-source dates are shown alongside each source in SourceNote, so nothing
 * is hidden by taking the minimum here.
 */
export function earliestVerificationDate(
  ids: readonly string[]
): string | null {
  // ISO-8601 dates sort lexicographically, so plain string comparison is
  // enough and avoids constructing Date objects just to order them.
  const dates = resolveCivicSources(ids)
    .map(source => source.verified)
    .sort();

  return dates.length > 0 ? dates[0] : null;
}

/**
 * Map an i18next language tag onto the locale used to format dates.
 *
 * i18next may hand back "en", "en-US", "fil" or "fil-PH" depending on how the
 * language was detected, so match on the primary subtag rather than the whole
 * tag. Anything unrecognised falls back to English rather than to the host's
 * locale, so the output cannot vary with the reader's machine settings.
 */
export function verificationDateLocale(language?: string): string {
  const primary = (language ?? '').toLowerCase().split('-')[0];

  if (primary === 'fil' || primary === 'tl') return 'fil-PH';

  return 'en-PH';
}

/**
 * Render an ISO date for display, e.g. "August 22, 2026" / "Agosto 22, 2026".
 *
 * Parsed as UTC and formatted in UTC so the calendar day cannot shift: a date
 * recorded as 2026-08-22 must never render as the 21st for a reader west of
 * the meridian.
 */
export function formatVerificationDate(
  isoDate: string,
  language?: string
): string {
  const parsed = new Date(`${isoDate}T00:00:00Z`);

  if (Number.isNaN(parsed.getTime())) return isoDate;

  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  };

  try {
    return new Intl.DateTimeFormat(
      verificationDateLocale(language),
      options
    ).format(parsed);
  } catch {
    // A structurally invalid tag makes Intl throw. A citation must still
    // render its date rather than take the page down with it.
    return new Intl.DateTimeFormat('en-PH', options).format(parsed);
  }
}
