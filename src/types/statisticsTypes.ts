/**
 * Shapes for the statistics datasets that are not covered by populationTypes.
 *
 * Both files are emptied until verified Dagupan figures are sourced, so their
 * arrays infer as never[] and consumers must state the element type.
 */

export interface CMCIIndicator {
  name: string;
  values: (number | null)[];
}

export interface CMCIPillar {
  name: string;
  scores: (number | null)[];
  indicators: CMCIIndicator[];
}

export interface CMCIData {
  meta: {
    source: string;
    years: number[];
  };
  overall_score: (number | null)[];
  pillars: CMCIPillar[];
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
