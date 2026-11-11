import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { describe, expect, it } from 'vitest';

import { getCivicSource, hasCivicSource } from '@/lib/civicSources';

import barangaysRaw from '@/data/directory/barangays.json';
import legislativeRaw from '@/data/directory/legislative.json';

import type {
  Barangay,
  BarangayOfficial,
  BarangaySeat,
  LegislativeChamber,
  OfficialNameStatus,
} from '@/types/directoryTypes';

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
const legislative = legislativeRaw as LegislativeChamber[];

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

/**
 * The barangay officials. Every name here claims that a person holds a seat
 * now, so the rule is the elected officials' rule: two independent source
 * families, matched on surname and a given name, with what each cited source
 * actually prints recorded below as evidence.
 *
 * The term matters as much as the name. The officials elected on 30 October
 * 2023 are still the incumbents: RA 12232 moved the next election to November
 * 2026, RA 12326 moved it again to November 2028, and COMELEC stopped the
 * November 2026 preparations. A name from an earlier term must never appear.
 */
const ROSTER = 'dagupan-lgu-barangay-captains-sk-chairpersons';
const SP_PROFILE = 'dagupan-sp-councilor-marcelino-d-fernandez';
const SAVING_MAX = 'dagupan-lgu-2024-saving-max';
const BRIGADA = 'dagupan-lgu-2024-brigada-eskwela';
const PUROKALUSUGAN = 'dagupan-lgu-2024-purokalusugan';
const SPEAKER_PEREZ = 'dagupan-lgu-2024-speaker-perez-birthday';
const BOQUIG = 'dagupan-lgu-2024-bonuan-boquig-multipurpose-building';
const WOMENS_MONTH = 'dagupan-lgu-2025-womens-month';
const LOMBOY = 'dagupan-lgu-2025-lomboy-school-building';
const PUGARO = 'dagupan-lgu-2025-pugaro-covered-court';
const CHILD_FRIENDLY = 'dagupan-lgu-2025-child-friendly-city';
const GUESET = 'dagupan-lgu-2026-bonuan-gueset-health-services';
const LECHONAN = 'dagupan-lgu-2026-lechonan-lasip-chico';

/**
 * Corroboration is counted in families, never in pages. The city's news
 * articles are separate dated acts but come from one newsroom, so they are one
 * family; the council's own site is another.
 */
const SOURCE_FAMILY: Record<string, string> = {
  [ROSTER]: 'city-officials-pages',
  [SP_PROFILE]: 'council-site',
  [SAVING_MAX]: 'city-news',
  [BRIGADA]: 'city-news',
  [PUROKALUSUGAN]: 'city-news',
  [SPEAKER_PEREZ]: 'city-news',
  [BOQUIG]: 'city-news',
  [WOMENS_MONTH]: 'city-news',
  [LOMBOY]: 'city-news',
  [PUGARO]: 'city-news',
  [CHILD_FRIENDLY]: 'city-news',
  [GUESET]: 'city-news',
  [LECHONAN]: 'city-news',
};

/** The laws and the COMELEC issuance the 2023–2028 term follows from. */
const TERM_SOURCES = [
  'sc-elibrary-ra-11935-2022',
  'sc-elibrary-ra-12232-2025',
  'sc-elibrary-ra-12326-2026',
  'comelec-mr-26-0842-2026',
];
const TERM = '2023–2028';
/** RA 11935: the term began "at noon of November 30" after the 2023 election. */
const TERM_START = '2023-11-30';

/**
 * Every name exactly as each cited source prints it, with the words around it
 * that put the person in the seat. The roster's column headings ("Barangay
 * Captain", "SK Chairman") state the seat, so its entries are the bare name.
 * Keyed by "<barangay slug>/<seat>".
 */
const NAMED_AS: Record<string, Record<string, string>> = {
  'bolosan/punong_barangay': {
    [ROSTER]: 'Nancy P. Morris',
    [CHILD_FRIENDLY]: 'Bolosan Barangay Captain Nancy Morris',
  },
  'bonuan-binloc/punong_barangay': {
    [ROSTER]: 'Wilmer Castanares',
    [BRIGADA]: 'Bonuan Binloc Punong Barangay Wilmer Castanares',
  },
  'bonuan-binloc/sk_chairperson': {
    [ROSTER]: 'Klee Alcaide',
    [SAVING_MAX]: 'Bonuan Binloc SK President Klee Alcaide',
  },
  'bonuan-boquig/punong_barangay': {
    [ROSTER]: 'Joseph O. Maramba',
    [BOQUIG]: 'Barangay Captain Joseph Maramba',
  },
  'bonuan-boquig/sk_chairperson': {
    [ROSTER]: 'Ava Jel De Guzman',
    [BOQUIG]: 'SK Chairman Ava Jel De Guzman',
  },
  'bonuan-gueset/sk_chairperson': {
    [ROSTER]: 'Jomar Vidal Abalos',
    [GUESET]: 'SK Council sa ilalim ni Chair Jomar Abalos',
  },
  'caranglaan/punong_barangay': {
    [ROSTER]: 'Gregorio Claveria',
    [CHILD_FRIENDLY]: 'Caranglaan Barangay Captain Gregorio “Jun” Claveria',
  },
  'herrero/punong_barangay': {
    [ROSTER]: 'Generoso “Richie” Gomez',
    [SPEAKER_PEREZ]: 'Barangay Council led by Kap. Generoso “Richie” Gomez',
  },
  'herrero/sk_chairperson': {
    [ROSTER]: 'Jean Paul Casaclang',
    [SPEAKER_PEREZ]:
      'Herrero-Perez SK Council led by SK Chairman Jean Paul Casaclang',
  },
  'lasip-chico/punong_barangay': {
    [ROSTER]: 'Aldwin Dexter M. Meneses',
    [LECHONAN]: 'Punong Barangay Aldwin Dexter Meneses',
  },
  'lasip-chico/sk_chairperson': {
    [ROSTER]: 'Jenica Venice Ang',
    [LECHONAN]: 'SK Chairwoman Jenica Venice Ang',
  },
  'lomboy/punong_barangay': {
    [ROSTER]: 'Arsenio DV. Santillan, Sr.',
    [LOMBOY]: 'Lomboy Barangay Kap. Arsenio Santillan',
  },
  'lucao/punong_barangay': {
    [ROSTER]: 'Marcelino D. Fernandez',
    [SP_PROFILE]:
      'Hon. Marcelino D. Fernandez … Brgy. Captain, Lucao Dagupan City 2013 – Present',
  },
  'malued/punong_barangay': {
    [ROSTER]: 'Filipina S. Delos Santos',
    [WOMENS_MONTH]: 'Filipina Delos Santos, Malued Punong Barangay',
  },
  'mayombo/punong_barangay': {
    [ROSTER]: 'Arsenio Curameng',
    [PUROKALUSUGAN]: 'Mayombo Punong Barangay Arsenio Curameng',
  },
  'pantal/punong_barangay': {
    [ROSTER]: 'Julita F. Perez',
    [WOMENS_MONTH]: 'Julita F. Perez, Pantal Punong Barangay',
  },
  'pugaro-suit/sk_chairperson': {
    [ROSTER]: 'Dolly V. Camacho',
    [PUGARO]: 'SK Chairman Dolly Camacho',
  },
};

/** Wording that puts a person in the seat, as the non-roster sources print it. */
const SEAT_WORDING: Record<BarangaySeat, RegExp> = {
  punong_barangay: /Punong Barangay|Barangay Captain|Brgy\. Captain|\bKap\./,
  sk_chairperson:
    /\bSK (Chairman|Chairwoman|Chairperson|President)\b|\bChair\b/,
};

/**
 * The seats where a second source names someone but does not establish the
 * same person in the seat, recorded so the reason for withholding is checked
 * rather than remembered.
 */
const NOT_COUNTED: {
  key: string;
  roster: string;
  printed: string;
  status: OfficialNameStatus;
}[] = [
  {
    // Four city articles from 2024 to 2026 say "Kap. Noel Bumanglag"; the
    // roster says "Manuel B. Bumanglag". A shared surname is not agreement.
    key: 'bonuan-gueset/punong_barangay',
    roster: 'Manuel B. Bumanglag',
    printed: 'Kap. Noel Bumanglag',
    status: 'conflicting_sources',
  },
  {
    // The Pugaro article names him without any title.
    key: 'pugaro-suit/punong_barangay',
    roster: 'Nestor Y. Victorio',
    printed: 'barangay officials led by Nestor Victorio',
    status: 'uncorroborated',
  },
  {
    // The roster names him; city articles call him SK Federation President
    // without naming his barangay, and the roster gave this row to someone
    // else until September 2025.
    key: 'caranglaan/sk_chairperson',
    roster: 'Bradley Claude Benavides',
    printed: 'SK Federation President Bradley Benavides',
    status: 'uncorroborated',
  },
];

const PUBLISHED_PUNONG_BARANGAY = 11;
const PUBLISHED_SK_CHAIRPERSON = 6;

/** Titles and words a source prints around a name. */
const NOT_A_NAME = new Set([
  'hon',
  'kap',
  'kapitan',
  'captain',
  'capt',
  'brgy',
  'barangay',
  'punong',
  'council',
  'led',
  'by',
  'sk',
  'chair',
  'chairman',
  'chairwoman',
  'chairperson',
  'president',
  'sa',
  'ilalim',
  'ni',
  'jr',
  'sr',
]);

/**
 * Reduce a printed name to a surname and its given names. Quoted nicknames
 * (“Richie”, “Jun”) are dropped, as are initials and two-letter tokens: "DV."
 * could stand for anything. Text after a comma is a post or a suffix.
 */
function parseName(printed: string): { surname: string; given: string[] } {
  const name = printed.replace(/[“"][^”"]*[”"]/g, ' ').split(/[,…]/)[0];

  const tokens = name
    .toLowerCase()
    .split(/[^a-zñ]+/)
    .filter(Boolean)
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

type Seat = BarangayOfficial & { key: string; barangay: string };

const seats: Seat[] = barangays.flatMap(barangay =>
  barangay.officials.map(official => ({
    ...official,
    key: `${barangay.slug}/${official.seat}`,
    barangay: barangay.barangay_name,
  }))
);
const named = seats.filter(seat => seat.name !== null);

describe('barangay officials', () => {
  it('lists the Punong Barangay and the SK Chairperson seat of every barangay', () => {
    for (const barangay of barangays) {
      expect(
        barangay.officials.map(o => [o.seat, o.role]),
        barangay.slug
      ).toEqual([
        ['punong_barangay', 'Punong Barangay'],
        ['sk_chairperson', 'Sangguniang Kabataan Chairperson'],
      ]);
    }
  });

  it('publishes the corroborated names, and only those', () => {
    expect([...named.map(seat => seat.key)].sort()).toEqual(
      Object.keys(NAMED_AS).sort()
    );
    expect(named.filter(s => s.seat === 'punong_barangay')).toHaveLength(
      PUBLISHED_PUNONG_BARANGAY
    );
    expect(named.filter(s => s.seat === 'sk_chairperson')).toHaveLength(
      PUBLISHED_SK_CHAIRPERSON
    );
  });

  it('publishes a name only where the status says one is established', () => {
    for (const seat of seats) {
      if (seat.name_status === 'published') {
        expect(seat.name, seat.key).not.toBeNull();
        expect(seat.sources.length, seat.key).toBeGreaterThanOrEqual(2);
      } else {
        // A withheld seat cites nothing: citing the one source that names
        // someone would publish the name by another route.
        expect(seat.name, seat.key).toBeNull();
        expect(seat.sources, seat.key).toEqual([]);
      }
    }
  });

  it('cites only known, current, authoritative sources for a name', () => {
    for (const seat of named) {
      for (const id of seat.sources) {
        expect(hasCivicSource(id), `unknown source "${id}"`).toBe(true);

        const source = getCivicSource(id);
        expect(source.derives_from ?? null, `${id} is derivative`).toBeNull();
        expect(source.coverage ?? null, `${id} is historical`).toBeNull();
        expect(SOURCE_FAMILY[id], `${id} has no family`).toBeDefined();
      }

      // The superseded 2018–2020 roster backs no name.
      expect(seat.sources).not.toContain(
        'dagupan-lgu-barangay-captains-2018-2020'
      );
    }
  });

  it('cites a source for a person only if it prints that person’s name', () => {
    for (const seat of named) {
      const evidence = NAMED_AS[seat.key];
      expect(evidence, `${seat.key} has no recorded evidence`).toBeDefined();
      expect([...seat.sources].sort()).toEqual(Object.keys(evidence).sort());

      for (const [id, printed] of Object.entries(evidence)) {
        expect(
          samePerson(seat.name!, printed),
          `${id} prints "${printed}", which does not match "${seat.name}"`
        ).toBe(true);

        // Outside the roster, whose column headings state the seat, a source
        // counts only if it puts the person in this seat in words.
        if (id !== ROSTER) {
          expect(printed, `${id} does not name the seat`).toMatch(
            SEAT_WORDING[seat.seat]
          );
        }
      }
    }
  });

  it('names every published person on two independent source families', () => {
    for (const seat of named) {
      const families = new Set(seat.sources.map(id => SOURCE_FAMILY[id]));

      expect(
        families.size,
        `${seat.key} rests on a single source family`
      ).toBeGreaterThanOrEqual(2);
    }
  });

  it('spells each name as the city’s roster prints it', () => {
    for (const seat of named) {
      expect(seat.sources).toContain(ROSTER);
      expect(NAMED_AS[seat.key][ROSTER]).toBe(seat.name);
      expect(seat.name).not.toMatch(/^(hon|kap|capt|punong)\b/i);
      expect(seat.name!.trim()).toBe(seat.name);
    }
  });

  it('counts only articles written during the current term', () => {
    // An article from before 30 November 2023 describes the previous term's
    // officials, however familiar the name.
    for (const seat of named) {
      for (const id of seat.sources) {
        if (SOURCE_FAMILY[id] !== 'city-news') continue;

        const published = getCivicSource(id).published;
        expect(published, `${id} has no date`).not.toBeNull();
        expect(published! >= TERM_START, `${id} predates the term`).toBe(true);
      }
    }
  });

  it('records why each withheld seat has no name', () => {
    for (const { key, roster, printed, status } of NOT_COUNTED) {
      const seat = seats.find(s => s.key === key)!;
      expect(seat.name_status, key).toBe(status);

      // Either the names disagree, or the source does not put the person in
      // this seat: "SK Federation President" is a city post, not a barangay's.
      const agrees =
        samePerson(roster, printed) && SEAT_WORDING[seat.seat].test(printed);
      expect(agrees, key).toBe(false);
    }

    const conflicting = seats.filter(
      s => s.name_status === 'conflicting_sources'
    );
    expect(conflicting.map(s => s.key)).toEqual([
      'bonuan-gueset/punong_barangay',
    ]);

    // Every other withheld seat is named by the roster alone.
    for (const seat of seats.filter(s => s.name === null)) {
      if (seat.name_status !== 'conflicting_sources') {
        expect(seat.name_status, seat.key).toBe('uncorroborated');
      }
    }
  });

  it('states the 2023–2028 term for every seat, from the laws that set it', () => {
    for (const seat of seats) {
      expect(seat.term, seat.key).toBe(TERM);
      expect(seat.term_sources, seat.key).toEqual(TERM_SOURCES);
    }

    for (const id of TERM_SOURCES) {
      const source = getCivicSource(id);
      expect(source.derives_from ?? null, id).toBeNull();
      expect(source.coverage ?? null, id).toBeNull();
    }

    // RA 11935 set the 2023 election; RA 12326, approved after the election
    // RA 12232 had scheduled for November 2026 was due, is the law in force.
    expect(getCivicSource('sc-elibrary-ra-11935-2022').data_as_of).toBe(
      '2022-10-10'
    );
    expect(getCivicSource('sc-elibrary-ra-12326-2026').data_as_of).toBe(
      '2026-09-24'
    );
    expect(getCivicSource('comelec-mr-26-0842-2026').published).toBe(
      '2026-09-25'
    );
  });

  it('holds no person in two seats', () => {
    for (const [i, a] of named.entries()) {
      for (const b of named.slice(i + 1)) {
        expect(
          samePerson(a.name!, b.name!),
          `${a.key} and ${b.key} look like the same person`
        ).toBe(false);
      }
    }
  });

  it('agrees with the council about the Liga president', () => {
    // The Liga ng mga Barangay president sits on the council ex officio and is
    // a Punong Barangay. The two datasets must name the same person, spelled
    // the same way, or one of them has drifted.
    const liga = legislative[0].officials.find(
      member => member.seat === 'ex_officio_liga'
    )!;
    const lucao = seats.find(s => s.key === 'lucao/punong_barangay')!;

    expect(lucao.name).toBe(liga.name);
  });
});
