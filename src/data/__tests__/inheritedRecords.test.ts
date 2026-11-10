import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import barangays from '@/data/directory/barangays.json';
import departments from '@/data/directory/departments.json';
import cityHotlines from '@/data/directory/hotlines.json';
import executive from '@/data/directory/executive.json';
import legislative from '@/data/directory/legislative.json';
import highlights from '@/data/about/highlights.json';
import history from '@/data/about/history.json';
import ari from '@/data/statistics/ari.json';
import cmci from '@/data/statistics/cmci.json';
import population from '@/data/statistics/population.json';
import sre from '@/data/transparency/sre.json';
import services from '@/data/services/services.json';
import mergedServices from '@/data/citizens-charter/merged-services.json';
import citizensCharter from '@/data/citizens-charter/citizens-charter.json';

/**
 * The portal shipped another LGU's civic records under the Better Dagupan
 * name. These assertions are the standing guarantee that it cannot happen
 * again by accident: a dataset repopulated from the inherited template, or a
 * generated file rebuilt from an un-emptied source, fails here.
 *
 * String matching alone is not enough, because departments.json contained 33
 * Los Banos offices without ever spelling the name, so emptiness is asserted
 * per dataset as well.
 */
const INHERITED =
  /los ba(ñ|n)os|losbanos\.gov\.ph|sangguniang bayan|betterlb|municipality of/i;

/**
 * Datasets that are still empty. directory/barangays, directory/departments,
 * directory/executive, directory/legislative, the two statistics/population
 * series, about/history, about/highlights and transparency/sre have left this
 * list: they now hold verified Dagupan records, checked by
 * barangayProvenance.test.ts, departmentProvenance.test.ts,
 * electedOfficialsProvenance.test.ts, populationProvenance.test.ts,
 * aboutProvenance.test.ts and sreProvenance.test.ts in this directory.
 * All are still asserted below to be free of inherited content.
 */
const recordSets: [string, unknown[]][] = [
  ['statistics/ari', ari],
  ['services/services', services],
  ['citizens-charter/merged-services', mergedServices],
  ['citizens-charter/citizens-charter', citizensCharter.services],
  ['statistics/cmci.pillars', cmci.pillars],
];

describe('inherited civic records', () => {
  it.each(recordSets)('%s holds no records', (_name, records) => {
    expect(Array.isArray(records)).toBe(true);
    expect(records).toHaveLength(0);
  });

  it.each(recordSets)('%s mentions no inherited LGU', (_name, records) => {
    expect(JSON.stringify(records)).not.toMatch(INHERITED);
  });

  it('directory/barangays holds verified Dagupan records, not inherited ones', () => {
    // The first dataset to be repopulated under the Better Dagupan name. The
    // guarantee changes shape here: no longer "must be empty" but "must be
    // Dagupan". Emptiness would now be a regression, not safety.
    expect(Array.isArray(barangays)).toBe(true);
    expect(barangays.length).toBeGreaterThan(0);
    expect(JSON.stringify(barangays)).not.toMatch(INHERITED);
  });

  it('directory/departments holds verified Dagupan records, not inherited ones', () => {
    // The second dataset to make that move. This one is the reason the string
    // check above is not sufficient on its own: the file previously held 33
    // Los Banos offices that never spelled the name, so the guarantee that
    // matters here is that the records are positively Dagupan's, which
    // departmentProvenance.test.ts checks field by field against the sources.
    expect(Array.isArray(departments)).toBe(true);
    expect(departments.length).toBeGreaterThan(0);
    expect(JSON.stringify(departments)).not.toMatch(INHERITED);
  });

  it('directory/executive holds verified Dagupan records, not inherited ones', () => {
    // The inherited file named another LGU's mayor and vice mayor. The seats
    // are generic, so the guarantee that matters is that the names now are
    // Dagupan's, which electedOfficialsProvenance.test.ts checks against the
    // sources seat by seat.
    expect(Array.isArray(executive)).toBe(true);
    expect(executive.length).toBeGreaterThan(0);
    expect(JSON.stringify(executive)).not.toMatch(INHERITED);
  });

  it('directory/legislative holds verified Dagupan records, not inherited ones', () => {
    // The inherited chamber was a Sangguniang Bayan, which a component city
    // does not have. INHERITED matches that name, so the string check alone
    // would catch the old file coming back; the record count guards against
    // the roster being emptied again instead.
    expect(Array.isArray(legislative)).toBe(true);
    expect(legislative.length).toBeGreaterThan(0);
    expect(JSON.stringify(legislative)).not.toMatch(INHERITED);
  });

  it('statistics/population holds verified Dagupan census counts, not inherited ones', () => {
    // The third dataset to move from "must be empty" to "must be Dagupan".
    // The inherited file charted another LGU's barangays; the guarantee now is
    // that the city series and every barangay series are present and are the
    // PSA's counts for Dagupan, which populationProvenance.test.ts checks
    // figure by figure, including that the barangays sum to the city total.
    expect(population.municipality.history.length).toBeGreaterThan(0);
    expect(population.barangays.length).toBeGreaterThan(0);
    expect(population.meta.location.municipality).toBe('City of Dagupan');
    expect(population.meta.location.province).toBe('Pangasinan');
    expect(JSON.stringify(population)).not.toMatch(INHERITED);

    // Every barangay series belongs to a barangay in the Dagupan index.
    const slugs = new Set(barangays.map(b => b.slug));
    for (const record of population.barangays) {
      expect(slugs.has(record.slug), record.slug).toBe(true);
    }
  });

  it('about/history and about/highlights hold verified Dagupan records, not inherited ones', () => {
    // The inherited timeline told another LGU's story under the Dagupan
    // heading. The guarantee now is that every entry is Dagupan's and cites
    // an official text, which aboutProvenance.test.ts checks entry by entry.
    // Emptying either file again would be a regression, not safety.
    //
    // History is the one dataset where "municipality of" is legitimately
    // Dagupan's: the charter created the city from "the municipality of
    // Dagupan", and an executive order joined "the municipality of Calasiao"
    // to it. Exactly those two are allowed; any other municipality, or the
    // inherited LGU under any spelling, still fails.
    const OFFICIAL_MUNICIPALITIES = /municipality of (Dagupan|Calasiao)\b/gi;

    for (const records of [history, highlights]) {
      expect(Array.isArray(records)).toBe(true);
      expect(records.length).toBeGreaterThan(0);
      expect(
        JSON.stringify(records).replace(OFFICIAL_MUNICIPALITIES, '')
      ).not.toMatch(INHERITED);
    }
    expect(JSON.stringify(history)).toMatch(/Dagupan/);
  });

  it('directory/hotlines holds verified Dagupan numbers, not inherited ones', () => {
    // A new dataset rather than a repopulated one, but held to the same
    // guarantee from the start: present, and Dagupan's. The template's area
    // code (049) must not reappear; Dagupan landlines are (075).
    // hotlinesProvenance.test.ts pins every number against its sources.
    expect(Array.isArray(cityHotlines)).toBe(true);
    expect(cityHotlines.length).toBeGreaterThan(0);
    expect(JSON.stringify(cityHotlines)).not.toMatch(INHERITED);
    expect(JSON.stringify(cityHotlines)).not.toMatch(/\(049\)/);
  });

  it('transparency/sre holds Dagupan statements, not inherited ones', () => {
    // The inherited file held another LGU's quarterly statements in millions.
    // The guarantee now is that every statement is BLGF's row for Dagupan
    // City, which sreProvenance.test.ts checks total by total.
    expect(Array.isArray(sre)).toBe(true);
    expect(sre.length).toBeGreaterThan(0);
    expect(JSON.stringify(sre)).not.toMatch(INHERITED);
    for (const statement of sre) {
      expect(statement.location_info).toEqual({
        region: 'Region I',
        province: 'Pangasinan',
        lgu_name: 'Dagupan City',
        lgu_type: 'City',
      });
    }
  });

  it('keeps the nationwide datasets that are not LGU-specific', () => {
    const categories = JSON.parse(
      readFileSync(
        join(process.cwd(), 'src/data/service_categories.json'),
        'utf8'
      )
    );
    const hotlines = JSON.parse(
      readFileSync(
        join(process.cwd(), 'src/data/philippines_hotlines.json'),
        'utf8'
      )
    );

    expect(categories.categories.length).toBeGreaterThan(0);
    expect(hotlines.emergencyHotlines.length).toBeGreaterThan(0);
    expect(JSON.stringify(categories)).not.toMatch(INHERITED);
    expect(JSON.stringify(hotlines)).not.toMatch(INHERITED);
  });

  it('no longer ships the inherited tourism records or the LGU seal', () => {
    expect(() =>
      readFileSync(join(process.cwd(), 'src/data/tourism/resorts.json'))
    ).toThrow();
    expect(() =>
      readFileSync(join(process.cwd(), 'public/logos/lb-seal.png'))
    ).toThrow();
  });
});
