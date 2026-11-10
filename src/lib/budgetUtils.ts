import type {
  CurrentOperatingExpenditures,
  CurrentOperatingIncome,
  ExternalSources,
  LocalSources,
  NonTaxRevenue,
  SocialServices,
  TaxRevenue,
} from '@/types/budgetTypes';

/* ---------------- Totals for Summary Cards ---------------- */

/** Compute total income including all local & external sources */
export function computeTotalIncome(income?: CurrentOperatingIncome): number {
  if (!income) return 0;

  const local = income.local_sources ?? emptyLocalSources();
  const external = income.external_sources ?? emptyExternalSources();

  const taxRevenue =
    (local.tax_revenue?.real_property_tax?.total ?? 0) +
    (local.tax_revenue?.tax_on_business ?? 0) +
    (local.tax_revenue?.other_taxes ?? 0);

  const nonTaxRevenue = local.non_tax_revenue?.total_non_tax_revenue ?? 0;

  const localTotal = taxRevenue + nonTaxRevenue;

  const externalTotal =
    (external.national_tax_allotment ?? 0) +
    (external.other_shares_from_national_tax_collection ?? 0) +
    (external.inter_local_transfers ?? 0) +
    (external.extraordinary_receipts_grants_donations_aids ?? 0);

  return localTotal + externalTotal;
}

/** Compute total expenditure including all current operating costs */
export function computeTotalExpenditure(
  exp?: CurrentOperatingExpenditures
): number {
  if (!exp) return 0;

  const socialTotal = exp.social_services?.total_social_services ?? 0;
  return (
    (exp.general_public_services ?? 0) +
    socialTotal +
    (exp.economic_services ?? 0) +
    (exp.debt_service_interest_expense ?? 0)
  );
}

/** Compute net income */
export function computeNetIncome(
  income?: CurrentOperatingIncome,
  expenditure?: CurrentOperatingExpenditures
): number {
  return computeTotalIncome(income) - computeTotalExpenditure(expenditure);
}

/* ---------------- Empty Objects ---------------- */

export const emptyTaxRevenue = (): TaxRevenue => ({
  real_property_tax: { general_fund: 0, special_education_fund: 0, total: 0 },
  tax_on_business: 0,
  other_taxes: 0,
  total_tax_revenue: 0,
});

export const emptyNonTaxRevenue = (): NonTaxRevenue => ({
  regulatory_fees: 0,
  service_user_charges: 0,
  receipts_from_economic_enterprises: 0,
  other_receipts: 0,
  total_non_tax_revenue: 0,
});

export const emptyLocalSources = (): LocalSources => ({
  tax_revenue: emptyTaxRevenue(),
  non_tax_revenue: emptyNonTaxRevenue(),
  total_local_sources: 0,
});

export const emptyExternalSources = (): ExternalSources => ({
  national_tax_allotment: 0,
  other_shares_from_national_tax_collection: 0,
  inter_local_transfers: 0,
  extraordinary_receipts_grants_donations_aids: 0,
  total_external_sources: 0,
});

export const emptySocialServices = (): SocialServices => ({
  education_culture_sports_manpower_development: 0,
  health_nutrition_population_control: 0,
  labor_and_employment: 0,
  housing_and_community_development: 0,
  social_services_and_social_welfare: 0,
  total_social_services: 0,
});

export const emptyCurrentOperatingIncome = (): CurrentOperatingIncome => ({
  local_sources: emptyLocalSources(),
  external_sources: emptyExternalSources(),
  total_current_operating_income: 0,
});

export const emptyCurrentOperatingExpenditures =
  (): CurrentOperatingExpenditures => ({
    general_public_services: 0,
    social_services: emptySocialServices(),
    economic_services: 0,
    debt_service_interest_expense: 0,
    total_current_operating_expenditures: 0,
  });

/**
 * Calculate Year-over-Year growth
 */
export const calculateYoY = (current: number, previous?: number) => {
  if (previous === undefined || previous === 0) return null;
  const diff = current - previous;
  const pct = (diff / previous) * 100;
  return { diff, pct };
};

/**
 * Format database keys to readable labels
 * e.g. "tax_revenue" -> "Tax Revenue"
 */
export const formatLabel = (str: string): string =>
  str.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
