/**
 * Shapes for the census population statistics.
 *
 * Every count and growth rate carries the civic-source ids that back it, so a
 * figure on screen can always be traced to the PSA document it was read from.
 * Mirrors src/data/statistics/schema/population.schema.json.
 */

/** A census count at the census reference date for `year`. */
export interface HistoryPoint {
  year: number;
  population: number;
  /** Civic-source ids, see src/data/sources/civic-sources.json. */
  sources: string[];
}

/** An annual population growth rate, in percent, as published by the PSA. */
export interface GrowthRate {
  /** Intercensal period, e.g. "2020-2024". */
  period: string;
  rate: number;
  /** Civic-source ids, see src/data/sources/civic-sources.json. */
  sources: string[];
}

export interface MunicipalityData {
  name: string;
  history: HistoryPoint[];
  growthRates: GrowthRate[];
}

export interface PopulationMeta {
  location: {
    region: string;
    province: string;
    municipality: string;
  };
  /** Publishing agency, for display only; citations live on each value. */
  source: string;
  notes?: string;
  censusDates: Record<string, string>; // e.g. "2010": "2010-05-01"
}

/**
 * A barangay's earlier census counts as stored in population.json.
 *
 * Its name and latest count are deliberately absent: they live in
 * src/data/directory/barangays.json and are joined in by slug at runtime, so
 * the PSGC figure exists in exactly one file.
 */
export interface BarangayPopulationRecord {
  slug: string;
  history: HistoryPoint[];
}

/** The file as stored: src/data/statistics/population.json. */
export interface PopulationDataset {
  meta: PopulationMeta;
  municipality: MunicipalityData;
  barangays: BarangayPopulationRecord[];
}

/** A barangay's full census series, once joined with the barangay index. */
export interface BarangayData {
  /** The barangay's slug in the barangay index. */
  id: string;
  name: string;
  /** Census counts in ascending year order. */
  history: HistoryPoint[];
}

/** The resolved statistics the population page renders. */
export interface PopulationData {
  meta: PopulationMeta;
  municipality: MunicipalityData;
  barangays: BarangayData[];
}
