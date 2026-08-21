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

/** A Bureau of Local Government Finance annual regular income record. */
export interface AnnualRegularIncome {
  period: string;
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
