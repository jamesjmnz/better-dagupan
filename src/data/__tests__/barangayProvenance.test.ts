import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { describe, expect, it } from 'vitest';

import { getCivicSource, hasCivicSource } from '@/lib/civicSources';

import barangaysRaw from '@/data/directory/barangays.json';

import type { Barangay } from '@/types/directoryTypes';

/**
 * The barangay index is the first civic dataset Better Dagupan publishes under
 * its own name, and it sets the standard for the rest: every record traceable
 * to a government document, and nothing on screen that a source does not
 * support. These tests are that standard written down.
 *
 * They fail loudly if someone adds a barangay without a citation, invents a
 * captain or a phone number to fill a card, or repopulates the file from the
 * inherited template.
 */
const barangays = barangaysRaw as Barangay[];

const schema = JSON.parse(
  readFileSync(
    join(process.cwd(), 'src/data/directory/schema/barangays.schema.json'),
    'utf8'
  )
);

/** PSA PSGC, City of Dagupan (0105518000), as of 30 June 2026. */
const EXPECTED_COUNT = 31;
const CITY_PSGC_PREFIX = '0105518';
/** City total published by the PSA on the same page (2024 POPCEN). */
const CITY_POPULATION_2024 = 174777;

const INHERITED =
  /los ba(ñ|n)os|losbanos\.gov\.ph|sangguniang bayan|betterlb|municipality of/i;

describe('barangay records', () => {
  it('validates every record against the barangay schema', () => {
    const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
    addFormats(ajv);

    const validate = ajv.compile(schema);
    const valid = validate(barangays);

    expect(validate.errors ?? []).toEqual([]);
    expect(valid).toBe(true);
  });

  it('publishes all 31 barangays of the city', () => {
    expect(barangays).toHaveLength(EXPECTED_COUNT);
  });

  it('gives every record a unique name, slug and PSGC code', () => {
    const names = barangays.map(b => b.barangay_name);
    const slugs = barangays.map(b => b.slug);
    const codes = barangays.map(b => b.psgc_10_digit_code);
    const correspondence = barangays.map(b => b.psgc_correspondence_code);

    expect(new Set(names).size).toBe(EXPECTED_COUNT);
    expect(new Set(slugs).size).toBe(EXPECTED_COUNT);
    expect(new Set(codes).size).toBe(EXPECTED_COUNT);
    expect(new Set(correspondence).size).toBe(EXPECTED_COUNT);
  });

  it('does not contain PSGC code 0105518005', () => {
    // The current PSGC has no 0105518005 and no "Barangay III"; the sequence
    // skips from 0105518004 to 0105518006. This asserts the gap exactly as
    // observed. Deliberately no claim about WHY it is absent: no document
    // establishing a merger or deletion was found, so none is asserted.
    const codes = barangays.map(b => b.psgc_10_digit_code);

    expect(codes).not.toContain('0105518005');
    expect(codes).toContain('0105518004');
    expect(codes).toContain('0105518006');
    expect(barangays.map(b => b.barangay_name)).not.toContain('Barangay III');
  });

  it('holds no duplicate records', () => {
    const serialised = barangays.map(b => JSON.stringify(b));

    expect(new Set(serialised).size).toBe(EXPECTED_COUNT);
  });

  it('places every barangay inside the City of Dagupan', () => {
    for (const barangay of barangays) {
      expect(barangay.psgc_10_digit_code.startsWith(CITY_PSGC_PREFIX)).toBe(
        true
      );
      // PSA publishes both code forms. The 9-digit correspondence code is the
      // 10-digit code with its third character dropped, e.g. 0105518001 ->
      // 015518001. Asserting the relationship catches a code pasted into the
      // wrong column.
      const code = barangay.psgc_10_digit_code;
      expect(barangay.psgc_correspondence_code).toBe(
        code.slice(0, 2) + code.slice(3)
      );
    }
  });

  it('reconciles with the city population the PSA publishes', () => {
    // An arithmetic check on the transcription: if a figure were mistyped,
    // dropped or duplicated, the barangay totals would stop adding up to the
    // city total on the same source page.
    const total = barangays.reduce(
      (sum, barangay) => sum + barangay.population_2024_popcen,
      0
    );

    expect(total).toBe(CITY_POPULATION_2024);
  });

  it('derives every slug from the published name', () => {
    for (const barangay of barangays) {
      const expected = barangay.barangay_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      expect(barangay.slug).toBe(expected);
    }
  });

  it('backs every published record with at least one resolvable source', () => {
    for (const barangay of barangays) {
      expect(barangay.sources.length).toBeGreaterThan(0);

      for (const id of barangay.sources) {
        expect(
          hasCivicSource(id),
          `${barangay.barangay_name} cites unknown source "${id}"`
        ).toBe(true);
      }
    }
  });

  it('cites only authoritative sources for the published fields', () => {
    for (const barangay of barangays) {
      for (const id of barangay.sources) {
        const source = getCivicSource(id);

        // A redistributor corroborates that data is being published, not the
        // facts, so it can never stand as a citation for a published field.
        expect(
          source.derives_from ?? null,
          `${barangay.barangay_name} cites derivative source "${id}"`
        ).toBeNull();

        // Nor may a record be backed by a document covering a past term.
        expect(
          source.coverage ?? null,
          `${barangay.barangay_name} cites historical source "${id}"`
        ).toBeNull();
      }

      // The PSA PSGC is the authority for every field published here.
      expect(barangay.sources).toEqual(['psa-psgc-dagupan-2026q2']);
    }
  });

  it('attributes each differing spelling to the 2018–2020 city page', () => {
    const withVariants = barangays.filter(b => b.name_variants.length > 0);

    // Exactly four names are spelled differently on the city's historical page.
    expect(withVariants.map(b => b.barangay_name).sort()).toEqual([
      'Barangay II',
      'Herrero',
      'Mangin',
      'Pugaro Suit',
    ]);
    expect(
      withVariants.flatMap(b => b.name_variants.map(v => v.name)).sort()
    ).toEqual(['Barangay II & III', 'Herrero-Perez', 'Manguin', 'Pugaro']);

    for (const barangay of withVariants) {
      for (const variant of barangay.name_variants) {
        expect(variant.name).not.toBe(barangay.barangay_name);

        const source = getCivicSource(variant.source);

        // Attribution must carry the period, because the UI labels these
        // spellings historical rather than presenting them as current.
        expect(source.id).toBe('dagupan-lgu-barangay-captains-2018-2020');
        expect(source.coverage).toBe('2018–2020');

        // And it must NOT leak into the record's own citations, which would
        // imply a superseded page backs the published data.
        expect(barangay.sources).not.toContain(variant.source);
      }
    }
  });

  it('leaves the other 27 barangays without a differing spelling', () => {
    const withoutVariants = barangays.filter(b => b.name_variants.length === 0);

    expect(withoutVariants).toHaveLength(EXPECTED_COUNT - 4);
  });

  it('invents no officials', () => {
    // The only city-government roster found is headed "2018- 2020". Until a
    // current source is verified, no name may appear here at all.
    for (const barangay of barangays) {
      expect(barangay.officials).toEqual([]);
    }
  });

  it('invents no contact details, addresses or websites', () => {
    for (const barangay of barangays) {
      expect(barangay.trunkline).toEqual([]);
      expect(barangay.address).toBeNull();
      expect(barangay.website).toBeNull();
    }
  });

  it('carries no placeholder text in a published name', () => {
    const PLACEHOLDER = /tbd|todo|n\/a|unknown|lorem|sample|example|xxx/i;

    for (const barangay of barangays) {
      expect(barangay.barangay_name).not.toMatch(PLACEHOLDER);
      expect(barangay.slug).not.toMatch(PLACEHOLDER);
    }
  });

  it('renders names that survive display without being reformatted', () => {
    // Four names are Roman numerals. They are stored cased for display
    // precisely because the formatting helpers would mangle them.
    const numbered = barangays
      .filter(b => /^Barangay [IVX]+$/.test(b.barangay_name))
      .map(b => b.barangay_name);

    expect(numbered.sort()).toEqual([
      'Barangay I',
      'Barangay II',
      'Barangay IV',
    ]);

    for (const barangay of barangays) {
      expect(barangay.barangay_name.trim()).toBe(barangay.barangay_name);
    }
  });

  it('mentions no inherited LGU', () => {
    expect(JSON.stringify(barangays)).not.toMatch(INHERITED);
  });
});
