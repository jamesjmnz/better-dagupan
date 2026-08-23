import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { describe, expect, it } from 'vitest';

import { getCivicSource, hasCivicSource } from '@/lib/civicSources';

import departmentsRaw from '@/data/directory/departments.json';

import type { Department } from '@/types/directoryTypes';

/**
 * The office directory is the second civic dataset Better Dagupan publishes
 * under its own name, and the harder of the two to publish honestly. The PSA
 * gave the barangays one authoritative, dated source. The city gives its own
 * offices three undated rosters that contradict each other, so most of what
 * these tests protect is the decision not to publish what cannot be settled.
 *
 * They fail loudly if someone resolves a source conflict by picking a side,
 * promotes a name that only one page family carries, invents a contact detail,
 * or repopulates the file from the inherited template.
 */
const departments = departmentsRaw as Department[];

const schema = JSON.parse(
  readFileSync(
    join(process.cwd(), 'src/data/directory/schema/departments.schema.json'),
    'utf8'
  )
);

const EXPECTED_COUNT = 34;

/**
 * Which editorial act a source represents.
 *
 * /directories/ and /officials/department-heads/ are near-clones of one
 * another - same table markup, same wording, same honorifics - so two of them
 * agreeing is one roster repeated, not two independent statements. Corroboration
 * is therefore counted in families, never in pages.
 */
const SOURCE_FAMILY: Record<string, string> = {
  'dagupan-lgu-directories': 'city-directory-roster',
  'dagupan-lgu-department-heads-officials': 'city-directory-roster',
  'dagupan-lgu-department-heads-the-city': 'city-the-city-roster',
  'dagupan-lgu-contact-us': 'city-contact-page',
  'dagupan-lgu-2025-local-election-results': 'city-election-report',
};

/**
 * Offices whose head official pages disagree about. Named individually so that
 * quietly publishing one later fails here rather than passing unnoticed.
 */
const CONFLICTING_HEADS = [
  'City Agriculture Office',
  'City Health Office',
  'City Human Resource Management Office',
  'City Information Office',
  'City Tourism Office',
  'Office of Senior Citizens Affairs',
  'One-Stop Business Center',
];

/** Offices only one page family names anyone for. */
const UNCORROBORATED_HEADS = [
  'Bids and Awards Committee',
  "City Administrator's Office",
  'Dagupan City Public Library & Information Center',
  'Youth and Sports Development Program',
];

/** The one office the city publishes an address for on two separate pages. */
const OFFICE_WITH_ADDRESS = 'Office of the City Mayor';

/**
 * Listed on the city's directory page but not part of the city government:
 * two national agencies, an NGO, a private utility and a water district.
 */
const NOT_CITY_GOVERNMENT = [
  'PNP',
  'BFP',
  'Red Cross',
  'DECORP',
  'PAMANA',
  'Philippine National Police',
  'Bureau of Fire',
];

const LANDLINE = /^\(075\) \d{3}-\d{4}$/;
const MOBILE = /^09\d{2}-\d{3}-\d{4}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INHERITED =
  /los ba(ñ|n)os|losbanos\.gov\.ph|sangguniang bayan|betterlb|municipality of/i;

describe('department records', () => {
  it('validates every record against the department schema', () => {
    const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
    addFormats(ajv);

    const validate = ajv.compile(schema);
    const valid = validate(departments);

    expect(validate.errors ?? []).toEqual([]);
    expect(valid).toBe(true);
  });

  it('publishes every city office found on the official pages', () => {
    expect(departments).toHaveLength(EXPECTED_COUNT);
  });

  it('gives every record a unique name and slug', () => {
    const names = departments.map(d => d.office_name);
    const slugs = departments.map(d => d.slug);

    expect(new Set(names).size).toBe(EXPECTED_COUNT);
    expect(new Set(slugs).size).toBe(EXPECTED_COUNT);
  });

  it('holds no duplicate records', () => {
    const serialised = departments.map(d => JSON.stringify(d));

    expect(new Set(serialised).size).toBe(EXPECTED_COUNT);
  });

  it('derives every slug from the published office name', () => {
    for (const department of departments) {
      // Apostrophes are removed rather than treated as separators, so
      // "City Engineer's Office" slugs to city-engineers-office.
      const expected = department.office_name
        .toLowerCase()
        .replace(/&/g, ' and ')
        .replace(/['’]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      expect(department.slug).toBe(expected);
    }
  });

  it('backs every published office with at least one resolvable source', () => {
    for (const department of departments) {
      expect(department.sources.length).toBeGreaterThan(0);

      for (const id of department.sources) {
        expect(
          hasCivicSource(id),
          `${department.office_name} cites unknown source "${id}"`
        ).toBe(true);
      }
    }
  });

  it('cites only authoritative sources for the published fields', () => {
    for (const department of departments) {
      for (const id of department.sources) {
        const source = getCivicSource(id);

        // A redistributor corroborates that data is being published, not the
        // facts, so it can never stand as a citation for a published field.
        expect(
          source.derives_from ?? null,
          `${department.office_name} cites derivative source "${id}"`
        ).toBeNull();

        // Nor may a record be backed by a document covering a past period.
        expect(
          source.coverage ?? null,
          `${department.office_name} cites historical source "${id}"`
        ).toBeNull();

        expect(source.agency).toBe('City Government of Dagupan');
      }
    }
  });

  it('publishes a head only where the status says one is established', () => {
    for (const department of departments) {
      if (department.department_head_status === 'published') {
        expect(
          department.department_head,
          `${department.office_name} is marked published with no head`
        ).not.toBeNull();
      } else {
        expect(
          department.department_head,
          `${department.office_name} names a head it also marks withheld`
        ).toBeNull();
      }
    }
  });

  it('names every published head on two independent page families', () => {
    // The load-bearing assertion of this dataset. A head resting on one page,
    // or on two pages that are copies of each other, is not established.
    const published = departments.filter(d => d.department_head !== null);

    expect(published.length).toBeGreaterThan(0);

    for (const department of published) {
      const sources = department.department_head!.sources;

      expect(sources.length).toBeGreaterThanOrEqual(2);

      for (const id of sources) {
        expect(
          hasCivicSource(id),
          `${department.office_name} head cites unknown source "${id}"`
        ).toBe(true);
        expect(getCivicSource(id).coverage ?? null).toBeNull();
      }

      const families = new Set(sources.map(id => SOURCE_FAMILY[id]));

      expect(
        families.size,
        `${department.office_name} head rests on a single page family`
      ).toBeGreaterThanOrEqual(2);
    }
  });

  it('withholds the head of every office the sources disagree about', () => {
    const conflicting = departments
      .filter(d => d.department_head_status === 'conflicting_sources')
      .map(d => d.office_name)
      .sort();

    expect(conflicting).toEqual(CONFLICTING_HEADS);

    for (const department of departments) {
      if (CONFLICTING_HEADS.includes(department.office_name)) {
        expect(department.department_head).toBeNull();
      }
    }
  });

  it('withholds the head of every office only one family names', () => {
    const uncorroborated = departments
      .filter(d => d.department_head_status === 'uncorroborated')
      .map(d => d.office_name)
      .sort();

    expect(uncorroborated).toEqual(UNCORROBORATED_HEADS);
  });

  it('still publishes the office wherever it withholds the head', () => {
    // Withholding a name must never remove the office. A reader looking for
    // the City Health Office has to find it, and find out why the head is not
    // named, rather than be shown nothing at all.
    const withheld = [...CONFLICTING_HEADS, ...UNCORROBORATED_HEADS];
    const names = departments.map(d => d.office_name);

    for (const office of withheld) {
      expect(names, `${office} disappeared with its head`).toContain(office);
    }
  });

  it('publishes contact numbers only in the forms the city prints', () => {
    for (const department of departments) {
      for (const number of department.trunkline) {
        expect(
          LANDLINE.test(number) || MOBILE.test(number),
          `${department.office_name} publishes "${number}"`
        ).toBe(true);
      }

      // A number must not be listed twice for the same office.
      expect(new Set(department.trunkline).size).toBe(
        department.trunkline.length
      );

      if (department.email !== null) {
        expect(department.email).toMatch(EMAIL);
      }

      if (department.department_head?.email != null) {
        expect(department.department_head.email).toMatch(EMAIL);
      }
    }
  });

  it('invents no address, website or office hours', () => {
    for (const department of departments) {
      expect(department.website).toBeNull();

      if (department.office_name !== OFFICE_WITH_ADDRESS) {
        expect(
          department.address,
          `${department.office_name} publishes an unsourced address`
        ).toBeNull();
      }
    }

    const withAddress = departments.filter(d => d.address !== null);

    expect(withAddress.map(d => d.office_name)).toEqual([OFFICE_WITH_ADDRESS]);

    // The city publishes opening hours for city hall as a whole and for the
    // mayor's office, never per office. Applying them to individual offices
    // would be inference, so no record carries them at all.
    expect(JSON.stringify(departments)).not.toMatch(
      /8:00|Monday|office_hours/i
    );
  });

  it('attributes every name variant to the page that uses it', () => {
    for (const department of departments) {
      for (const variant of department.name_variants) {
        expect(variant.name).not.toBe(department.office_name);
        expect(hasCivicSource(variant.source)).toBe(true);
      }
    }
  });

  it('publishes no entity that is not the city government', () => {
    const serialised = JSON.stringify(departments);

    for (const entity of NOT_CITY_GOVERNMENT) {
      expect(
        serialised,
        `${entity} is not a city office and must not be listed here`
      ).not.toContain(entity);
    }
  });

  it('carries no placeholder text in a published name', () => {
    const PLACEHOLDER = /tbd|todo|n\/a|unknown|lorem|sample|example|xxx/i;

    for (const department of departments) {
      expect(department.office_name).not.toMatch(PLACEHOLDER);
      expect(department.slug).not.toMatch(PLACEHOLDER);
      expect(department.office_name.trim()).toBe(department.office_name);
      expect(department.department_head?.name ?? '').not.toMatch(PLACEHOLDER);
    }
  });

  it('mentions no inherited LGU', () => {
    expect(JSON.stringify(departments)).not.toMatch(INHERITED);
  });
});
