/**
 * Shapes for the statistics datasets that are not covered by populationTypes.
 *
 * ari.json holds BLGF's records for the city and cmci.json holds DTI's
 * competitiveness editions. A dataset that is still empty infers as never[],
 * so consumers state the element type.
 */

/** One indicator's score and rank in one CMCI edition, as DTI published it. */
export interface CMCIIndicator {
  name: string;
  score: number;
  rank: number;
}

export interface CMCIPillar {
  name: string;
  score: number;
  rank: number;
  /**
   * Empty when `indicators_status` is not "published": DTI's own breakdown
   * for that pillar and year does not add up to the pillar score, so it is
   * withheld while the pillar score and rank are published.
   */
  indicators: CMCIIndicator[];
  indicators_status: 'published' | 'inconsistent_in_source';
}

/**
 * One year of the DTI Cities and Municipalities Competitiveness Index for the
 * city.
 *
 * Kept per edition rather than as series by indicator name, because DTI
 * changes the pillars and indicators between editions: three pillars to
 * 2016, four from 2017 (Resiliency), five from 2022 (Innovation). An
 * indicator name in one year is not evidence of the same measure in another.
 */
export interface CMCIEdition {
  year: number;
  /** The category DTI's profile prints, e.g. "Component City". */
  category: string;
  /** The peer group and count DTI states for the year; null when it states none. */
  peer_group: string | null;
  peer_count: number | null;
  overall_score: number;
  overall_rank: number;
  pillars: CMCIPillar[];
  /** Civic-source ids (src/data/sources/civic-sources.json). */
  sources: string[];
}

export interface CMCIData {
  meta: {
    source: string;
    agency: string;
    /** The LGU name DTI lists the city under. */
    lgu_name_as_published: string;
  };
  editions: CMCIEdition[];
}

/**
 * One year of the Bureau of Local Government Finance's Annual Regular Income
 * (ARI) and Dependencies table, transcribed cell for cell for the city.
 *
 * Amounts are pesos to the centavo (BLGF's cells hold pesos and display them
 * in millions). The dependency rates are BLGF's own ratios to ARI, kept at the
 * precision the workbook stores, never recomputed here.
 */
export interface AnnualRegularIncome {
  /** "FY 2024". */
  period: string;
  fiscal_year: number;
  /** The year heading exactly as the BLGF sheet prints it. */
  blgf_label: string;
  /** "preliminary" only when BLGF marks the edition so; otherwise null. */
  status: 'final' | 'preliminary' | null;
  /**
   * The allotment column heading as BLGF printed it. FY 2022 calls it the
   * Internal Revenue Allotment (IRA); later editions the National Tax
   * Allotment (NTA). The figure sits in national_tax_allotment either way.
   */
  allotment_label: string;
  /** Civic-source ids (src/data/sources/civic-sources.json). */
  sources: string[];
  location_info: {
    region: string;
    province: string;
    lgu_name: string;
    lgu_type: string;
  };
  locally_sourced_revenue: {
    tax_revenue: {
      real_property_tax_general_fund: number;
      tax_on_business: number;
      other_taxes: number;
      total_tax_revenue: number;
    };
    non_tax_revenue: {
      regulatory_fees: number;
      service_user_charges: number;
      receipts_from_economic_enterprises: number;
      total_non_tax_revenue: number;
    };
    total_locally_sourced_revenue: number;
  };
  other_income_sources: {
    interest_income: number;
    national_tax_allotment: number;
  };
  other_shares_from_national_tax_collection: {
    share_from_economic_zone: number;
    share_from_evat: number;
    share_from_national_wealth: number;
    share_from_pagcor_pcso_lotto: number;
    share_from_tobacco_excise_tax: number;
    others: number;
    total_other_shares: number;
  };
  summary_indicators: {
    annual_regular_income: number;
    dependency_rates: {
      lsr_dependency: number;
      nta_dependency: number;
      other_shares_from_national_tax_dependency: number;
    };
  };
}
