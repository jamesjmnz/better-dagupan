import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { describe, expect, it } from 'vitest';

import { getCivicSource, hasCivicSource } from '@/lib/civicSources';
import {
  BARANGAY_INDEX_CENSUS_YEAR,
  populationData,
  resolvePopulation,
} from '@/lib/populationStatistics';

import barangaysRaw from '@/data/directory/barangays.json';
import populationRaw from '@/data/statistics/population.json';

import type { Barangay } from '@/types/directoryTypes';
import type { PopulationDataset } from '@/types/populationTypes';

/**
 * The census series is the first statistics dataset Better Dagupan publishes.
 * Every figure is a PSA census count, cross-checked against a second PSA
 * publication, and the barangay parts must add up to the city whole for every
 * census year. See docs/civic-data-verification.md, "Worked example: census
 * population".
 */
const dataset = populationRaw as PopulationDataset;
const barangays = barangaysRaw as Barangay[];

const schema = JSON.parse(
  readFileSync(
    join(process.cwd(), 'src/data/statistics/schema/population.schema.json'),
    'utf8'
  )
);

/**
 * The PSA counts for the City of Dagupan, as stated in the 2024 POPCEN Table B
 * (sheet R01) and corroborated year by year by a second PSA publication.
 */
const EXPECTED_HISTORY = [
  { year: 2010, population: 163676 },
  { year: 2015, population: 171271 },
  { year: 2020, population: 174302 },
  { year: 2024, population: 174777 },
];

/** Census reference dates as stated in the same table's column headings. */
const EXPECTED_CENSUS_DATES = {
  '2010': '2010-05-01',
  '2015': '2015-08-01',
  '2020': '2020-05-01',
  '2024': '2024-07-01',
};

const TABLE_B = 'psa-2024-popcen-table-b-by-region';

const INHERITED =
  /los ba(ñ|n)os|losbanos\.gov\.ph|sangguniang bayan|betterlb|municipality of|batong malake|mayondon|san antonio/i;

const allCitedIds = (): string[] => [
  ...dataset.municipality.history.flatMap(h => h.sources),
  ...dataset.municipality.growthRates.flatMap(r => r.sources),
  ...dataset.barangays.flatMap(b => b.history.flatMap(h => h.sources)),
];

describe('population statistics', () => {
  it('validates against the population schema', () => {
    const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
    addFormats(ajv);

    const validate = ajv.compile(schema);
    const valid = validate(dataset);

    expect(validate.errors ?? []).toEqual([]);
    expect(valid).toBe(true);
  });

  it('publishes the PSA census counts for the city, exactly', () => {
    expect(
      dataset.municipality.history.map(({ year, population }) => ({
        year,
        population,
      }))
    ).toEqual(EXPECTED_HISTORY);
    expect(dataset.meta.censusDates).toEqual(EXPECTED_CENSUS_DATES);
  });

  it('lists census years once each, in ascending order', () => {
    const years = dataset.municipality.history.map(h => h.year);

    expect(new Set(years).size).toBe(years.length);
    expect([...years].sort((a, b) => a - b)).toEqual(years);

    // Every census year has a stated reference date, and no date is listed
    // for a year that has no count.
    expect(Object.keys(dataset.meta.censusDates).sort()).toEqual(
      years.map(String)
    );
  });

  it('matches the barangay index on the latest city total', () => {
    // The 2024 city total appears in two files: here and, as the sum of its
    // parts, in the barangay index. They must never drift apart.
    const history = dataset.municipality.history;
    const latest = history[history.length - 1];
    const indexTotal = barangays.reduce(
      (sum, b) => sum + b.population_2024_popcen,
      0
    );

    expect(latest?.year).toBe(BARANGAY_INDEX_CENSUS_YEAR);
    expect(latest?.population).toBe(indexTotal);
  });

  it('adds the barangay counts up to the city total for every census year', () => {
    // The strongest check on the transcription: the PSA publishes the whole
    // and its parts, so a mistyped, dropped or duplicated barangay figure in
    // any year breaks the sum.
    const byYear = new Map<number, number>();

    for (const barangay of populationData.barangays) {
      for (const point of barangay.history) {
        byYear.set(
          point.year,
          (byYear.get(point.year) ?? 0) + point.population
        );
      }
    }

    // 2010 has a city count but no verified barangay table.
    expect([...byYear.keys()].sort()).toEqual([2015, 2020, 2024]);

    for (const [year, total] of byYear) {
      const city = dataset.municipality.history.find(h => h.year === year);
      expect(total, `barangays in ${year}`).toBe(city?.population);
    }
  });

  it('covers every barangay in the index exactly once', () => {
    const slugs = dataset.barangays.map(b => b.slug);

    expect(new Set(slugs).size).toBe(slugs.length);
    expect([...slugs].sort()).toEqual(barangays.map(b => b.slug).sort());
  });

  it('takes the 2024 barangay counts from the index rather than copying them', () => {
    // A second copy of the PSGC figures would be a second thing to keep in
    // step. The stored file holds only earlier censuses.
    for (const record of dataset.barangays) {
      expect(record.history.map(h => h.year)).not.toContain(
        BARANGAY_INDEX_CENSUS_YEAR
      );
    }

    for (const resolved of populationData.barangays) {
      const indexed = barangays.find(b => b.slug === resolved.id);
      const latest = resolved.history[resolved.history.length - 1];

      expect(resolved.name).toBe(indexed?.barangay_name);
      expect(latest?.year).toBe(BARANGAY_INDEX_CENSUS_YEAR);
      expect(latest?.population).toBe(indexed?.population_2024_popcen);
      expect(latest?.sources).toEqual(indexed?.sources);

      const years = resolved.history.map(h => h.year);
      expect([...years].sort((a, b) => a - b)).toEqual(years);
      expect(new Set(years).size).toBe(years.length);
    }
  });

  it('refuses a count for a barangay that is not in the index', () => {
    const orphan: PopulationDataset = {
      ...dataset,
      barangays: [{ slug: 'not-a-barangay', history: [] }],
    };

    expect(() => resolvePopulation(orphan, barangays)).toThrow(
      /not-a-barangay/
    );
  });

  it('backs every count and rate with resolvable, authoritative sources', () => {
    for (const id of allCitedIds()) {
      expect(hasCivicSource(id), `unknown source "${id}"`).toBe(true);

      const source = getCivicSource(id);

      expect(source.derives_from ?? null, `derivative "${id}"`).toBeNull();
      expect(source.coverage ?? null, `historical "${id}"`).toBeNull();
      expect(source.agency).toBe('Philippine Statistics Authority');
    }
  });

  it('corroborates each city count with at least two PSA publications', () => {
    for (const point of dataset.municipality.history) {
      expect(
        new Set(point.sources).size,
        `${point.year} sources`
      ).toBeGreaterThanOrEqual(2);
      expect(point.sources).toContain(TABLE_B);
    }
  });

  it('cites, for each census, a source describing that census date', () => {
    // A 2015 count must not rest only on sources describing other dates.
    for (const point of dataset.municipality.history) {
      const dated = point.sources
        .map(getCivicSource)
        .filter(source => source.data_as_of !== null)
        .map(source => source.data_as_of);

      if (point.year === 2010) {
        // The 2010 CPH release itself was not located. 2010 rests on Table B
        // (2024) and the Pangasinan QuickStat, both of which state it.
        expect(point.sources).toEqual([
          TABLE_B,
          'psa-pangasinan-quickstat-2024-10',
        ]);
        continue;
      }

      expect(dated).toContain(
        dataset.meta.censusDates[String(point.year)] as string
      );
    }

    for (const record of dataset.barangays) {
      for (const point of record.history) {
        for (const id of point.sources) {
          expect(getCivicSource(id).data_as_of).toBe(
            dataset.meta.censusDates[String(point.year)]
          );
        }
      }
    }
  });

  it('publishes only the growth rates the PSA states, and they agree with the counts', () => {
    // The rates are read from PSA Table B, not computed here. Recomputing
    // them with the PSA's geometric formula, r = (Pt/P0)^(1/t) - 1, over the
    // months between reference dates, checks the transcription.
    const months = (iso: string) => {
      const [y, m] = iso.split('-').map(Number);
      return y * 12 + (m - 1);
    };
    const count = (year: number) =>
      dataset.municipality.history.find(h => h.year === year)?.population ??
      NaN;

    expect(dataset.municipality.growthRates.map(r => r.period)).toEqual([
      '2010-2015',
      '2015-2020',
      '2020-2024',
    ]);

    for (const rate of dataset.municipality.growthRates) {
      expect(rate.sources).toEqual([TABLE_B]);

      const [from, to] = rate.period.split('-');
      const years =
        (months(dataset.meta.censusDates[to]) -
          months(dataset.meta.censusDates[from])) /
        12;
      const computed =
        (Math.pow(count(Number(to)) / count(Number(from)), 1 / years) - 1) *
        100;

      expect(Math.abs(computed - rate.rate), rate.period).toBeLessThan(0.005);
    }
  });

  it('mentions no inherited LGU or its barangays', () => {
    expect(JSON.stringify(dataset)).not.toMatch(INHERITED);
    expect(JSON.stringify(populationData)).not.toMatch(INHERITED);
  });
});
