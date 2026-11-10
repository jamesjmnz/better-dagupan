import { useMemo, useState } from 'react';

import { CHART_THEME, standardAxisProps } from '@/constants/charts';
import {
  Info,
  LineChart as LineIcon,
  Table2,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { NotVerified } from '@/components/civic/NotVerified';
import { SourceNote } from '@/components/civic/SourceNote';
import {
  ChartTooltip,
  ResponsiveChart,
} from '@/components/data-display/ChartContainer';
import { DetailSection, PageHero } from '@/components/layout/PageLayouts';
import { Badge } from '@/components/ui/Badge';
import { NotYetAvailable } from '@/components/ui/NotYetAvailable';
import { StatCard } from '@/components/ui/StatCard';

import { formatVerificationDate } from '@/lib/civicSources';
import { lguLabels } from '@/lib/lguLabels';
import { populationData } from '@/lib/populationStatistics';
import { cn } from '@/lib/utils';

import type { GrowthRate } from '@/types/populationTypes';

// Distinct line colours for the barangay comparison; the three most populous
// barangays take the first three.
const BRGY_COLORS = [
  '#0066eb',
  '#cc3e00',
  '#059669',
  '#7c3aed',
  '#dc2626',
  '#0891b2',
  '#db2777',
  '#1e40af',
  '#b45309',
  '#4f46e5',
  '#0d9488',
  '#9333ea',
  '#475569',
  '#be123c',
];

interface BarangayPopulationPoint {
  year: number;
  [key: string]: number | null; // one key per barangay name
}

/** Source ids from several values, de-duplicated, in first-seen order. */
const collectSources = (lists: readonly (readonly string[])[]): string[] => [
  ...new Set(lists.flat()),
];

export default function PopulationPage() {
  const { t, i18n } = useTranslation('common');
  const [activeTab, setActiveTab] = useState<'city' | 'barangays'>('city');
  const { municipality, barangays, meta } = populationData;

  const hasCensus = municipality.history.length > 0;
  const latest = municipality.history[municipality.history.length - 1];
  const latestGrowth = municipality.growthRates[
    municipality.growthRates.length - 1
  ] as GrowthRate | undefined;

  const sortedBarangays = useMemo(
    () =>
      [...barangays].sort(
        (a, b) =>
          b.history[b.history.length - 1].population -
          a.history[a.history.length - 1].population
      ),
    [barangays]
  );

  // Census years present in the barangay series, read from the data rather
  // than hard-coded, so a year without verified barangay counts is not drawn.
  const barangayYears = useMemo(
    () =>
      [...new Set(barangays.flatMap(b => b.history.map(h => h.year)))].sort(
        (a, b) => a - b
      ),
    [barangays]
  );

  // Pivot every barangay series into one row per census year.
  const comparativeData = useMemo<BarangayPopulationPoint[]>(
    () =>
      barangayYears.map(year => {
        const point: BarangayPopulationPoint = { year };
        barangays.forEach(b => {
          point[b.name] =
            b.history.find(h => h.year === year)?.population ?? null;
        });
        return point;
      }),
    [barangays, barangayYears]
  );

  const citySources = useMemo(
    () => collectSources(municipality.history.map(h => h.sources)),
    [municipality.history]
  );
  const growthSources = useMemo(
    () => collectSources(municipality.growthRates.map(r => r.sources)),
    [municipality.growthRates]
  );
  const barangaySources = useMemo(
    () => collectSources(barangays.flatMap(b => b.history.map(h => h.sources))),
    [barangays]
  );

  // City census years with no verified barangay breakdown, said out loud
  // rather than left as a silent gap in the comparison chart.
  const yearsWithoutBarangays = municipality.history
    .map(h => h.year)
    .filter(year => !barangayYears.includes(year));

  const formatDate = (year: number) => {
    const iso = meta.censusDates[String(year)];
    return iso ? formatVerificationDate(iso, i18n.language) : String(year);
  };

  const values = { lgu: lguLabels.fullName };

  // Hooks above run unconditionally; the bail-out sits below them so hook order
  // is stable whether or not verified census figures exist.
  if (!hasCensus) {
    return (
      <>
        <PageHero
          title={t('population.title')}
          description={t('population.description', values)}
        />
        <NotYetAvailable />
      </>
    );
  }

  return (
    <>
      <PageHero
        title={t('population.title')}
        description={t('population.description', values)}
      >
        <div className='flex flex-wrap justify-center gap-2'>
          <Badge variant='primary' dot>
            {t('population.censusBadge', { year: latest.year })}
          </Badge>
          <Badge variant='slate'>
            {t('population.barangayBadge', { count: barangays.length })}
          </Badge>
        </div>
      </PageHero>

      <div className='mb-kapwa-lg grid grid-cols-1 gap-4 md:grid-cols-3'>
        <StatCard
          label={t('population.totalLabel')}
          value={latest.population.toLocaleString()}
          subtext={t('population.totalSubtext', {
            date: formatDate(latest.year),
          })}
          variant='primary'
          icon={Users}
        />
        {latestGrowth ? (
          <StatCard
            label={t('population.growthLabel')}
            value={`${latestGrowth.rate.toFixed(2)}%`}
            subtext={t('population.growthSubtext', {
              period: latestGrowth.period.replace('-', '–'),
            })}
            variant='secondary'
            trend={{
              value: latestGrowth.rate,
              positive: latestGrowth.rate >= 0,
            }}
          />
        ) : (
          <NotVerified label={t('population.growthLabel')} />
        )}
        <StatCard
          label={t('population.barangaysLabel')}
          value={barangays.length}
          subtext={t('population.barangaysSubtext')}
          variant='slate'
        />
      </div>

      <div
        role='group'
        aria-label={t('population.tabsLabel')}
        className='mb-kapwa-lg bg-kapwa-bg-hover flex gap-1.5 rounded-2xl p-1.5'
      >
        {(
          [
            ['city', TrendingUp, t('population.cityTab')],
            ['barangays', LineIcon, t('population.barangayTab')],
          ] as const
        ).map(([tab, Icon, label]) => (
          <button
            key={tab}
            type='button'
            aria-pressed={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold tracking-widest uppercase transition-all',
              activeTab === tab
                ? 'text-kapwa-text-brand-bold bg-kapwa-bg-surface shadow-md'
                : 'text-kapwa-text-support hover:text-kapwa-text-strong'
            )}
          >
            <Icon aria-hidden='true' className='h-4 w-4' /> {label}
          </button>
        ))}
      </div>

      <DetailSection
        title={
          activeTab === 'city'
            ? t('population.cityChartTitle', values)
            : t('population.barangayChartTitle')
        }
        icon={TrendingUp}
      >
        <ResponsiveChart height={activeTab === 'barangays' ? 550 : 400}>
          {activeTab === 'city' ? (
            <LineChart
              data={municipality.history}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                stroke={CHART_THEME.grid}
                strokeDasharray='3 3'
              />
              <XAxis dataKey='year' {...standardAxisProps} dy={10} />
              <YAxis
                {...standardAxisProps}
                domain={['auto', 'auto']}
                tickFormatter={val => `${Math.round(val / 1000)}k`}
              />
              <Tooltip
                content={<ChartTooltip formatter={v => v.toLocaleString()} />}
              />
              <Line
                type='monotone'
                dataKey='population'
                name={t('population.seriesName')}
                // No draw-in animation: it delays the data points and adds
                // motion without adding information.
                isAnimationActive={false}
                stroke='var(--color-kapwa-blue-600)'
                strokeWidth={5}
                dot={{
                  fill: 'var(--color-kapwa-blue-600)',
                  r: 4,
                  strokeWidth: 2,
                  stroke: '#fff',
                }}
                activeDot={{ r: 8, strokeWidth: 4, stroke: '#fff' }}
              />
            </LineChart>
          ) : (
            <LineChart
              data={comparativeData}
              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            >
              <CartesianGrid
                vertical={false}
                stroke={CHART_THEME.grid}
                strokeDasharray='3 3'
              />
              <XAxis dataKey='year' {...standardAxisProps} dy={10} />
              <YAxis {...standardAxisProps} />
              <Tooltip
                content={<ChartTooltip formatter={v => v.toLocaleString()} />}
              />
              <Legend
                verticalAlign='top'
                iconType='circle'
                wrapperStyle={{
                  paddingBottom: '30px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              />
              {sortedBarangays.map((b, i) => {
                const isTop3 = i < 3;

                return (
                  <Line
                    key={b.id}
                    type='monotone'
                    dataKey={b.name}
                    isAnimationActive={false}
                    stroke={BRGY_COLORS[i % BRGY_COLORS.length]}
                    // The three most populous lines are bolder for emphasis.
                    strokeWidth={isTop3 ? 4 : 2}
                    // Dots on the top three only, to keep 31 lines legible.
                    dot={
                      isTop3 ? { r: 4, strokeWidth: 2, stroke: '#555' } : false
                    }
                    activeDot={{ r: 8, strokeWidth: 4, stroke: '#fff' }}
                  />
                );
              })}
            </LineChart>
          )}
        </ResponsiveChart>

        {activeTab === 'barangays' && yearsWithoutBarangays.length > 0 && (
          <NotVerified
            className='mt-4'
            label={t('population.barangayYearsNotVerified', {
              years: yearsWithoutBarangays.join(', '),
            })}
            detail={t('population.barangayYearsNotVerifiedHint')}
          />
        )}

        <SourceNote
          className='mt-6'
          sources={activeTab === 'city' ? citySources : barangaySources}
        />
      </DetailSection>

      {activeTab === 'city' && (
        <DetailSection
          title={t('population.tableTitle')}
          icon={Table2}
          className='mt-kapwa-lg'
        >
          <div className='overflow-x-auto'>
            <table className='w-full text-left text-sm'>
              <caption className='sr-only'>
                {t('population.tableCaption', values)}
              </caption>
              <thead>
                <tr className='border-kapwa-border-weak text-kapwa-text-support border-b text-xs uppercase'>
                  <th scope='col' className='py-2 pr-4 font-semibold'>
                    {t('population.tableYear')}
                  </th>
                  <th scope='col' className='py-2 pr-4 font-semibold'>
                    {t('population.tableReferenceDate')}
                  </th>
                  <th scope='col' className='py-2 text-right font-semibold'>
                    {t('population.tablePopulation')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {municipality.history.map(point => (
                  <tr
                    key={point.year}
                    className='border-kapwa-border-weak text-kapwa-text-strong border-b last:border-0'
                  >
                    <th scope='row' className='py-2 pr-4 font-semibold'>
                      {point.year}
                    </th>
                    <td className='text-kapwa-text-support py-2 pr-4'>
                      {formatDate(point.year)}
                    </td>
                    <td className='py-2 text-right tabular-nums'>
                      {point.population.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {municipality.growthRates.length > 0 && (
            <>
              <h3 className='text-kapwa-text-strong mt-6 mb-2 text-sm font-semibold'>
                {t('population.growthTitle')}
              </h3>
              <ul className='text-kapwa-text-support space-y-1 text-sm'>
                {municipality.growthRates.map(rate => (
                  <li key={rate.period} className='flex justify-between gap-4'>
                    <span>{rate.period.replace('-', '–')}</span>
                    <span className='text-kapwa-text-strong tabular-nums'>
                      {rate.rate.toFixed(2)}%
                    </span>
                  </li>
                ))}
              </ul>
              <SourceNote className='mt-4' sources={growthSources} />
            </>
          )}
        </DetailSection>
      )}

      <DetailSection
        title={t('population.readTitle')}
        icon={Info}
        className='mt-kapwa-lg'
      >
        <p className='text-kapwa-text-support text-xs leading-relaxed'>
          {activeTab === 'city'
            ? t('population.readCity', {
                dates: municipality.history
                  .map(h => formatDate(h.year))
                  .join('; '),
              })
            : t('population.readBarangays', {
                years: barangayYears.join(', '),
              })}
        </p>
      </DetailSection>
    </>
  );
}
