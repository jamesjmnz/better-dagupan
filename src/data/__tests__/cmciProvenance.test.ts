import { describe, expect, it } from 'vitest';

import { getCivicSource, hasCivicSource } from '@/lib/civicSources';

import cmciRaw from '@/data/statistics/cmci.json';

import type { CMCIData } from '@/types/statisticsTypes';

/**
 * Dagupan's Cities and Municipalities Competitiveness Index scores, from
 * DTI's CMCI portal. DTI is the only publisher, so the checks are that its
 * figures add up as its own method says (the overall score is the sum of the
 * pillar scores, and each pillar the sum of its indicators) and that its
 * profile and rankings pages agree. See docs/civic-data-verification.md,
 * "Worked example: competitiveness scores".
 */
const cmci = cmciRaw as unknown as CMCIData;
const editions = cmci.editions;

/** DTI's overall score and rank for Dagupan among component cities. */
const EXPECTED_OVERALL = [
  { year: 2014, score: 33.54, rank: 44 },
  { year: 2015, score: 40.4453, rank: 19 },
  { year: 2016, score: 41.2032, rank: 15 },
  { year: 2017, score: 46.0787, rank: 13 },
  { year: 2018, score: 48.4876, rank: 14 },
  { year: 2019, score: 43.5678, rank: 25 },
  { year: 2020, score: 44.5945, rank: 23 },
  { year: 2021, score: 41.7571, rank: 16 },
  { year: 2022, score: 37.3492, rank: 32 },
  { year: 2023, score: 33.2626, rank: 70 },
  { year: 2024, score: 38.7925, rank: 47 },
];

/** The pillars DTI scored, by edition. */
const PILLARS_3 = [
  'Economic Dynamism',
  'Government Efficiency',
  'Infrastructure',
];
const PILLARS_4 = [...PILLARS_3, 'Resiliency'];
const PILLARS_5 = [...PILLARS_4, 'Innovation'];
const pillarsFor = (year: number) =>
  year <= 2016 ? PILLARS_3 : year <= 2021 ? PILLARS_4 : PILLARS_5;

/** Two decimals where DTI states only the profile's rounded dial. */
const decimalsOf = (n: number) => (String(n).split('.')[1] ?? '').length;

const INHERITED = /los ba(ñ|n)os|laguna|calabarzon|region iv-a/i;

describe('competitiveness index', () => {
  it('publishes the overall score and rank DTI states for each edition', () => {
    expect(
      editions.map(e => ({
        year: e.year,
        score: e.overall_score,
        rank: e.overall_rank,
      }))
    ).toEqual(EXPECTED_OVERALL);
  });

  it('lists each edition once, in ascending order', () => {
    const years = editions.map(e => e.year);
    expect(new Set(years).size).toBe(years.length);
    expect([...years].sort((a, b) => a - b)).toEqual(years);
  });

  it('records the category and peer group only as DTI states them', () => {
    expect(cmci.meta.lgu_name_as_published).toBe('Dagupan');
    for (const e of editions) {
      expect(e.category, String(e.year)).toBe('Component City');
      // Either both are stated or neither: no count is inferred.
      expect(e.peer_group === null, String(e.year)).toBe(e.peer_count === null);
    }
    expect(
      editions.filter(e => e.peer_count).map(e => [e.year, e.peer_count])
    ).toEqual([
      [2017, 112],
      [2018, 112],
      [2019, 112],
      [2020, 112],
      [2022, 114],
      [2023, 114],
      [2024, 116],
    ]);
  });

  it('keeps the pillars DTI scored in each edition, and no others', () => {
    for (const e of editions) {
      expect(
        e.pillars.map(p => p.name),
        String(e.year)
      ).toEqual(pillarsFor(e.year));
    }
  });

  it('adds the pillar scores up to the overall score', () => {
    for (const e of editions) {
      const sum = e.pillars.reduce((a, p) => a + p.score, 0);
      if (decimalsOf(e.overall_score) <= 2) {
        // Only the profile's two-decimal dial exists (2014).
        expect(Math.abs(sum - e.overall_score), String(e.year)).toBeLessThan(
          0.005
        );
      } else {
        // Four-decimal figures, each rounded: allow a unit in the last place
        // per pillar.
        expect(
          Math.abs(sum - e.overall_score),
          String(e.year)
        ).toBeLessThanOrEqual(0.0001 * e.pillars.length + 1e-9);
      }
    }
  });

  it('adds each published indicator breakdown up to its pillar score', () => {
    for (const e of editions) {
      for (const p of e.pillars) {
        if (p.indicators_status !== 'published') continue;
        expect(p.indicators.length, `${e.year} ${p.name}`).toBeGreaterThan(0);
        const sum = p.indicators.reduce((a, i) => a + i.score, 0);
        expect(
          Math.abs(sum - p.score),
          `${e.year} ${p.name}`
        ).toBeLessThanOrEqual(0.0001 * p.indicators.length + 1e-9);
      }
    }
  });

  it('withholds only the 2014 Government Efficiency breakdown', () => {
    const withheld = editions.flatMap(e =>
      e.pillars
        .filter(p => p.indicators_status !== 'published')
        .map(p => ({ year: e.year, pillar: p.name, p }))
    );
    expect(
      withheld.map(w => [w.year, w.pillar, w.p.indicators_status])
    ).toEqual([[2014, 'Government Efficiency', 'inconsistent_in_source']]);
    // The pillar itself is still published; only its breakdown is not.
    expect(withheld[0]?.p.indicators).toEqual([]);
    expect(withheld[0]?.p.score).toBe(17.3893);
  });

  it('states ranks as positive whole numbers within the peer group', () => {
    for (const e of editions) {
      const ranks = [
        e.overall_rank,
        ...e.pillars.flatMap(p => [p.rank, ...p.indicators.map(i => i.rank)]),
      ];
      for (const rank of ranks) {
        expect(Number.isInteger(rank)).toBe(true);
        expect(rank).toBeGreaterThan(0);
        if (e.peer_count) expect(rank).toBeLessThanOrEqual(e.peer_count);
      }
    }
  });

  it('cites DTI pages for its own edition', () => {
    for (const e of editions) {
      const expected = [`dti-cmci-dagupan-profile-${e.year}`];
      // DTI's rankings-data page offers no 2014 table.
      if (e.year >= 2015) {
        expected.push(`dti-cmci-rankings-component-cities-${e.year}`);
      }
      expect(e.sources).toEqual(expected);

      for (const id of e.sources) {
        expect(hasCivicSource(id), `unknown source "${id}"`).toBe(true);
        const source = getCivicSource(id);
        expect(source.agency).toBe('Department of Trade and Industry');
        expect(source.derives_from).toBeNull();
        expect(source.coverage).toBe(`CMCI ${e.year}`);
        expect(source.url).toMatch(/^https:\/\/cmci\.dti\.gov\.ph\//);
      }
      const profile = getCivicSource(expected[0] as string);
      expect(profile.url).toContain('lgu=Dagupan');
    }
  });

  it('mentions no inherited LGU', () => {
    expect(JSON.stringify(cmci)).not.toMatch(INHERITED);
  });
});
