// --- Types ---

export interface LocationInfo {
  region: string;
  province: string;
  lgu_name: string;
  lgu_type: string;
}

// --- Income ---

export interface TaxRevenue {
  real_property_tax: {
    general_fund: number;
    special_education_fund: number;
    total: number;
  };
  tax_on_business: number;
  other_taxes: number;
  total_tax_revenue: number;
}

export interface NonTaxRevenue {
  regulatory_fees: number;
  service_user_charges: number;
  receipts_from_economic_enterprises: number;
  other_receipts: number;
  total_non_tax_revenue: number;
}

export interface LocalSources {
  tax_revenue: TaxRevenue;
  non_tax_revenue: NonTaxRevenue;
  total_local_sources: number;
}

export interface ExternalSources {
  national_tax_allotment: number;
  other_shares_from_national_tax_collection: number;
  inter_local_transfers: number;
  extraordinary_receipts_grants_donations_aids: number;
  total_external_sources: number;
}

export interface CurrentOperatingIncome {
  local_sources: LocalSources;
  external_sources: ExternalSources;
  total_current_operating_income: number;
}

// --- Expenditures ---

/**
 * The five social-services lines and their total.
 *
 * A line is null when Better Dagupan withholds it for a period because two
 * BLGF releases disagree about it (see FinancialStatement.withheld). The
 * total is still published when the releases agree on it.
 */
export interface SocialServices {
  education_culture_sports_manpower_development: number | null;
  health_nutrition_population_control: number | null;
  labor_and_employment: number | null;
  housing_and_community_development: number | null;
  social_services_and_social_welfare: number | null;
  total_social_services: number;
}

export interface CurrentOperatingExpenditures {
  general_public_services: number;
  social_services: SocialServices;
  economic_services: number;
  debt_service_interest_expense: number;
  total_current_operating_expenditures: number;
}

// --- Non-Income Receipts ---

export interface CapitalInvestmentReceipts {
  proceeds_from_sale_of_assets: number;
  proceeds_from_sale_of_debt_securities_of_other_entities: number;
  collection_of_loans_receivables: number;
  total_capital_investment_receipts: number;
}

export interface ReceiptsFromLoansAndBorrowings {
  acquisition_of_loans: number;
  issuance_of_bonds: number;
  total_receipts_from_loans_and_borrowings: number;
}

export interface NonIncomeReceipts {
  capital_investment_receipts: CapitalInvestmentReceipts;
  receipts_from_loans_and_borrowings: ReceiptsFromLoansAndBorrowings;
  other_non_income_receipts: number;
  total_non_income_receipts: number;
}

// --- Non-Operating Expenditures ---

export interface CapitalInvestmentExpenditures {
  purchase_construct_of_property_plant_and_equipment: number;
  purchase_of_debt_securities_of_other_entities: number;
  grant_make_loan_to_other_entities: number;
  total_capital_investment_expenditures: number;
}

export interface DebtServicePrincipalCost {
  payment_of_loan_amortization: number;
  retirement_redemption_of_bonds_debt_securities: number;
  total_debt_service_principal_cost: number;
}

export interface NonOperatingExpenditures {
  capital_investment_expenditures: CapitalInvestmentExpenditures;
  debt_service_principal_cost: DebtServicePrincipalCost;
  other_non_operating_expenditures: number;
  total_non_operating_expenditures: number;
}

// --- Fund Summary ---

export interface FundSummary {
  fund_cash_balance_end: number;
  net_increase_decrease_in_funds?: number;
  add_cash_balance_beginning?: number;
  fund_cash_available?: number;
  less_payment_of_prior_years_accounts_payable?: number;
  continuing_appropriation?: number;
}

// --- Financial Statement ---

/** Why a published statement leaves a line out. */
export type WithheldReason = 'conflicting_sources';

/**
 * One Statement of Receipts and Expenditures (SRE) as the Bureau of Local
 * Government Finance publishes it for the city, transcribed cell for cell.
 *
 * Amounts are in pesos, to the centavo: BLGF's workbooks hold peso values and
 * only display them in millions. Every total is BLGF's own, never summed here.
 *
 * BLGF's quarterly statements are year to date. A `year_to_date` statement for
 * quarter 3 covers January to September, not July to September, so quarters
 * must never be added together; the full year is its own `annual` statement.
 */
export interface FinancialStatement {
  /** "Q3-2025" for a year-to-date statement, "FY-2025" for a full year. */
  period: string;
  fiscal_year: number;
  /** 1-4 for a year-to-date statement, null for a full-year one. */
  quarter: 1 | 2 | 3 | 4 | null;
  basis: 'year_to_date' | 'annual';
  /** The period heading exactly as the BLGF sheet prints it. */
  blgf_label: string;
  /** "final" or "preliminary" only when BLGF labels the sheet so. */
  status: 'final' | 'preliminary' | null;
  location_info: LocationInfo;
  current_operating_income: CurrentOperatingIncome;
  current_operating_expenditures: CurrentOperatingExpenditures;
  net_operating_income_loss_from_current_operations: number;
  non_income_receipts: NonIncomeReceipts;
  non_operating_expenditures: NonOperatingExpenditures;
  fund_summary: FundSummary;
  /** Lines left out of this statement, by dotted path, and why. */
  withheld: { field: string; reason: WithheldReason }[];
  /** Civic-source ids (src/data/sources/civic-sources.json). */
  sources: string[];
}

// --- Empty helpers ---

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

export const emptyCurrentOperatingIncome = (): CurrentOperatingIncome => ({
  local_sources: emptyLocalSources(),
  external_sources: emptyExternalSources(),
  total_current_operating_income: 0,
});

export const emptySocialServices = (): SocialServices => ({
  education_culture_sports_manpower_development: 0,
  health_nutrition_population_control: 0,
  labor_and_employment: 0,
  housing_and_community_development: 0,
  social_services_and_social_welfare: 0,
  total_social_services: 0,
});

export const emptyCurrentOperatingExpenditures =
  (): CurrentOperatingExpenditures => ({
    general_public_services: 0,
    social_services: emptySocialServices(),
    economic_services: 0,
    debt_service_interest_expense: 0,
    total_current_operating_expenditures: 0,
  });

export const emptyCapitalInvestmentReceipts =
  (): CapitalInvestmentReceipts => ({
    proceeds_from_sale_of_assets: 0,
    proceeds_from_sale_of_debt_securities_of_other_entities: 0,
    collection_of_loans_receivables: 0,
    total_capital_investment_receipts: 0,
  });

export const emptyReceiptsFromLoansAndBorrowings =
  (): ReceiptsFromLoansAndBorrowings => ({
    acquisition_of_loans: 0,
    issuance_of_bonds: 0,
    total_receipts_from_loans_and_borrowings: 0,
  });

export const emptyNonIncomeReceipts = (): NonIncomeReceipts => ({
  capital_investment_receipts: emptyCapitalInvestmentReceipts(),
  receipts_from_loans_and_borrowings: emptyReceiptsFromLoansAndBorrowings(),
  other_non_income_receipts: 0,
  total_non_income_receipts: 0,
});

export const emptyCapitalInvestmentExpenditures =
  (): CapitalInvestmentExpenditures => ({
    purchase_construct_of_property_plant_and_equipment: 0,
    purchase_of_debt_securities_of_other_entities: 0,
    grant_make_loan_to_other_entities: 0,
    total_capital_investment_expenditures: 0,
  });

export const emptyDebtServicePrincipalCost = (): DebtServicePrincipalCost => ({
  payment_of_loan_amortization: 0,
  retirement_redemption_of_bonds_debt_securities: 0,
  total_debt_service_principal_cost: 0,
});

export const emptyNonOperatingExpenditures = (): NonOperatingExpenditures => ({
  capital_investment_expenditures: emptyCapitalInvestmentExpenditures(),
  debt_service_principal_cost: emptyDebtServicePrincipalCost(),
  other_non_operating_expenditures: 0,
  total_non_operating_expenditures: 0,
});
