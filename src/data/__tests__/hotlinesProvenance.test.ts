import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { describe, expect, it } from 'vitest';

import { getCivicSource, hasCivicSource } from '@/lib/civicSources';
import { toTelUri } from '@/lib/utils';

import departmentsRaw from '@/data/directory/departments.json';
import hotlinesRaw from '@/data/directory/hotlines.json';

import type { CityHotline, Department } from '@/types/directoryTypes';

/**
 * The city's emergency numbers are the most consequential data this portal
 * publishes: a wrong digit sends someone in an emergency to the wrong place.
 * These tests pin the published numbers exactly, hold each one to the
 * two-list corroboration rule, and assert that the four rows the city lists
 * but this portal could not corroborate stay out, along with the Red Cross
 * landline another city page gives to a bank.
 *
 * See docs/civic-data-verification.md, "Worked example: city emergency
 * hotlines".
 */
const hotlines = hotlinesRaw as CityHotline[];
const departments = departmentsRaw as Department[];

const schema = JSON.parse(
  readFileSync(
    join(process.cwd(), 'src/data/directory/schema/hotlines.schema.json'),
    'utf8'
  )
);

/** Published numbers, exactly as transcribed, in the city's order. */
const EXPECTED: Record<string, string[]> = {
  'pnp-dagupan': ['0916-525-6802', '0933-502-4899', '(075) 529-5604'],
  'bfp-dagupan': ['0917-184-2611', '(075) 522-2772'],
  cdrrmo: ['0968-444-9598', '(075) 540-0363'],
  cho: ['0933-861-6088', '0997-840-1377', '(075) 522-8206'],
  'panda-volunteers': ['0932-548-1545', '(075) 522-2808', '(075) 522-8202'],
  'red-cross-dagupan': ['0928-559-2701'],
  decorp: [
    '0925-726-9546',
    '(075) 522-5433',
    '(075) 522-4145',
    '(075) 515-2870',
  ],
  'peso-ofw-desk': ['0915-421-6885', '(075) 505-6256'],
  cswdo: ['(075) 515-3140', '(075) 632-2566'],
  poso: ['0967-435-7097', '0919-248-2531'],
};

/**
 * The emergency list itself. It appears on two pages, but as the same 14
 * rows, so it counts once: a list cannot corroborate itself.
 */
const HOTLINE_LIST = ['dagupan-lgu-directories', 'dagupan-lgu-contact-us'];
/** Pages carrying a department roster, the second list a number can be in. */
const ROSTER_PAGES = [
  'dagupan-lgu-department-heads-officials',
  'dagupan-lgu-department-heads-the-city',
];
/**
 * These three appear on no roster page except the Directory page's own first
 * table, so their second list sits on the same page as the hotline list. The
 * exception is named so that adding a fourth fails here.
 */
const DIRECTORY_TABLE_ONLY = [
  'panda-volunteers',
  'red-cross-dagupan',
  'decorp',
];

/** On the city's list, but stated by only one list or in conflict. */
const WITHHELD_NUMBERS = [
  '0933-378-8888',
  '0960-260-6036',
  '0969-045-1111',
  '632-3296',
];

/**
 * The city's National Agencies page gives "632 – 3296" to the Philippine
 * National Bank. The emergency list gives it to Red Cross Dagupan, so the
 * number belongs to two entities on the city's own pages and is withheld, as
 * the PAMANA number was. The page is catalogued so the reason is traceable,
 * but it backs no published number.
 */
const CROSS_ATTRIBUTION_SOURCE = 'dagupan-lgu-national-agencies';

const INHERITED =
  /los ba(ñ|n)os|losbanos\.gov\.ph|sangguniang bayan|betterlb|municipality of|laguna|\(049\)/i;

const digits = (number: string) => number.replace(/\D/g, '');

describe('city emergency hotlines', () => {
  it('validates against the hotline schema', () => {
    const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
    addFormats(ajv);

    const validate = ajv.compile(schema);
    const valid = validate(hotlines);

    expect(validate.errors ?? []).toEqual([]);
    expect(valid).toBe(true);
  });

  it('publishes exactly the corroborated numbers, in the city order', () => {
    expect(Object.fromEntries(hotlines.map(h => [h.slug, h.numbers]))).toEqual(
      EXPECTED
    );
  });

  it('gives every entry a unique slug and name', () => {
    expect(new Set(hotlines.map(h => h.slug)).size).toBe(hotlines.length);
    expect(new Set(hotlines.map(h => h.name)).size).toBe(hotlines.length);
  });

  it('lists no number under two entries', () => {
    // The city gives "515-3140" to both the social welfare office and the
    // water district. A number cannot be both, so only the office whose
    // number three lists agree on keeps it.
    const all = hotlines.flatMap(h => h.numbers.map(digits));

    expect(new Set(all).size).toBe(all.length);
    expect(
      hotlines
        .filter(h => h.numbers.includes('(075) 515-3140'))
        .map(h => h.slug)
    ).toEqual(['cswdo']);
  });

  it('withholds the rows only one list states, or that conflict', () => {
    const serialised = JSON.stringify(hotlines);

    for (const number of WITHHELD_NUMBERS) {
      expect(serialised).not.toContain(number);
    }
    expect(serialised).not.toMatch(/helpline|pamana|water district/i);
  });

  it('withholds a number the city attributes to another entity', () => {
    expect(hasCivicSource(CROSS_ATTRIBUTION_SOURCE)).toBe(true);
    expect(getCivicSource(CROSS_ATTRIBUTION_SOURCE).notes).toMatch(
      /632 – 3296.*Philippine National Bank/
    );

    const redCross = hotlines.find(h => h.slug === 'red-cross-dagupan');
    expect(redCross?.numbers).toEqual(['0928-559-2701']);

    for (const hotline of hotlines) {
      expect(hotline.sources).not.toContain(CROSS_ATTRIBUTION_SOURCE);
    }
  });

  it('formats every number so it can be dialled', () => {
    for (const hotline of hotlines) {
      for (const number of hotline.numbers) {
        expect(number).toMatch(/^(\(075\) \d{3}-\d{4}|09\d{2}-\d{3}-\d{4})$/);

        const tel = toTelUri(number);
        expect(tel, number).not.toBeNull();
        // +63, then the 75 area code and 7 digits for a landline, or the
        // 10-digit 9xx mobile number.
        expect(tel).toMatch(/^tel:\+63(75\d{7}|9\d{9})$/);
      }
    }
  });

  it('backs every entry with resolvable city-government sources', () => {
    for (const hotline of hotlines) {
      for (const id of hotline.sources) {
        expect(hasCivicSource(id), `${hotline.slug}: "${id}"`).toBe(true);

        const source = getCivicSource(id);
        expect(source.agency).toBe('City Government of Dagupan');
        expect(source.derives_from ?? null).toBeNull();
        expect(source.coverage ?? null).toBeNull();
      }
    }
  });

  it('corroborates every entry with a second list beyond the hotline list', () => {
    for (const hotline of hotlines) {
      // Every entry is on the city's emergency list, which spans both pages.
      for (const id of HOTLINE_LIST) {
        expect(hotline.sources).toContain(id);
      }

      const rosterPages = hotline.sources.filter(id =>
        ROSTER_PAGES.includes(id)
      );

      if (DIRECTORY_TABLE_ONLY.includes(hotline.slug)) {
        expect(rosterPages, hotline.slug).toEqual([]);
      } else {
        expect(rosterPages.length, hotline.slug).toBeGreaterThan(0);
      }
    }
  });

  it('agrees with the office directory wherever the office is in both', () => {
    // The city offices on the emergency list are also published as
    // departments, from the same pages. A hotline number missing from the
    // office's own record would mean one of the two transcriptions is wrong.
    const OFFICE_OF: Record<string, string> = {
      cdrrmo: 'city-disaster-risk-reduction-and-management-office',
      cho: 'city-health-office',
      cswdo: 'city-social-welfare-and-development-office',
      'peso-ofw-desk': 'public-employment-service-office',
      poso: 'public-order-and-safety-office',
    };

    for (const [slug, officeSlug] of Object.entries(OFFICE_OF)) {
      const hotline = hotlines.find(h => h.slug === slug);
      const office = departments.find(d => d.slug === officeSlug);

      expect(hotline, slug).toBeDefined();
      expect(office, officeSlug).toBeDefined();

      const officeDigits = (office?.trunkline ?? []).map(digits);
      for (const number of hotline?.numbers ?? []) {
        expect(officeDigits, `${slug} ${number}`).toContain(digits(number));
      }
    }
  });

  it('mentions no inherited LGU', () => {
    expect(JSON.stringify(hotlines)).not.toMatch(INHERITED);
  });
});
