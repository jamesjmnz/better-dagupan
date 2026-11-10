import { BarChart2Icon, Info, Landmark, ReceiptText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// UI Components
import { Badge } from '@/components/ui/Badge';
import { NotVerified } from '@/components/civic/NotVerified';
import { SourceNote } from '@/components/civic/SourceNote';

import FinancialPieChart, {
  ChartDataPoint,
} from '@/pages/transparency/components/FinancialPieChart';
import QuarterToggle from '@/pages/transparency/components/QuarterToggle';
import SummaryCards from '@/pages/transparency/components/SummaryCards';

import { NotYetAvailable } from '@/components/ui/NotYetAvailable';

import { useFinancialData } from '@/hooks/useFinancialData';

import { formatLabel } from '@/lib/budgetUtils';
import { useLguTerms } from '@/lib/useLguTerms';

export default function FinancialPage() {
  const { t } = useTranslation('transparency');
  const terms = useLguTerms();
  const {
    hasData,
    years,
    selectedYear,
    setSelectedYear,
    viewMode,
    setViewMode,
    quartersInYear,
    selectedQuarter,
    setSelectedQuarter,
    displayedStatement,
    comparisonBaseline,
    getQuarter,
  } = useFinancialData();

  // No statements published yet: say so rather than render empty charts.
  if (!hasData || !selectedYear) {
    return (
      <div className='space-y-6'>
        <h1 className='text-kapwa-text-strong kapwa-heading-xl flex items-center gap-3 font-extrabold'>
          <BarChart2Icon className='text-kapwa-text-success h-8 w-8' />
          {t('financial.title')}
        </h1>
        <NotYetAvailable />
      </div>
    );
  }

  return (
    <div className='animate-in fade-in mx-auto max-w-7xl space-y-6 pb-20 duration-500'>
      {/*
        The transparency layout already renders the breadcrumb trail; a
        second one here gave the page two "breadcrumb" landmarks.
      */}
      {/* Unified Header with Controls */}
      <div className='border-kapwa-border-weak bg-kapwa-bg-surface flex flex-col gap-8 rounded-3xl border p-8 shadow-sm xl:flex-row xl:items-center xl:justify-between'>
        <div className='space-y-4'>
          <div className='flex flex-wrap items-center gap-2'>
            {displayedStatement?.status && (
              <Badge variant='primary' dot>
                {t(`financial.status.${displayedStatement.status}`)}
              </Badge>
            )}
            <Badge variant='slate'>
              {t('financial.fiscalYear', { year: selectedYear })}
            </Badge>
            <div className='border-kapwa-border-weak bg-kapwa-bg-surface-raised text-kapwa-text-disabled flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase'>
              <Info className='text-kapwa-text-disabled h-3.5 w-3.5' />
              <span>{t('financial.pesos')}</span>
            </div>
          </div>
          <h1 className='text-kapwa-text-strong kapwa-heading-xl font-extrabold flex items-center gap-3'>
            <BarChart2Icon className='h-8 w-8 text-kapwa-text-success' />
            {t('financial.title')}
          </h1>
          <p className='text-kapwa-text-disabled max-w-xl text-sm leading-relaxed font-medium'>
            {t('financial.description', terms)}
          </p>
        </div>

        <div className='border-kapwa-border-weak bg-kapwa-bg-surface-raised shrink-0 rounded-2xl border p-4'>
          <QuarterToggle
            quarters={quartersInYear.map(getQuarter)}
            years={years}
            viewMode={viewMode}
            selectedYear={selectedYear}
            selectedQuarter={selectedQuarter ? getQuarter(selectedQuarter) : ''}
            onYearChange={setSelectedYear}
            onViewModeChange={setViewMode}
            onQuarterChange={q => {
              const found = quartersInYear.find(x => getQuarter(x) === q);
              if (found) setSelectedQuarter(found);
            }}
          />
        </div>
      </div>

      {displayedStatement ? (
        <StatementView
          statement={displayedStatement}
          baseline={comparisonBaseline}
        />
      ) : (
        <NotVerified
          label={t(
            viewMode === 'year'
              ? 'financial.noAnnual'
              : 'financial.noYearToDate',
            { year: selectedYear }
          )}
          detail={t(
            viewMode === 'year'
              ? 'financial.noAnnualDetail'
              : 'financial.noYearToDateDetail'
          )}
        />
      )}
    </div>
  );
}

function StatementView({
  statement,
  baseline,
}: {
  statement: NonNullable<
    ReturnType<typeof useFinancialData>['displayedStatement']
  >;
  baseline: ReturnType<typeof useFinancialData>['comparisonBaseline'];
}) {
  const { t } = useTranslation('transparency');
  const income = statement.current_operating_income;
  const expenditure = statement.current_operating_expenditures;

  // --- Transform Data for Charts ---
  const calcPct = (val: number, total: number) => (total > 0 ? val / total : 0);

  // ---------------- INCOME DATA PREP ---------------- //
  // Every value and total below is as BLGF states it on the statement.
  const local = income.local_sources;
  const external = income.external_sources;
  const localTotal = local.total_local_sources;
  const externalTotal = external.total_external_sources;
  const grandTotalIncome = income.total_current_operating_income;

  const detail = (name: string, value: number, of: number) => ({
    name,
    value,
    percent: calcPct(value, of),
  });

  const incomeChartData: ChartDataPoint[] = [
    {
      name: 'Local Sources',
      value: localTotal,
      percent: calcPct(localTotal, grandTotalIncome),
      details: [
        detail(
          'Real Property Tax',
          local.tax_revenue.real_property_tax.total,
          localTotal
        ),
        detail('Business Tax', local.tax_revenue.tax_on_business, localTotal),
        detail('Other Taxes', local.tax_revenue.other_taxes, localTotal),
        detail(
          'Regulatory Fees',
          local.non_tax_revenue.regulatory_fees,
          localTotal
        ),
        detail(
          'Economic Ent.',
          local.non_tax_revenue.receipts_from_economic_enterprises,
          localTotal
        ),
        detail(
          'Service Charges',
          local.non_tax_revenue.service_user_charges,
          localTotal
        ),
        detail(
          'Other Receipts',
          local.non_tax_revenue.other_receipts,
          localTotal
        ),
      ],
    },
    {
      name: 'External Sources',
      value: externalTotal,
      percent: calcPct(externalTotal, grandTotalIncome),
      details: [
        detail('NTA', external.national_tax_allotment, externalTotal),
        detail(
          'Other Shares',
          external.other_shares_from_national_tax_collection,
          externalTotal
        ),
        detail(
          'Inter-Local Transfers',
          external.inter_local_transfers,
          externalTotal
        ),
        detail(
          'Grants/Aids',
          external.extraordinary_receipts_grants_donations_aids,
          externalTotal
        ),
      ],
    },
  ];

  // ---------------- EXPENDITURE DATA PREP ---------------- //
  const socialTotal = expenditure.social_services.total_social_services;
  const grandTotalExp = expenditure.total_current_operating_expenditures;

  const expenditureChartData: ChartDataPoint[] = [
    {
      name: 'General Public Services',
      value: expenditure.general_public_services,
      percent: calcPct(expenditure.general_public_services, grandTotalExp),
    },
    {
      name: 'Social Services',
      value: socialTotal,
      percent: calcPct(socialTotal, grandTotalExp),
      // A withheld line is null: it is left out of the breakdown rather than
      // drawn as zero, and the notice below says why.
      details: Object.entries(expenditure.social_services)
        .filter(
          (entry): entry is [string, number] =>
            entry[0] !== 'total_social_services' && entry[1] !== null
        )
        .map(([key, value]) => detail(formatLabel(key), value, socialTotal)),
    },
    {
      name: 'Economic Services',
      value: expenditure.economic_services,
      percent: calcPct(expenditure.economic_services, grandTotalExp),
    },
    {
      name: 'Debt Service',
      value: expenditure.debt_service_interest_expense,
      percent: calcPct(
        expenditure.debt_service_interest_expense,
        grandTotalExp
      ),
    },
  ];

  const period =
    statement.basis === 'annual'
      ? t('financial.periodAnnual', { year: statement.fiscal_year })
      : t('financial.periodYearToDate', {
          months: t(`quarter.months.Q${statement.quarter}`),
          year: statement.fiscal_year,
        });

  return (
    <>
      <div className='space-y-1'>
        <p className='text-kapwa-text-strong text-sm font-bold'>{period}</p>
        <p className='text-kapwa-text-support text-xs'>
          {t('financial.blgfLabel', { label: statement.blgf_label })}
        </p>
        {statement.basis === 'year_to_date' && (
          <p className='text-kapwa-text-support max-w-3xl text-xs leading-relaxed'>
            {t('financial.yearToDateNote')}
          </p>
        )}
      </div>

      {/* 3. KPI Cards - Uses established card patterns inside SummaryCards */}
      <div role='region' aria-label={t('financial.summaryCards')}>
        <SummaryCards statement={statement} prevYear={baseline} />
      </div>

      {/* 4. Charts Grid - Standardized Color Palettes */}
      <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
        <FinancialPieChart
          title={t('financial.incomeComposition')}
          icon={Landmark}
          data={incomeChartData}
          // BetterGov: Brand for local, Blue for national, Gray for others
          colors={[
            'var(--color-kapwa-brand-600)',
            'var(--color-kapwa-blue-600)',
            'var(--color-kapwa-gray-500)',
            'var(--color-kapwa-gray-400)',
          ]}
        />

        <FinancialPieChart
          title={t('financial.expenditureAllocation')}
          icon={ReceiptText}
          data={expenditureChartData}
          // BetterGov: Red for services, Orange for economic, Yellow for debt
          colors={[
            'var(--color-kapwa-red-600)',
            'var(--color-kapwa-orange-600)',
            'var(--color-kapwa-yellow-600)',
            'var(--color-kapwa-blue-600)',
          ]}
        />
      </div>

      {statement.withheld.length > 0 && (
        <NotVerified
          label={t('financial.withheldLabel', {
            count: statement.withheld.length,
          })}
          detail={t('financial.withheldSocialServices')}
        />
      )}

      {/* 5. Provenance */}
      <SourceNote sources={statement.sources} />
    </>
  );
}
