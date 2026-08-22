import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { describe, expect, it } from 'vitest';

import {
  allCivicSources,
  earliestVerificationDate,
  getCivicSource,
  hasCivicSource,
} from '@/lib/civicSources';

import civicSources from '@/data/sources/civic-sources.json';

/**
 * Provenance is the whole point of the civic datasets: a record that cites a
 * source nobody can open is no better than an unsourced record. These tests
 * hold the citations themselves to the standard the records depend on.
 */
const schema = JSON.parse(
  readFileSync(
    join(process.cwd(), 'src/data/sources/schema/civic-sources.schema.json'),
    'utf8'
  )
);

const INHERITED = /los ba(ñ|n)os|losbanos\.gov\.ph|betterlb/i;

describe('civic sources', () => {
  it('validates against its JSON schema', () => {
    const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
    addFormats(ajv);

    const validate = ajv.compile(schema);
    const valid = validate(civicSources);

    expect(validate.errors ?? []).toEqual([]);
    expect(valid).toBe(true);
  });

  it('requires every contract field, so a missing one is rejected', () => {
    // The schema and the CivicSource interface have to agree. They drifted
    // once already: the interface required published, data_as_of and coverage
    // while the schema listed only retrieved and verified, so a source could
    // omit a date entirely and still validate.
    const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
    addFormats(ajv);
    const validate = ajv.compile(schema);

    const complete = {
      id: 'fixture-source',
      agency: 'Agency',
      title: 'Title',
      url: 'https://example.gov.ph/doc',
      published: null,
      data_as_of: null,
      coverage: null,
      retrieved: '2026-08-22',
      verified: '2026-08-22',
      licence: null,
      derives_from: null,
    };

    // The fixture itself must be valid, or the deletions below prove nothing.
    expect(validate([complete])).toBe(true);

    const REQUIRED = [
      'id',
      'agency',
      'title',
      'url',
      'published',
      'data_as_of',
      'coverage',
      'retrieved',
      'verified',
      'licence',
      'derives_from',
    ] as const;

    for (const field of REQUIRED) {
      const missing: Record<string, unknown> = { ...complete };
      delete missing[field];

      expect(
        validate([missing]),
        `a source missing "${field}" should fail validation`
      ).toBe(false);
    }

    // notes is the single intentional exception: a source with nothing to
    // qualify needs no note.
    expect(validate([complete])).toBe(true);
    expect(validate([{ ...complete, notes: 'a caveat' }])).toBe(true);
  });

  it('rejects a field the contract does not define', () => {
    const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
    addFormats(ajv);
    const validate = ajv.compile(schema);

    expect(
      validate([
        {
          id: 'fixture-source',
          agency: 'Agency',
          title: 'Title',
          url: 'https://example.gov.ph/doc',
          published: null,
          data_as_of: null,
          coverage: null,
          retrieved: '2026-08-22',
          verified: '2026-08-22',
          licence: null,
          derives_from: null,
          // A typo for an existing field must not slip through unnoticed.
          verifed: '2026-08-22',
        },
      ])
    ).toBe(false);
  });

  it('gives every source a unique id', () => {
    const ids = civicSources.map(source => source.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('names an agency, a title and a resolvable https URL for each source', () => {
    for (const source of civicSources) {
      expect(source.agency.trim().length).toBeGreaterThan(0);
      expect(source.title.trim().length).toBeGreaterThan(0);
      expect(source.url).toMatch(/^https:\/\/\S+$/);
      expect(() => new URL(source.url)).not.toThrow();
    }
  });

  it('records retrieval and verification dates that are real and not in the future', () => {
    const today = new Date();
    today.setUTCHours(23, 59, 59, 999);

    for (const source of civicSources) {
      for (const field of ['retrieved', 'verified'] as const) {
        const value = source[field];
        expect(value).toMatch(/^\d{4}-\d{2}-\d{2}$/);

        const parsed = new Date(`${value}T00:00:00Z`);
        expect(Number.isNaN(parsed.getTime())).toBe(false);
        expect(parsed.getTime()).toBeLessThanOrEqual(today.getTime());
      }

      // A source cannot be verified before it was ever read.
      expect(source.verified >= source.retrieved).toBe(true);
    }
  });

  it('cites only Philippine government publishers, not the inherited LGU', () => {
    expect(JSON.stringify(civicSources)).not.toMatch(INHERITED);

    for (const source of civicSources) {
      expect(source.url).toMatch(/\.gov\.ph\//);
    }
  });

  it('keeps release date, reference date and coverage period distinct', () => {
    const psgc = civicSources.find(s => s.id === 'psa-psgc-dagupan-2026q2')!;

    // The PSA released the 2Q 2026 PSGC on 13 July 2026, describing the
    // classification as of 30 June 2026. Collapsing the two would misstate
    // when the data was published, so they are stored separately.
    expect(psgc.published).toBe('2026-07-13');
    expect(psgc.data_as_of).toBe('2026-06-30');
    expect(psgc.published).not.toBe(psgc.data_as_of);

    // A dataset cannot describe a period after the release that announced it.
    for (const source of civicSources) {
      if (source.published && source.data_as_of) {
        expect(source.data_as_of <= source.published).toBe(true);
      }
    }
  });

  it('labels a historical document with the period it covers', () => {
    const city = civicSources.find(
      s => s.id === 'dagupan-lgu-barangay-captains-2018-2020'
    )!;

    // The UI reads `coverage` to say "Historical city-page spelling (…)".
    // Without it the page's content would be presented as current.
    expect(city.coverage).toBe('2018–2020');
    expect(city.id).toContain('2018-2020');
  });

  it('marks a redistributor as derivative rather than corroborating', () => {
    const dilg = civicSources.find(
      s => s.id === 'dilg-masterlist-of-barangays'
    )!;

    // DILG republishes the PSA file; it is not an independent check on it.
    expect(dilg.derives_from).toBe('psa-psgc-dagupan-2026q2');
    expect(hasCivicSource(dilg.derives_from!)).toBe(true);

    // A derivative source must not itself be derived from a derivative one.
    for (const source of civicSources) {
      if (source.derives_from) {
        expect(
          getCivicSource(source.derives_from).derives_from ?? null
        ).toBeNull();
      }
    }
  });

  it('resolves known ids and refuses unknown ones', () => {
    expect(getCivicSource('psa-psgc-dagupan-2026q2').agency).toBe(
      'Philippine Statistics Authority'
    );
    expect(hasCivicSource('psa-psgc-dagupan-2026q2')).toBe(true);

    expect(hasCivicSource('not-a-real-source')).toBe(false);
    expect(() => getCivicSource('not-a-real-source')).toThrow(
      /Unknown civic source/
    );
  });

  it('reports the oldest verification date across a record’s citations', () => {
    // Behaviour against differing dates is proven in src/lib/civicSources.test.ts,
    // where the fixtures can tell oldest from newest. Here the production
    // sources happen to share a date, so this only guards the wiring.
    expect(
      earliestVerificationDate([
        'psa-psgc-dagupan-2026q2',
        'dagupan-lgu-barangay-captains-2018-2020',
      ])
    ).toBe('2026-08-22');
    expect(earliestVerificationDate([])).toBeNull();
  });

  it('would expose a stale citation rather than hide it', () => {
    // If these dates ever diverge, the record-level figure must follow the
    // oldest one. Asserting the invariant directly means the guarantee does
    // not quietly lapse the day a single source is re-verified on its own.
    const oldest = civicSources.map(source => source.verified).sort()[0];

    expect(earliestVerificationDate(civicSources.map(s => s.id))).toBe(oldest);
  });

  it('exposes every declared source through the helper', () => {
    expect(allCivicSources()).toHaveLength(civicSources.length);
  });
});
