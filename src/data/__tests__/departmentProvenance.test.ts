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
  // Dated city articles come from one newsroom, so they are one family
  // however many of them agree.
  'dagupan-lgu-2026-world-teachers-day': 'city-news',
  'dagupan-lgu-2025-agriculture-palay-seeds': 'city-news',
  'dagupan-lgu-2026-csc-prime-hrm': 'city-news',
  'dagupan-lgu-2025-history-wall': 'city-news',
  // The committee's own procurement issuances.
  'dagupan-lgu-bac-itb-goods-113cb-2026': 'bac-issuance',
  // The site-wide navigation of dagupan.gov.ph.
  'dagupan-lgu-home': 'city-site-navigation',
  // The council's own website, published by the Sangguniang Panlungsod.
  'dagupan-sp-councilors': 'council-site',
};

/**
 * Offices whose head official pages disagree about. Named individually so that
 * quietly publishing one later fails here rather than passing unnoticed.
 */
const CONFLICTING_HEADS = [
  'City Information Office',
  'Office of Senior Citizens Affairs',
  'One-Stop Business Center',
];

/**
 * Heads once withheld because the two roster families named different people,
 * now published because a dated city article names the same person as the
 * Directory-family rosters. Every name is recorded exactly as each cited source
 * prints it, and the older roster's name is kept so the test can assert it is
 * never published.
 */
const SETTLED_BY_DATED_NEWS: Record<
  string,
  { surname: string; namedAs: Record<string, string>; superseded: string }
> = {
  'city-health-office': {
    surname: 'De Venecia',
    namedAs: {
      'dagupan-lgu-directories': 'Dr. Ma. Julita P. De Venecia',
      'dagupan-lgu-department-heads-officials': 'Dr. Ma. Julita P. De Venecia',
      'dagupan-lgu-2026-world-teachers-day': 'Dra. Julita De Venecia',
    },
    superseded: 'Ophelia',
  },
  'city-agriculture-office': {
    surname: 'Salomon',
    namedAs: {
      'dagupan-lgu-directories': 'Ms. Mary Ann A. Salomon',
      'dagupan-lgu-department-heads-officials': 'Ms. Mary Ann A. Salomon',
      'dagupan-lgu-2025-agriculture-palay-seeds': 'Chief Mary Ann Salomon',
    },
    superseded: 'Dizon',
  },
  'city-human-resource-management-office': {
    surname: 'Fermill',
    namedAs: {
      'dagupan-lgu-directories': 'Atty. Froiland Jover F. Fermill',
      'dagupan-lgu-department-heads-officials':
        'Atty. Froiland Jover F. Fermill',
      'dagupan-lgu-2026-csc-prime-hrm': 'Atty. Froiland Fermill',
    },
    superseded: 'Balolong',
  },
  'city-tourism-office': {
    surname: 'Maramba',
    namedAs: {
      'dagupan-lgu-directories': 'Ms. Sharon M. Maramba',
      'dagupan-lgu-department-heads-officials': 'Ms. Sharon M. Maramba',
      'dagupan-lgu-2025-history-wall':
        'Tourism Officer-in-Charge Sharon Maramba',
    },
    superseded: 'Reyna',
  },
};

/**
 * Every published address and website, and the numbers added after the first
 * edition, with the sources that state each one. A value is published only where two source families state it,
 * except an address, which may also rest on the office's own dated issuance:
 * the committee's Invitations to Bid name the room bids must be delivered to.
 */
const CONTACT_EVIDENCE: Record<
  string,
  {
    trunkline?: Record<string, string[]>;
    website?: { value: string; sources: string[] };
    address?: {
      value: string;
      sources: string[];
      basis: 'two-families' | 'own-dated-issuance';
    };
  }
> = {
  'office-of-the-city-mayor': {
    address: {
      value: '2F Dagupan City Hall Complex, AB Fernandez Ave., Dagupan City',
      sources: ['dagupan-lgu-directories', 'dagupan-lgu-contact-us'],
      basis: 'two-families',
    },
  },
  'bids-and-awards-committee': {
    trunkline: {
      '0917-855-3267': [
        'dagupan-lgu-department-heads-officials',
        'dagupan-lgu-bac-itb-goods-113cb-2026',
      ],
    },
    address: {
      value:
        'BAC Office, 2nd Floor, City Hall Complex, A.B. Fernandez Ave., Dagupan City',
      sources: ['dagupan-lgu-bac-itb-goods-113cb-2026'],
      basis: 'own-dated-issuance',
    },
  },
  'sangguniang-panlungsod': {
    website: {
      value: 'https://sp.dagupan.gov.ph/',
      sources: ['dagupan-lgu-home', 'dagupan-sp-councilors'],
    },
  },
};

/**
 * Values an official source states but this portal withholds, each because the
 * sources disagree or only one undated page states it. Asserted absent so a
 * later edit cannot slip one in without revisiting the reason.
 */
const WITHHELD_CONTACTS = [
  // BAC email: the roster and the committee's own Invitations to Bid differ.
  'bacdagupan@gmail.com',
  'asi_aaron@yahoo.com',
  // Sangguniang Panlungsod address: the council site's footer only.
  'SP Building',
  // Single-page emails for the General Services Office and the sports program.
  'officegsodagupan2016@gmail.com',
  '2022dcsc@gmail.com',
];

/**
 * The council publishes its own website. It is a city body, but a different
 * publisher from the city government, so only the council's own office record
 * may cite it.
 */
const COUNCIL_AGENCY = 'Sangguniang Panlungsod, Dagupan City';
const COUNCIL_OFFICE = 'sangguniang-panlungsod';

/** Offices only one page family names anyone for. */
const UNCORROBORATED_HEADS = [
  'Bids and Awards Committee',
  "City Administrator's Office",
  'Dagupan City Public Library & Information Center',
  'Youth and Sports Development Program',
];

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

        if (department.slug === COUNCIL_OFFICE) {
          expect(['City Government of Dagupan', COUNCIL_AGENCY]).toContain(
            source.agency
          );
        } else {
          expect(source.agency).toBe('City Government of Dagupan');
        }
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

  it('settles a roster conflict only with a dated article naming the same person', () => {
    // The rosters are undated, so a disagreement between them cannot be
    // settled by preferring one. A dated city article can settle it, but only
    // when it names the person one roster family names, matched on surname
    // and a given name, and the head is then cited to those sources alone.
    const tokens = (name: string) =>
      name
        .replace(/[.,]/g, ' ')
        .split(/\s+/)
        .filter(Boolean)
        .map(t => t.toLowerCase());

    for (const [slug, evidence] of Object.entries(SETTLED_BY_DATED_NEWS)) {
      const department = departments.find(d => d.slug === slug);
      const head = department?.department_head;

      expect(head, `${slug} should publish its settled head`).toBeTruthy();
      expect(department!.department_head_status).toBe('published');

      // Every cited source has its rendering recorded, and nothing else is cited.
      expect([...head!.sources].sort()).toEqual(
        Object.keys(evidence.namedAs).sort()
      );

      const surname = tokens(evidence.surname).join(' ');
      expect(tokens(head!.name).join(' ').endsWith(surname)).toBe(true);
      // Given names, without initials or the abbreviation "Ma.".
      const givenNames = tokens(
        head!.name.slice(0, head!.name.length - evidence.surname.length)
      ).filter(t => t.length > 2);
      expect(givenNames.length, slug).toBeGreaterThan(0);

      for (const [id, rendering] of Object.entries(evidence.namedAs)) {
        const rendered = tokens(rendering);
        expect(
          rendered.join(' '),
          `${slug}: ${id} does not print the surname`
        ).toContain(surname);

        expect(
          givenNames.some(name => rendered.includes(name)),
          `${slug}: ${id} shares no given name with "${head!.name}"`
        ).toBe(true);
      }

      // One of the two families is a dated city article.
      const dated = head!.sources.filter(
        id => SOURCE_FAMILY[id] === 'city-news'
      );
      expect(dated.length, slug).toBeGreaterThan(0);
      for (const id of dated) {
        expect(getCivicSource(id).published, id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }

      // The roster that names someone else is never cited for the head, and
      // its name never reaches the record.
      expect(head!.sources).not.toContain(
        'dagupan-lgu-department-heads-the-city'
      );
      expect(JSON.stringify(department)).not.toContain(evidence.superseded);
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

  it('publishes an address only with recorded evidence for that office', () => {
    // An address is a claim about one office. It is never copied from city
    // hall's address, or from another office in the same building.
    for (const department of departments) {
      const evidence = CONTACT_EVIDENCE[department.slug]?.address;

      if (!evidence) {
        expect(
          department.address,
          `${department.office_name} publishes an unsourced address`
        ).toBeNull();
        continue;
      }

      expect(department.address).toBe(evidence.value);

      for (const id of evidence.sources) {
        expect(department.sources, `${department.slug}: ${id}`).toContain(id);
      }

      const families = new Set(evidence.sources.map(id => SOURCE_FAMILY[id]));
      if (evidence.basis === 'two-families') {
        expect(families.size, department.slug).toBeGreaterThanOrEqual(2);
      } else {
        // The office's own dated issuance: one source, from that office.
        expect(evidence.sources, department.slug).toHaveLength(1);
        expect(SOURCE_FAMILY[evidence.sources[0]]).toBe('bac-issuance');
        expect(department.slug).toBe('bids-and-awards-committee');
      }
    }

    expect(
      departments
        .filter(d => d.address !== null)
        .map(d => d.slug)
        .sort()
    ).toEqual(
      Object.entries(CONTACT_EVIDENCE)
        .filter(([, evidence]) => evidence.address)
        .map(([slug]) => slug)
        .sort()
    );
  });

  it('publishes a website only where two families point to it', () => {
    for (const department of departments) {
      const evidence = CONTACT_EVIDENCE[department.slug]?.website;

      if (!evidence) {
        expect(
          department.website,
          `${department.office_name} publishes an unsourced website`
        ).toBeNull();
        continue;
      }

      expect(department.website).toBe(evidence.value);
      expect(department.website).toMatch(/^https:\/\/([a-z0-9-]+\.)+gov\.ph\//);

      for (const id of evidence.sources) {
        expect(department.sources, `${department.slug}: ${id}`).toContain(id);
      }
      expect(
        new Set(evidence.sources.map(id => SOURCE_FAMILY[id])).size
      ).toBeGreaterThanOrEqual(2);
    }
  });

  it('corroborates every added contact number with two families', () => {
    for (const [slug, evidence] of Object.entries(CONTACT_EVIDENCE)) {
      const department = departments.find(d => d.slug === slug)!;

      for (const [number, sources] of Object.entries(
        evidence.trunkline ?? {}
      )) {
        expect(department.trunkline, slug).toContain(number);
        for (const id of sources) {
          expect(department.sources, `${slug}: ${id}`).toContain(id);
        }
        expect(
          new Set(sources.map(id => SOURCE_FAMILY[id])).size,
          `${slug} ${number}`
        ).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('keeps out the contact details the sources disagree about', () => {
    const serialised = JSON.stringify(departments);

    for (const value of WITHHELD_CONTACTS) {
      expect(serialised, `${value} is withheld`).not.toContain(value);
    }

    // The committee has two published emails and they differ, so it has none.
    expect(
      departments.find(d => d.slug === 'bids-and-awards-committee')!.email
    ).toBeNull();
  });

  it('invents no office hours', () => {
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
