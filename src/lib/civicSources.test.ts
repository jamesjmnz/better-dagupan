import { describe, expect, it, vi } from 'vitest';

/**
 * Behavioural tests for the civic-source helpers, against synthetic sources
 * with deliberately DIFFERENT verification dates.
 *
 * The real citations in src/data/sources/civic-sources.json were all verified
 * on the same day, so they cannot distinguish "oldest" from "newest" and a
 * test built on them would pass whichever the implementation picked. That is
 * exactly how the original bug survived: the helper returned the newest date
 * while its own comment described the oldest. These fixtures make the two
 * answers different, so the wrong one fails.
 */
vi.mock('@/data/sources/civic-sources.json', () => ({
  default: [
    {
      id: 'stale-source',
      agency: 'Agency A',
      title: 'Checked long ago',
      url: 'https://example.gov.ph/a',
      published: null,
      data_as_of: null,
      coverage: null,
      retrieved: '2026-06-01',
      verified: '2026-06-01',
      derives_from: null,
    },
    {
      id: 'fresh-source',
      agency: 'Agency B',
      title: 'Checked recently',
      url: 'https://example.gov.ph/b',
      published: null,
      data_as_of: null,
      coverage: null,
      retrieved: '2026-08-22',
      verified: '2026-08-22',
      derives_from: null,
    },
    {
      id: 'middle-source',
      agency: 'Agency C',
      title: 'Checked in between',
      url: 'https://example.gov.ph/c',
      published: null,
      data_as_of: null,
      coverage: null,
      retrieved: '2026-07-15',
      verified: '2026-07-15',
      derives_from: null,
    },
  ],
}));

const {
  earliestVerificationDate,
  formatVerificationDate,
  verificationDateLocale,
} = await import('./civicSources');

describe('earliestVerificationDate()', () => {
  it('reports the OLDEST date, not the newest', () => {
    const ids = ['fresh-source', 'stale-source'];

    // The bug: returning 2026-08-22 would tell a reader the whole record was
    // checked in August when half its evidence had not been looked at since
    // June.
    expect(earliestVerificationDate(ids)).toBe('2026-06-01');
    expect(earliestVerificationDate(ids)).not.toBe('2026-08-22');
  });

  it('does not depend on the order the sources are cited in', () => {
    expect(earliestVerificationDate(['stale-source', 'fresh-source'])).toBe(
      '2026-06-01'
    );
    expect(earliestVerificationDate(['fresh-source', 'stale-source'])).toBe(
      '2026-06-01'
    );
  });

  it('picks the oldest of three rather than the median or the newest', () => {
    expect(
      earliestVerificationDate([
        'fresh-source',
        'middle-source',
        'stale-source',
      ])
    ).toBe('2026-06-01');
  });

  it('returns the single date when only one source is cited', () => {
    expect(earliestVerificationDate(['middle-source'])).toBe('2026-07-15');
  });

  it('returns null when nothing is cited', () => {
    expect(earliestVerificationDate([])).toBeNull();
  });

  it('refuses to guess for an unknown source', () => {
    expect(() => earliestVerificationDate(['no-such-source'])).toThrow(
      /Unknown civic source/
    );
  });
});

describe('verificationDateLocale()', () => {
  it('maps English and Filipino to their Philippine locales', () => {
    expect(verificationDateLocale('en')).toBe('en-PH');
    expect(verificationDateLocale('fil')).toBe('fil-PH');
  });

  it('matches on the primary subtag, as i18next may return a region', () => {
    expect(verificationDateLocale('en-US')).toBe('en-PH');
    expect(verificationDateLocale('fil-PH')).toBe('fil-PH');
    expect(verificationDateLocale('FIL')).toBe('fil-PH');
    // "tl" is the older tag for Filipino and still appears in the wild.
    expect(verificationDateLocale('tl-PH')).toBe('fil-PH');
  });

  it('falls back to English rather than to the host locale', () => {
    expect(verificationDateLocale(undefined)).toBe('en-PH');
    expect(verificationDateLocale('')).toBe('en-PH');
    expect(verificationDateLocale('de')).toBe('en-PH');
  });
});

describe('formatVerificationDate()', () => {
  it('formats in English when the language is English', () => {
    const formatted = formatVerificationDate('2026-08-22', 'en');

    expect(formatted).toMatch(/August/);
    expect(formatted).toMatch(/22/);
    expect(formatted).toMatch(/2026/);
  });

  it('formats in Filipino when the language is Filipino', () => {
    const formatted = formatVerificationDate('2026-08-22', 'fil');

    // "Agosto", not "August" - proving the language actually reached Intl.
    expect(formatted).toMatch(/Agosto/);
    expect(formatted).not.toMatch(/August/);
    expect(formatted).toMatch(/22/);
    expect(formatted).toMatch(/2026/);
  });

  it('produces different output for the two languages', () => {
    expect(formatVerificationDate('2026-08-22', 'fil')).not.toBe(
      formatVerificationDate('2026-08-22', 'en')
    );
  });

  it('parses as UTC so the calendar day cannot shift', () => {
    // A reader west of the meridian must not see the 21st. Local-time parsing
    // of "2026-01-01" is the classic way this goes wrong.
    for (const lang of ['en', 'fil']) {
      expect(formatVerificationDate('2026-01-01', lang)).toMatch(/\b1\b/);
      expect(formatVerificationDate('2026-01-01', lang)).toMatch(/2026/);
      expect(formatVerificationDate('2026-12-31', lang)).toMatch(/\b31\b/);
    }
  });

  it('falls back to English for an unknown language', () => {
    expect(formatVerificationDate('2026-08-22', 'de')).toBe(
      formatVerificationDate('2026-08-22', 'en')
    );
  });

  it('survives a structurally invalid language tag', () => {
    // Intl throws a RangeError on a malformed tag; a citation must still
    // render its date rather than take the page down.
    expect(() => formatVerificationDate('2026-08-22', 'en_US')).not.toThrow();
    expect(formatVerificationDate('2026-08-22', 'en_US')).toMatch(/August/);
  });

  it('returns the input unchanged when it is not a date', () => {
    expect(formatVerificationDate('not-a-date', 'en')).toBe('not-a-date');
  });
});
