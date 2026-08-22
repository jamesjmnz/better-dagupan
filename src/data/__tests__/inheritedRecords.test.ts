import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import barangays from '@/data/directory/barangays.json';
import departments from '@/data/directory/departments.json';
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
 * Datasets that are still empty. directory/barangays has left this list: it now
 * holds the 31 verified PSGC barangays, checked by
 * src/data/__tests__/barangayProvenance.test.ts. It is still asserted below to
 * be free of inherited content.
 */
const recordSets: [string, unknown[]][] = [
  ['directory/departments', departments],
  ['directory/executive', executive],
  ['directory/legislative', legislative],
  ['about/highlights', highlights],
  ['about/history', history],
  ['statistics/ari', ari],
  ['transparency/sre', sre],
  ['services/services', services],
  ['citizens-charter/merged-services', mergedServices],
  ['citizens-charter/citizens-charter', citizensCharter.services],
  ['statistics/population.barangays', population.barangays],
  [
    'statistics/population.municipality.history',
    population.municipality.history,
  ],
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
