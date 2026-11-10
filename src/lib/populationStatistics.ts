import barangaysRaw from '@/data/directory/barangays.json';
import populationRaw from '@/data/statistics/population.json';

import type { Barangay } from '@/types/directoryTypes';
import type {
  BarangayData,
  PopulationData,
  PopulationDataset,
} from '@/types/populationTypes';

/**
 * The census year of `population_2024_popcen` in the barangay index. The field
 * name fixes the year, so it is stated once here rather than inferred.
 */
export const BARANGAY_INDEX_CENSUS_YEAR = 2024;

/**
 * Join the stored population statistics with the barangay index.
 *
 * population.json holds only the earlier census counts per barangay. Each
 * barangay's name and its 2024 count come from the barangay index, keyed by
 * slug, so the PSGC figure is never copied into a second file that could drift
 * from the first. The 2024 point cites the barangay record's own sources.
 *
 * Throws when a stored slug is not in the index: a count attached to a
 * barangay that does not exist must fail the build, not vanish from a chart.
 */
export function resolvePopulation(
  dataset: PopulationDataset,
  directory: readonly Barangay[]
): PopulationData {
  const bySlug = new Map(directory.map(b => [b.slug, b]));

  const barangays: BarangayData[] = dataset.barangays.map(record => {
    const barangay = bySlug.get(record.slug);

    if (!barangay) {
      throw new Error(
        `Population record "${record.slug}" has no matching barangay in src/data/directory/barangays.json.`
      );
    }

    const history = [
      ...record.history,
      {
        year: BARANGAY_INDEX_CENSUS_YEAR,
        population: barangay.population_2024_popcen,
        sources: [...barangay.sources],
      },
    ].sort((a, b) => a.year - b.year);

    return { id: barangay.slug, name: barangay.barangay_name, history };
  });

  return {
    meta: dataset.meta,
    municipality: dataset.municipality,
    barangays,
  };
}

/** The resolved population statistics for this LGU. */
export const populationData: PopulationData = resolvePopulation(
  populationRaw as PopulationDataset,
  barangaysRaw as Barangay[]
);
