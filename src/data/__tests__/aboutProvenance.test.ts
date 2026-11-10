import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { describe, expect, it } from 'vitest';

import { getCivicSource, hasCivicSource } from '@/lib/civicSources';
import { historyDatePrecision } from '@/lib/historyDates';

import highlightsRaw from '@/data/about/highlights.json';
import historyRaw from '@/data/about/history.json';
import barangays from '@/data/directory/barangays.json';
import population from '@/data/statistics/population.json';

import type { HistoryHighlight, HistoryMilestone } from '@/types/aboutTypes';

/**
 * The history timeline is the one section a reader is most likely to repeat
 * as settled fact, and the one most crowded with unofficial retellings. These
 * tests pin every published milestone to the official text it rests on, and
 * keep out what only an unofficial or single city page states.
 *
 * See docs/civic-data-verification.md, "Worked example: the history
 * timeline".
 */
const history = historyRaw as HistoryMilestone[];
const highlights = highlightsRaw as HistoryHighlight[];

const loadSchema = (name: string) =>
  JSON.parse(
    readFileSync(
      join(process.cwd(), `src/data/about/schema/${name}.schema.json`),
      'utf8'
    )
  );

/** Every published milestone: its date and the instrument it rests on. */
const EXPECTED: [string, string, string][] = [
  ['city-charter-approved', '1947-06-20', 'Republic Act No. 170'],
  ['organization-date-fixed', '1947-10-15', 'Executive Order No. 96'],
  [
    'organization-date-and-territory-restated',
    '1947-12-31',
    'Executive Order No. 115',
  ],
  ['municipal-board-and-provincial-vote', '1950-06-10', 'Republic Act No. 484'],
  ['city-offices-made-elective', '1959-06-19', 'Republic Act No. 2259'],
  ['assistant-city-fiscals', '1965-06-19', 'Republic Act No. 4291'],
  ['city-court-branches', '1973-07-06', 'Presidential Decree No. 235'],
];

/**
 * The city-published history page. It is cited for the charter's date and
 * number only, which the charter's own text also states; everything else on
 * the page is stated by no other official source read, so it is not used.
 */
const CITY_HISTORY_PAGE = 'dagupan-sp-about-us';

/**
 * Claims found on the city-published page, or in unofficial retellings, that
 * no second official source states. None may be published until one does.
 */
const WITHHELD =
  /bacnotan|nandaragupan|where people meet|flores|lesser sunda|malong|eugenio perez|earthquake|liberation|macarthur|katipun/i;

/**
 * Claims this edition deliberately does not make. The PSA calls the city an
 * independent component city, but the PSA is not the classifying authority,
 * and the 1987 apportionment ordinance was not found in an official copy.
 */
const NOT_ASSERTED =
  /independent component|legislative district|congressional/i;

const INHERITED =
  /los ba(ñ|n)os|losbanos\.gov\.ph|sangguniang bayan|betterlb|laguna/i;

const validator = (name: string) => {
  const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
  addFormats(ajv);
  return ajv.compile(loadSchema(name));
};

describe('history timeline', () => {
  it('validates against the history schema', () => {
    const validate = validator('history');
    const valid = validate(history);

    expect(validate.errors ?? []).toEqual([]);
    expect(valid).toBe(true);
  });

  it('publishes exactly the verified milestones, in order', () => {
    expect(history.map(m => [m.slug, m.date, m.instrument])).toEqual(EXPECTED);
  });

  it('gives every milestone a unique slug and title', () => {
    expect(new Set(history.map(m => m.slug)).size).toBe(history.length);
    expect(new Set(history.map(m => m.title)).size).toBe(history.length);
  });

  it('stores real dates, no more precise than stated, in chronological order', () => {
    const today = new Date().toISOString().slice(0, 10);

    for (const milestone of history) {
      expect(historyDatePrecision(milestone.date), milestone.slug).not.toBe(
        null
      );
      expect(milestone.date <= today, milestone.slug).toBe(true);
    }

    // Partial ISO dates sort lexicographically, so string order is time order.
    const dates = history.map(m => m.date);
    expect([...dates].sort()).toEqual(dates);
  });

  it('backs every milestone with resolvable, current, authoritative sources', () => {
    for (const milestone of history) {
      expect(milestone.sources.length, milestone.slug).toBeGreaterThan(0);

      for (const id of milestone.sources) {
        expect(hasCivicSource(id), `${milestone.slug}: "${id}"`).toBe(true);

        const source = getCivicSource(id);
        // Never a redistributor, and never a page marked historical.
        expect(source.derives_from ?? null, id).toBeNull();
        expect(source.coverage ?? null, id).toBeNull();
      }
    }
  });

  it('dates each milestone exactly as its instrument states it', () => {
    // The first source of every entry is the official text of the
    // instrument it names. Its title must name that instrument and its
    // stated date must be the milestone's date, so a date typed into the
    // timeline cannot drift from the document that establishes it.
    for (const milestone of history) {
      const [primary] = milestone.sources;
      const source = getCivicSource(primary);

      expect(source.agency, milestone.slug).toBe(
        'Supreme Court of the Philippines'
      );
      expect(source.url, milestone.slug).toMatch(
        /^https:\/\/elibrary\.judiciary\.gov\.ph\/thebookshelf\/showdocs\//
      );
      expect(
        source.title.startsWith(`${milestone.instrument} — `),
        milestone.slug
      ).toBe(true);
      expect(source.data_as_of, milestone.slug).toBe(milestone.date);
    }
  });

  it('cites the city-published page only where the charter text agrees', () => {
    const citing = history
      .filter(m => m.sources.includes(CITY_HISTORY_PAGE))
      .map(m => m.slug);

    expect(citing).toEqual(['city-charter-approved']);

    const page = getCivicSource(CITY_HISTORY_PAGE);
    expect(page.notes).toContain('June 20, 1947');
    expect(page.notes).toContain('Republic Act No. 170');
  });

  it('keeps out what only one city page or unofficial sources state', () => {
    const serialised = JSON.stringify([history, highlights]);

    expect(serialised).not.toMatch(WITHHELD);
    expect(serialised).not.toMatch(NOT_ASSERTED);
  });

  it('does not claim the city government was organized, only that a date was fixed', () => {
    // The executive orders fix 1 January 1948; neither records that the
    // organization happened. The court decision that does was found only on
    // a secondary mirror, so no "organized" entry is published.
    expect(history.some(m => m.date.startsWith('1948'))).toBe(false);
    expect(JSON.stringify(history)).not.toMatch(/\bwas organized\b/i);
  });

  it('mentions no inherited LGU', () => {
    expect(JSON.stringify([history, highlights])).not.toMatch(INHERITED);
  });
});

describe('history highlights', () => {
  it('validates against the highlights schema', () => {
    const validate = validator('highlights');
    const valid = validate(highlights);

    expect(validate.errors ?? []).toEqual([]);
    expect(valid).toBe(true);
  });

  it('gives every highlight a unique slug and resolvable sources', () => {
    expect(new Set(highlights.map(h => h.slug)).size).toBe(highlights.length);

    for (const highlight of highlights) {
      for (const id of highlight.sources) {
        expect(hasCivicSource(id), `${highlight.slug}: "${id}"`).toBe(true);
        expect(getCivicSource(id).derives_from ?? null, id).toBeNull();
        expect(getCivicSource(id).coverage ?? null, id).toBeNull();
      }
    }
  });

  it('states the barangay count the barangay index publishes', () => {
    // The count is written into the highlight, so it must agree with the
    // index it summarises, and cite the same authority.
    const highlight = highlights.find(h => h.slug === 'barangays')!;

    expect(highlight.title).toBe(`${barangays.length} barangays`);
    expect(barangays.length).toBe(31);
    for (const record of barangays) {
      expect(record.sources).toEqual(expect.arrayContaining(highlight.sources));
    }
  });

  it('states the 2024 population the census series publishes', () => {
    const highlight = highlights.find(h => h.slug === 'population-2024')!;
    const census = population.municipality.history.find(h => h.year === 2024)!;

    expect(highlight.title).toBe(
      `${census.population.toLocaleString('en-US')} residents`
    );
    expect(census.population).toBe(174777);
    // Every source the highlight cites also backs the published census count.
    expect(census.sources).toEqual(expect.arrayContaining(highlight.sources));
  });

  it('dates the charter highlight as the timeline does', () => {
    const highlight = highlights.find(h => h.slug === 'chartered-city')!;
    const charter = history.find(m => m.slug === 'city-charter-approved')!;

    expect(highlight.sources).toEqual([charter.sources[0]]);
    expect(highlight.title).toContain(charter.date.slice(0, 4));
    expect(highlight.description).toContain('20 June 1947');
  });
});
