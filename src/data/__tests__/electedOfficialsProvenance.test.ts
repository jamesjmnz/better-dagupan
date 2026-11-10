import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { describe, expect, it } from 'vitest';

import { getCivicSource, hasCivicSource } from '@/lib/civicSources';

import executiveRaw from '@/data/directory/executive.json';
import legislativeRaw from '@/data/directory/legislative.json';

import type {
  CouncilOfficial,
  ExecutiveOfficial,
  LegislativeChamber,
} from '@/types/directoryTypes';

/**
 * The elected officials are the third civic dataset Better Dagupan publishes
 * under its own name, and the one a reader is most likely to quote. Every
 * name here is a claim that a particular person holds a particular seat now,
 * so these tests encode, as data, what each cited source actually prints and
 * check every published name against it.
 *
 * They fail loudly if someone names a person on the strength of one source
 * family, counts a nickname as a given name, invents a contact detail, revives
 * a committee assignment the sources disagree about, or repopulates the files
 * from the inherited template.
 */
const executive = executiveRaw as ExecutiveOfficial[];
const legislative = legislativeRaw as LegislativeChamber[];

const loadSchema = (name: string) =>
  JSON.parse(
    readFileSync(
      join(process.cwd(), `src/data/directory/schema/${name}.schema.json`),
      'utf8'
    )
  );

const ROSTER = 'dagupan-sp-councilors';
const INAUGURATION = 'dagupan-sp-2025-inauguration';
const CALAMITY = 'dagupan-lgu-2026-state-of-calamity';
const ELECTION = 'dagupan-lgu-2025-local-election-results';
const COMELEC = 'comelec-2025-nle-results-dagupan';
const WASTE = 'dagupan-lgu-2026-waste-segregation';
const TEACHERS = 'dagupan-lgu-2026-world-teachers-day';
const MAYOR_PAGE = 'dagupan-lgu-city-mayor-profile';
const VICE_MAYOR_PAGE = 'dagupan-lgu-vice-mayor-profile';
const SP_VICE_MAYOR_PAGE = 'dagupan-sp-vice-mayor-profile';

/**
 * Which editorial act a source represents. Corroboration is counted in
 * families, never in pages, as in departmentProvenance.test.ts.
 *
 * The council site's vice-mayor page repeats the city page's profile word for
 * word, so although it is published by a different body it is counted in the
 * same family: two copies of one text are one statement.
 */
const SOURCE_FAMILY: Record<string, string> = {
  [MAYOR_PAGE]: 'city-officials-pages',
  [VICE_MAYOR_PAGE]: 'city-officials-pages',
  [SP_VICE_MAYOR_PAGE]: 'city-officials-pages',
  [ELECTION]: 'city-news',
  [CALAMITY]: 'city-news',
  [WASTE]: 'city-news',
  [TEACHERS]: 'city-news',
  [ROSTER]: 'council-site',
  [INAUGURATION]: 'council-site',
  [COMELEC]: 'comelec-results',
};

/**
 * Every name exactly as each cited source prints it, honorifics, nicknames
 * and all. This is the evidence the published names are checked against: a
 * record may cite a source only if that source's rendering appears here and
 * agrees with the published name on surname and a given name.
 *
 * Sources that name someone only by nickname are deliberately absent. The
 * city's election article calls Councilor Tamayo "Atty. Joey Tamayo" and
 * COMELEC's ballot reads "TAMAYO, ATTY JOEY": neither gives the given name
 * Jose, so neither is counted, however obviously they mean the same person.
 */
const NAMED_AS: Record<string, Record<string, string>> = {
  'city-mayor': {
    [MAYOR_PAGE]: 'Mayor Belen T. Fernandez',
    [ELECTION]: 'Belen Fernandez',
    [TEACHERS]: 'Mayor Belen Fernandez',
    [COMELEC]: 'FERNANDEZ, BELEN (PFP)',
  },
  'city-vice-mayor': {
    [VICE_MAYOR_PAGE]: 'Vice Mayor Dean Bryan L. Kua',
    [SP_VICE_MAYOR_PAGE]: 'Hon. Dean Bryan L. Kua',
    [INAUGURATION]: 'Vice Mayor Dean Bryan L. Kua',
    [ELECTION]: 'Dean Bryan “BK” Kua',
    [TEACHERS]: 'Vice Mayor Dean Bryan Kua',
    [COMELEC]: 'KUA, BRYAN BK (PFP)',
  },
  'danielle-francine-b-canto': {
    [ROSTER]: 'Hon. Danielle Francine B. Canto',
    [INAUGURATION]: 'Hon. Danielle Francine B. Canto',
    [CALAMITY]: 'Councilor Danielle Francine B. Canto',
  },
  'jalice-d-cayabyab-md': {
    [ROSTER]: 'Hon. Jalice D. Cayabyab, MD',
    [INAUGURATION]: 'Hon. Jalice D. Cayabyab, MD',
    [CALAMITY]: 'Councilor Jalice D. Cayabyab, M.D.',
  },
  'marvin-dv-fabia': {
    [ROSTER]: 'Hon. Marvin DV. Fabia',
    [INAUGURATION]: 'Hon. Marvin DV. Fabia',
    [CALAMITY]: 'Councilor Marvin V. Fabia',
    [ELECTION]: 'Marvin Fabia',
    [COMELEC]: 'FABIA, MARVIN (PFP)',
  },
  'michael-b-fernandez': {
    [ROSTER]: 'Hon. Michael B. Fernandez',
    [INAUGURATION]: 'Hon. Michael B. Fernandez',
    [CALAMITY]: 'Councilor Michael B. Fernandez',
    [ELECTION]: 'Michael Fernandez',
    [COMELEC]: 'FERNANDEZ, MICHAEL (PFP)',
  },
  'christel-hilary-paras': {
    [ROSTER]: 'Hon. Christel Hilary Paras',
    [INAUGURATION]: 'Hon. Christel Hilary Paras',
    [CALAMITY]: 'Councilor Christel Hilary U. Paras',
  },
  'karlos-liberato-e-reyna-iv': {
    [ROSTER]: 'Hon. Karlos Liberato E. Reyna IV',
    [INAUGURATION]: 'Hon. Karlos Liberato E. Reyna IV',
    [CALAMITY]: 'Councilor Karlos Liberato E. Reyna IV',
    [ELECTION]: 'Karlos Reyna',
    [COMELEC]: 'REYNA, KARLOS (PFP)',
  },
  'ma-librada-fe-m-reyna': {
    [ROSTER]: 'Hon. Ma. Librada Fe M. Reyna',
    [INAUGURATION]: 'Hon. Maria Librada Fe M. Reyna',
    [CALAMITY]: 'Councilor Maria Librada Fe M. Reyna',
  },
  'luis-m-samson-jr': {
    [ROSTER]: 'Hon. Luis M. Samson Jr.',
    [INAUGURATION]: 'Hon. Luis M. Samson Jr.',
    [CALAMITY]: 'Councilor Luis M. Samson Jr.',
  },
  'jeslito-c-seen': {
    [ROSTER]: 'Hon. Jeslito C. Seen',
    [INAUGURATION]: 'Hon. Jeslito C. Seen',
    [CALAMITY]: 'Councilor Jeslito C. Seen',
  },
  'jose-netu-m-tamayo': {
    [ROSTER]: 'Hon. Jose Netu M. Tamayo',
    [INAUGURATION]: 'Hon. Jose Netu M. Tamayo',
    [CALAMITY]: 'Councilor Jose Netu M. Tamayo',
  },
  'marcelino-d-fernandez': {
    [ROSTER]: 'Hon. Marcelino D. Fernandez',
    [CALAMITY]: 'Councilor Marcelino D. Fernandez',
    [WASTE]: 'Kap. Marcelino Fernandez',
    [TEACHERS]: 'Marcelino Fernandez',
  },
  'bradley-claude-c-benavides': {
    [ROSTER]: 'Hon. Bradley Claude C. Benavides',
    [CALAMITY]: 'Councilor Bradley Claude C. Benavides',
    [WASTE]: 'Bradley Benavides',
    [TEACHERS]: 'Bradley Benavides',
  },
};

/**
 * The source each record's published spelling is taken from: the council's
 * own roster for its members, the city's own profile page for the executive.
 */
const NAMING_AUTHORITY: Record<string, string> = {
  'city-mayor': MAYOR_PAGE,
  'city-vice-mayor': VICE_MAYOR_PAGE,
};

/** Sources that tie a holder to the term that began with the 2025 election. */
const TERM_SOURCES = [ELECTION, COMELEC, INAUGURATION];

/** Sources that say which presidency each ex-officio member holds. */
const PRESIDENCY_SOURCES = [WASTE, TEACHERS];

/**
 * The council's own statement of its composition: "12 councilors, with 10
 * councilors elected and two councilors elected from the ranks of barangay
 * chairmen and the Sangguniang Kabataan".
 */
const COUNCIL_SIZE = 12;
const ELECTED_COUNCILORS = 10;

const COUNCIL_ADDRESS =
  '2nd Floor SP Building, Dagupan City Hall Complex, A.B. Fernandez Ave., Dagupan City 2400';
/** The council footer and the city's vice-mayor page both print the address. */
const ADDRESS_SOURCES = [ROSTER, VICE_MAYOR_PAGE];

const INHERITED =
  /los ba(ñ|n)os|losbanos\.gov\.ph|sangguniang bayan|betterlb|municipality of/i;
const PLACEHOLDER = /tbd|todo|n\/a|unknown|lorem|sample|example|xxx/i;

/** Titles and post-nominals a source may print around a name. */
const NOT_A_NAME = new Set([
  'hon',
  'councilor',
  'vice',
  'mayor',
  'kap',
  'atty',
  'engr',
  'dr',
  'dra',
  'doc',
  'md',
  'jr',
  'sr',
  'ii',
  'iii',
  'iv',
]);

/**
 * Reduce a printed name to a surname and its given names.
 *
 * Quoted nicknames ("BK") and parenthesised parties ("(PFP)") are dropped.
 * COMELEC prints "SURNAME, GIVEN" in capitals, so that order is reversed.
 * Initials and two-letter tokens are not counted as given names: "M." and
 * "DV." could stand for anything, and "Fe" is too short to tell apart.
 */
function parseName(printed: string): { surname: string; given: string[] } {
  let text = printed
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[“"][^”"]*[”"]/g, ' ')
    .replace(/,\s*M\.?D\.?$/i, ' ');

  if (text === text.toUpperCase() && text.includes(',')) {
    const [surname, given] = text.split(',');
    text = `${given} ${surname}`;
  }

  const tokens = text
    .toLowerCase()
    .split(/[^a-zñ]+/)
    .filter(Boolean)
    .map(token => (token === 'ma' ? 'maria' : token))
    .filter(token => !NOT_A_NAME.has(token));

  const surname = tokens[tokens.length - 1] ?? '';
  const given = tokens.slice(0, -1).filter(token => token.length > 2);

  return { surname, given };
}

/** Surname plus at least one shared given name, the department rule. */
function samePerson(a: string, b: string): boolean {
  const left = parseName(a);
  const right = parseName(b);

  return (
    left.surname === right.surname &&
    left.given.some(name => right.given.includes(name))
  );
}

type Named = { slug: string; name: string | null; sources: string[] };

const council = legislative[0];
const members: CouncilOfficial[] = council?.officials ?? [];
const everyone: Named[] = [...executive, ...members];

describe('elected official records', () => {
  it('validates both files against their schemas', () => {
    const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
    addFormats(ajv);

    for (const [name, data] of [
      ['executive', executive],
      ['legislative', legislative],
    ] as const) {
      const validate = ajv.compile(loadSchema(name));
      const valid = validate(data);

      expect(validate.errors ?? [], name).toEqual([]);
      expect(valid).toBe(true);
    }
  });

  it('publishes the city mayor and the city vice mayor', () => {
    expect(executive.map(o => o.slug)).toEqual([
      'city-mayor',
      'city-vice-mayor',
    ]);
    expect(executive.every(o => o.isElected)).toBe(true);
  });

  it('publishes one council, named for a component city', () => {
    // A city's council is the Sangguniang Panlungsod. The template's
    // Sangguniang Bayan is a municipality's.
    expect(legislative).toHaveLength(1);
    expect(council.chamber).toBe('Sangguniang Panlungsod');
  });

  it('seats the members the council says it has', () => {
    expect(members).toHaveLength(COUNCIL_SIZE);
    expect(members.filter(m => m.seat === 'elected')).toHaveLength(
      ELECTED_COUNCILORS
    );
    expect(members.filter(m => m.seat === 'ex_officio_liga')).toHaveLength(1);
    expect(members.filter(m => m.seat === 'ex_officio_sk')).toHaveLength(1);
  });

  it('gives every seat a unique slug derived from the published name', () => {
    const slugs = everyone.map(o => o.slug);
    expect(new Set(slugs).size).toBe(slugs.length);

    for (const member of members) {
      const expected = member
        .name!.toLowerCase()
        .replace(/['’]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      expect(member.slug).toBe(expected);
    }
  });

  it('holds no duplicate person', () => {
    // Two Reynas and three Fernandezes sit in this government. A shared
    // surname is not the same person; surname plus a given name is.
    const named = everyone.filter(o => o.name !== null);

    for (const [i, a] of named.entries()) {
      for (const b of named.slice(i + 1)) {
        expect(
          samePerson(a.name!, b.name!),
          `${a.slug} and ${b.slug} look like the same person`
        ).toBe(false);
      }
    }
  });

  it('publishes a name only where the status says one is established', () => {
    for (const official of [...executive, ...members]) {
      if (official.name_status === 'published') {
        expect(official.name, official.slug).not.toBeNull();
      } else {
        expect(official.name, official.slug).toBeNull();
      }
    }
  });

  it('cites only known, current, authoritative sources', () => {
    const cited = [
      ...council.sources,
      ...everyone.flatMap(o => o.sources),
      ...council.officials.flatMap(m => m.name_variants.map(v => v.source)),
    ];

    for (const id of cited) {
      expect(hasCivicSource(id), `unknown source "${id}"`).toBe(true);

      const source = getCivicSource(id);
      expect(source.derives_from ?? null, `${id} is derivative`).toBeNull();
      expect(source.coverage ?? null, `${id} is historical`).toBeNull();
      expect(SOURCE_FAMILY[id], `${id} has no family`).toBeDefined();
    }
  });

  it('cites a source for a person only if it prints that person’s name', () => {
    // The load-bearing assertion. Every citation on a record must correspond
    // to an entry in NAMED_AS, and every entry must agree with the published
    // name on surname and a given name. A nickname-only source fails here.
    for (const official of everyone) {
      const evidence = NAMED_AS[official.slug];
      expect(
        evidence,
        `${official.slug} has no recorded evidence`
      ).toBeDefined();

      expect([...official.sources].sort()).toEqual(
        Object.keys(evidence).sort()
      );

      for (const [id, printed] of Object.entries(evidence)) {
        expect(
          samePerson(official.name!, printed),
          `${id} prints "${printed}", which does not match "${official.name}"`
        ).toBe(true);
      }
    }
  });

  it('names every published person on two independent source families', () => {
    for (const official of everyone.filter(o => o.name !== null)) {
      const families = new Set(official.sources.map(id => SOURCE_FAMILY[id]));

      expect(
        families.size,
        `${official.slug} rests on a single source family`
      ).toBeGreaterThanOrEqual(2);
    }
  });

  it('spells each name as its naming authority prints it', () => {
    for (const official of everyone.filter(o => o.name !== null)) {
      const authority = NAMING_AUTHORITY[official.slug] ?? ROSTER;
      const printed = NAMED_AS[official.slug][authority];

      expect(
        printed,
        `${official.slug} has no ${authority} entry`
      ).toBeDefined();
      expect(printed.endsWith(official.name!)).toBe(true);

      // Honorifics belong to the interface, not to the record.
      expect(official.name).not.toMatch(/^(hon|councilor|mayor|vice|kap)\b/i);
    }
  });

  it('attributes every other spelling to a cited source that prints it', () => {
    for (const member of members) {
      for (const variant of member.name_variants) {
        expect(variant.name).not.toBe(member.name);
        expect(member.sources).toContain(variant.source);
        expect(
          NAMED_AS[member.slug][variant.source].endsWith(variant.name)
        ).toBe(true);
      }
    }
  });

  it('states a term only where an election source establishes it', () => {
    for (const official of [...executive, ...members]) {
      if (official.term === null) continue;

      expect(official.term).toBe('2025–2028');
      expect(
        official.sources.some(id => TERM_SOURCES.includes(id)),
        `${official.slug} states a term no cited election source supports`
      ).toBe(true);
    }

    for (const member of members) {
      if (member.seat === 'elected') {
        expect(member.term, member.slug).toBe('2025–2028');
      } else {
        // These seats follow the Liga and SK federation terms, which no
        // cited source states. Borrowing the elected members' term would
        // be inference.
        expect(member.term, member.slug).toBeNull();
      }
    }

    expect(council.term).toBe('2025–2028');
    expect(council.sources.some(id => TERM_SOURCES.includes(id))).toBe(true);
  });

  it('assigns the ex-officio seats only on a source naming the presidency', () => {
    for (const member of members.filter(m => m.seat !== 'elected')) {
      expect(
        member.sources.filter(id => PRESIDENCY_SOURCES.includes(id)).length,
        `${member.slug} holds an ex-officio seat no cited source assigns`
      ).toBeGreaterThan(0);
    }
  });

  it('records the presiding officer once, as the vice mayor', () => {
    expect(council.presiding_officer).toBe('city-vice-mayor');
    expect(executive.map(o => o.slug)).toContain(council.presiding_officer);
  });

  it('withholds the committee assignments the sources disagree about', () => {
    // Two council profiles each claim the chair of the Committee on Health and
    // Sanitation, and a dated city article gives another committee's chair to
    // a third councilor. See the dagupan-sp-councilors notes.
    expect(council.committees_status).toBe('conflicting_sources');
    expect(council.permanent_committees).toEqual([]);
  });

  it('publishes the council address and website only as two families print them', () => {
    expect(council.address).toBe(COUNCIL_ADDRESS);
    expect(council.website).toBe('https://sp.dagupan.gov.ph/');

    for (const id of ADDRESS_SOURCES) {
      expect(council.sources).toContain(id);
    }
    expect(new Set(ADDRESS_SOURCES.map(id => SOURCE_FAMILY[id])).size).toBe(2);
  });

  it('invents no contact detail for any official', () => {
    for (const official of executive) {
      expect(official.address, official.slug).toBeNull();
      expect(official.phone, official.slug).toBeNull();
      expect(official.email, official.slug).toBeNull();
      expect(official.website, official.slug).toBeNull();
    }

    for (const member of members) {
      expect(member.contact, member.slug).toBeNull();
      expect(member.website, member.slug).toBeNull();
    }

    expect(council.trunkline).toBeNull();
    expect(council.email).toBeNull();
  });

  it('carries no placeholder text in a published name', () => {
    for (const official of everyone) {
      expect(official.name ?? '').not.toMatch(PLACEHOLDER);
      expect(official.slug).not.toMatch(PLACEHOLDER);
      expect((official.name ?? '').trim()).toBe(official.name ?? '');
    }
  });

  it('mentions no inherited LGU', () => {
    expect(JSON.stringify(executive)).not.toMatch(INHERITED);
    expect(JSON.stringify(legislative)).not.toMatch(INHERITED);
  });
});

describe('name matching', () => {
  // The rule is only as good as its parser, so pin its behaviour on the
  // cases this dataset actually contains.
  it('matches surname and a given name across the forms sources print', () => {
    expect(samePerson('Dean Bryan L. Kua', 'KUA, BRYAN BK (PFP)')).toBe(true);
    expect(samePerson('Dean Bryan L. Kua', 'Dean Bryan “BK” Kua')).toBe(true);
    expect(samePerson('Karlos Liberato E. Reyna IV', 'Karlos Reyna')).toBe(
      true
    );
    expect(
      samePerson('Ma. Librada Fe M. Reyna', 'Maria Librada Fe M. Reyna')
    ).toBe(true);
    expect(
      samePerson('Jalice D. Cayabyab, MD', 'Councilor Jalice D. Cayabyab, M.D.')
    ).toBe(true);
  });

  it('does not accept a nickname or a shared surname as agreement', () => {
    expect(samePerson('Jose Netu M. Tamayo', 'TAMAYO, ATTY JOEY (PFP)')).toBe(
      false
    );
    expect(
      samePerson('Ma. Librada Fe M. Reyna', 'REYNA, DADA MANAOIS (NP)')
    ).toBe(false);
    expect(samePerson('Michael B. Fernandez', 'Marcelino D. Fernandez')).toBe(
      false
    );
    expect(samePerson('Belen T. Fernandez', 'Michael B. Fernandez')).toBe(
      false
    );
  });
});
