import { verificationDateLocale } from '@/lib/civicSources';

/**
 * Display and ordering helpers for the dates on the history timeline.
 *
 * A milestone's date is stored only as precisely as its source states it:
 * "1947", "1947-06" or "1947-06-20". Rendering "1947" as "January 1, 1947"
 * would invent a day the source never gave, so each precision is formatted
 * on its own terms.
 */
const PARTIAL_DATE = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/;

export type HistoryDatePrecision = 'year' | 'month' | 'day';

/** The precision a stored date carries, or null when it is malformed. */
export function historyDatePrecision(
  value: string
): HistoryDatePrecision | null {
  const match = PARTIAL_DATE.exec(value);
  if (!match) return null;

  const [, year, month, day] = match;
  const parsed = new Date(
    Date.UTC(Number(year), Number(month ?? '1') - 1, Number(day ?? '1'))
  );

  // Reject impossible calendar dates such as 1947-02-30, which Date would
  // otherwise roll silently into March.
  if (
    parsed.getUTCFullYear() !== Number(year) ||
    parsed.getUTCMonth() !== Number(month ?? '1') - 1 ||
    parsed.getUTCDate() !== Number(day ?? '1')
  ) {
    return null;
  }

  if (day) return 'day';
  if (month) return 'month';
  return 'year';
}

/**
 * Render a stored date for display, e.g. "June 20, 1947" / "Hunyo 20, 1947",
 * "June 1947", or "1947". Formatted in UTC so the calendar day cannot shift
 * with the reader's time zone. A malformed value is returned unchanged rather
 * than hidden.
 */
export function formatHistoryDate(value: string, language?: string): string {
  const precision = historyDatePrecision(value);
  if (!precision || precision === 'year') return value;

  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day ?? 1));

  const options: Intl.DateTimeFormatOptions =
    precision === 'day'
      ? { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }
      : { month: 'long', year: 'numeric', timeZone: 'UTC' };

  try {
    return new Intl.DateTimeFormat(
      verificationDateLocale(language),
      options
    ).format(parsed);
  } catch {
    return new Intl.DateTimeFormat('en-PH', options).format(parsed);
  }
}

/** The year a stored date falls in, for the compact timeline marker. */
export function historyDateYear(value: string): string {
  return value.slice(0, 4);
}
