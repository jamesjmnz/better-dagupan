import { useMemo, useState } from 'react';

import { Coins, Landmark, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { StatGrid } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { SourceNote } from '@/components/civic/SourceNote';
import { DetailSection } from '@/components/layout/PageLayouts';
import { PageHero } from '@/components/layout/PageLayouts';

import FinancialPieChart from '@/pages/transparency/components/FinancialPieChart';

import { formatPesoAdaptive } from '@/lib/format';
import { useLguTerms } from '@/lib/useLguTerms';
import { cn } from '@/lib/utils';

import { NotYetAvailable } from '@/components/ui/NotYetAvailable';

import ariData from '@/data/statistics/ari.json';

import type { AnnualRegularIncome } from '@/types/statisticsTypes';

const COLORS = {
  national: '#0066eb',
  local: '#cc3e00',
  special: '#059669',
  other: '#64748b',
};

// Ordered by fiscal year in the file; the latest year is shown first.
const records = ariData as unknown as AnnualRegularIncome[];

/** BLGF's dependency ratios are fractions of ARI; it displays them as 0.0%. */
const asPercent = (ratio: number) => `${(ratio * 100).toFixed(1)}%`;

const peso = (amount: number) => formatPesoAdaptive(amount).fullString;

export default function MunicipalIncomePage() {
  const { t } = useTranslation('statistics');
  const terms = useLguTerms();
  const [selectedYear, setSelectedYear] = useState(
    records[records.length - 1]?.fiscal_year
  );
  const data = records.find(r => r.fiscal_year === selectedYear);

  // The FY 2022 edition heads the allotment column "Internal Revenue
  // Allotment (IRA)"; later ones "National Tax Allotment (NTA)".
  const allotment = data?.allotment_label.toUpperCase().startsWith('INTERNAL')
    ? t('income.allotmentIra')
    : t('income.allotmentNta');

  const drillDownIncomeData = useMemo(
    () => [
      {
        name: allotment,
        value: data?.other_income_sources.national_tax_allotment ?? 0,
        color: COLORS.national,
      },
      {
        name: t('income.items.lsr'),
        value: data?.locally_sourced_revenue.total_locally_sourced_revenue ?? 0,
        color: COLORS.local,
        details: [
          {
            name: t('income.items.taxRevenue'),
            value:
              data?.locally_sourced_revenue.tax_revenue.total_tax_revenue ?? 0,
          },
          {
            name: t('income.items.nonTaxRevenue'),
            value:
              data?.locally_sourced_revenue.non_tax_revenue
                .total_non_tax_revenue ?? 0,
          },
        ],
      },
      {
        name: t('income.items.otherShares'),
        value:
          data?.other_shares_from_national_tax_collection.total_other_shares ??
          0,
        color: COLORS.special,
      },
      {
        name: t('income.items.interest'),
        value: data?.other_income_sources.interest_income ?? 0,
        color: COLORS.other,
      },
    ],
    [data, allotment, t]
  );

  // Hooks above run unconditionally; the bail-out sits below them so hook order
  // is stable whether or not a verified income record exists.
  if (!data) {
    return (
      <>
        <PageHero
          title={t('income.title', terms)}
          description={t('income.emptyDescription')}
        />
        <NotYetAvailable />
      </>
    );
  }

  const lsr = data.locally_sourced_revenue;
  const itemGroups = [
    {
      title: t('income.groups.localTax'),
      className: 'text-kapwa-text-accent-orange',
      items: [
        [
          t('income.items.realPropertyGeneralFund'),
          lsr.tax_revenue.real_property_tax_general_fund,
        ],
        [t('income.items.businessTax'), lsr.tax_revenue.tax_on_business],
        [t('income.items.otherTaxes'), lsr.tax_revenue.other_taxes],
      ],
    },
    {
      title: t('income.groups.nonTax'),
      className: 'text-kapwa-text-brand',
      items: [
        [t('income.items.regulatoryFees'), lsr.non_tax_revenue.regulatory_fees],
        [
          t('income.items.serviceCharges'),
          lsr.non_tax_revenue.service_user_charges,
        ],
        [
          t('income.items.economicEnterprises'),
          lsr.non_tax_revenue.receipts_from_economic_enterprises,
        ],
      ],
    },
    {
      title: t('income.groups.external'),
      className: 'text-kapwa-text-success',
      items: [
        [allotment, data.other_income_sources.national_tax_allotment],
        [
          t('income.items.otherShares'),
          data.other_shares_from_national_tax_collection.total_other_shares,
        ],
        [t('income.items.interest'), data.other_income_sources.interest_income],
      ],
    },
  ] as const;

  return (
    <>
      {/* PageHero - documented pattern for layout headers */}
      <PageHero
        title={t('income.title', terms)}
        description={t('income.description', terms)}
      >
        <div className='flex flex-wrap justify-center gap-2'>
          <Badge variant='primary' dot>
            {data.period}
          </Badge>
          {data.status && (
            <Badge variant='warning'>{t(`income.status.${data.status}`)}</Badge>
          )}
          <Badge variant='slate'>{t('income.blgfData')}</Badge>
        </div>
      </PageHero>

      {/* Fiscal-year switcher */}
      {records.length > 1 && (
        <div
          role='group'
          aria-label={t('income.yearPicker')}
          className='mb-kapwa-lg flex flex-wrap justify-center gap-2'
        >
          {records.map(r => (
            <button
              key={r.fiscal_year}
              type='button'
              aria-pressed={r.fiscal_year === selectedYear}
              onClick={() => setSelectedYear(r.fiscal_year)}
              className={cn(
                'focus-visible:ring-kapwa-border-focus min-h-[44px] rounded-xl border px-4 text-sm font-bold focus-visible:ring-2 focus-visible:outline-none',
                r.fiscal_year === selectedYear
                  ? 'border-kapwa-border-brand bg-kapwa-bg-surface text-kapwa-text-brand-bold shadow-sm'
                  : 'border-kapwa-border-weak bg-kapwa-bg-surface text-kapwa-text-support hover:text-kapwa-text-strong'
              )}
            >
              {r.fiscal_year}
            </button>
          ))}
        </div>
      )}

      {/* KPI Cards - using StatGrid with StatCard */}
      <div className='mb-kapwa-lg'>
        <StatGrid
          columns={3}
          stats={[
            {
              label: t('income.totalIncome'),
              value: peso(data.summary_indicators.annual_regular_income),
              subtext: t('income.annualRevenue'),
              variant: 'primary',
            },
            {
              label: t('income.localSufficiency'),
              value: asPercent(
                data.summary_indicators.dependency_rates.lsr_dependency
              ),
              subtext: t('income.lsrShare'),
              variant: 'secondary',
            },
            {
              label: t('income.allotmentDependency', {
                allotment: /\((\w+)\)/.exec(allotment)?.[1] ?? allotment,
              }),
              value: asPercent(
                data.summary_indicators.dependency_rates.nta_dependency
              ),
              subtext: t('income.allotmentShare'),
              variant: 'slate',
              icon: Wallet,
            },
          ]}
        />
        <p className='text-kapwa-text-support mx-auto mt-3 max-w-3xl text-center text-xs leading-relaxed'>
          {t('income.definition')}
        </p>
      </div>

      {/* Chart wrapped in DetailSection */}
      <div className='mb-kapwa-lg'>
        <DetailSection title={t('income.revenueComposition')} icon={Landmark}>
          <div className='flex justify-center'>
            <FinancialPieChart
              title={t('income.overview')}
              icon={Landmark}
              data={drillDownIncomeData}
              colors={[
                COLORS.national,
                COLORS.local,
                COLORS.special,
                COLORS.other,
              ]}
            />
          </div>
        </DetailSection>
      </div>

      {/* Full Financial Itemization */}
      <DetailSection title={t('income.itemization')} icon={Coins}>
        <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
          {itemGroups.map(group => (
            <div key={group.title} className='space-y-4'>
              <h4
                className={cn(
                  'border-b pb-2 text-[10px] font-black tracking-widest uppercase',
                  group.className
                )}
              >
                {group.title}
              </h4>
              <dl className='text-kapwa-text-support space-y-2 text-sm font-bold'>
                {group.items.map(([label, amount]) => (
                  <div
                    key={label}
                    className='bg-kapwa-bg-surface-raised flex justify-between gap-4 rounded-lg p-2'
                  >
                    <dt>{label}</dt>
                    <dd className='text-right'>{peso(amount)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </DetailSection>

      {/* Provenance */}
      <SourceNote className='mt-kapwa-lg' sources={data.sources} />
    </>
  );
}
