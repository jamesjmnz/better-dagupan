import { useMemo, useState } from 'react';

import { CHART_THEME, standardAxisProps } from '@/constants/charts';
import {
  BarChart3,
  ExternalLink,
  Medal,
  Target,
  TrendingUp,
  Trophy,
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

import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { NotVerified } from '@/components/civic/NotVerified';
import { SourceNote } from '@/components/civic/SourceNote';
import {
  ChartTooltip,
  ResponsiveChart,
} from '@/components/data-display/ChartContainer';
import { DetailSection } from '@/components/layout/PageLayouts';
import { PageHero } from '@/components/layout/PageLayouts';

import { getCivicSource } from '@/lib/civicSources';
import { cn } from '@/lib/utils';

import { NotYetAvailable } from '@/components/ui/NotYetAvailable';

import cmciData from '@/data/statistics/cmci.json';

import type { CMCIData } from '@/types/statisticsTypes';

const PILLAR_COLORS: Record<string, string> = {
  Overall: '#0066eb',
  'Economic Dynamism': '#cc3e00',
  'Government Efficiency': '#059669',
  Infrastructure: '#4f46e5',
  Resiliency: '#d97706',
  Innovation: '#64748b',
};

/** Pillars in the order DTI lists them; later editions add to the end. */
const PILLAR_ORDER = Object.keys(PILLAR_COLORS).filter(k => k !== 'Overall');

interface TrendPoint {
  year: number;
  Overall: number;
  [pillar: string]: number | null;
}

const cmci = cmciData as unknown as CMCIData;
// Ordered by year in the file.
const editions = cmci.editions;

export default function CompetitivenessPage() {
  const { t, i18n } = useTranslation('statistics');
  const [activeTab, setActiveTab] = useState<'trends' | 'pillars'>('trends');
  const [selectedYear, setSelectedYear] = useState(
    editions[editions.length - 1]?.year
  );
  const edition = editions.find(e => e.year === selectedYear);
  const [selectedPillar, setSelectedPillar] = useState(
    edition?.pillars[0]?.name ?? ''
  );

  // A pillar DTI did not score in the selected year falls back to the first.
  const currentPillar =
    edition?.pillars.find(p => p.name === selectedPillar) ??
    edition?.pillars[0];

  // Scores as DTI published them, per year. A pillar DTI did not score that
  // year is null, so its line starts where the pillar was introduced.
  const trendData = useMemo<TrendPoint[]>(
    () =>
      editions.map(e => {
        const point: TrendPoint = { year: e.year, Overall: e.overall_score };
        for (const name of PILLAR_ORDER) {
          point[name] = e.pillars.find(p => p.name === name)?.score ?? null;
        }
        return point;
      }),
    []
  );

  const ordinal = useMemo(
    () => new Intl.PluralRules(i18n.language, { type: 'ordinal' }),
    [i18n.language]
  );
  const rankLabel = (rank: number) =>
    t(`competitiveness.rank.${ordinal.select(rank)}`, { rank });

  // Hooks above run unconditionally; the bail-out sits below them so hook order
  // is stable whether or not verified CMCI scores exist.
  if (!edition || !currentPillar) {
    return (
      <>
        <PageHero
          title={t('competitiveness.title')}
          description={t('competitiveness.description')}
        />
        <NotYetAvailable />
      </>
    );
  }

  return (
    <>
      {/* PageHero - documented pattern for layout headers */}
      <PageHero
        title={t('competitiveness.title')}
        description={t('competitiveness.description')}
      >
        <div className='flex flex-wrap gap-2 justify-center'>
          <Badge variant='primary' dot>
            {t('competitiveness.cmciYear', { year: edition.year })}
          </Badge>
          <Badge variant='slate'>{t('competitiveness.dtiStandards')}</Badge>
        </div>
      </PageHero>

      {/* Edition switcher */}
      <div
        role='group'
        aria-label={t('competitiveness.yearPicker')}
        className='flex flex-wrap gap-2 justify-center mb-kapwa-lg'
      >
        {editions.map(e => (
          <button
            key={e.year}
            type='button'
            aria-pressed={e.year === selectedYear}
            onClick={() => setSelectedYear(e.year)}
            className={cn(
              'focus-visible:ring-kapwa-border-focus min-h-[44px] rounded-xl border px-3 text-sm font-bold focus-visible:ring-2 focus-visible:outline-none',
              e.year === selectedYear
                ? 'border-kapwa-border-brand bg-kapwa-bg-surface text-kapwa-text-brand-bold shadow-sm'
                : 'border-kapwa-border-weak bg-kapwa-bg-surface text-kapwa-text-support hover:text-kapwa-text-strong'
            )}
          >
            {e.year}
          </button>
        ))}
      </div>

      {/* KPI Cards - using new StatCard component */}
      <div className='grid grid-cols-1 gap-4 items-stretch md:grid-cols-3 mb-kapwa-lg'>
        <StatCard
          label={t('competitiveness.overallScore')}
          value={String(edition.overall_score)}
          subtext={t('competitiveness.cmciIndex')}
          variant='primary'
        />
        <StatCard
          label={t('competitiveness.overallRank')}
          value={rankLabel(edition.overall_rank)}
          subtext={
            edition.peer_count
              ? t('competitiveness.ofPeers', {
                  count: edition.peer_count,
                  group: edition.peer_group,
                })
              : t('competitiveness.amongCategory', {
                  category: edition.category,
                })
          }
          variant='secondary'
          icon={Medal}
        />
        <StatCard
          label={t('competitiveness.pillarsTracked')}
          value={edition.pillars.length}
          subtext={t('competitiveness.dtiStandards')}
          variant='slate'
          icon={Trophy}
        />
      </div>
      <p className='mx-auto max-w-3xl text-xs leading-relaxed text-center text-kapwa-text-support mb-kapwa-lg'>
        {t('competitiveness.methodologyNote')}
      </p>

      {/* Tab Switcher */}
      <nav className='mb-kapwa-lg bg-kapwa-bg-hover flex gap-1.5 rounded-2xl p-1.5'>
        {(['trends', 'pillars'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'min-h-[48px] flex-1 rounded-xl py-3 text-xs font-bold tracking-widest uppercase transition-all',
              activeTab === tab
                ? 'text-kapwa-text-brand-bold bg-kapwa-bg-surface shadow-md'
                : 'hover:text-kapwa-text-support text-kapwa-text-strong0'
            )}
          >
            {tab === 'trends' ? (
              <TrendingUp className='inline mr-1 w-4 h-4' />
            ) : (
              <BarChart3 className='inline mr-1 w-4 h-4' />
            )}
            {t(`competitiveness.tabs.${tab}`)}
          </button>
        ))}
      </nav>

      {activeTab === 'trends' ? (
        <DetailSection
          title={t('competitiveness.pillarTrends')}
          icon={TrendingUp}
        >
          <ResponsiveChart height={384}>
            <LineChart
              data={trendData}
              margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
            >
              <CartesianGrid
                vertical={false}
                stroke={CHART_THEME.grid}
                strokeDasharray='3 3'
              />
              <XAxis dataKey='year' {...standardAxisProps} dy={10} />
              <YAxis {...standardAxisProps} />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                verticalAlign='top'
                iconType='circle'
                wrapperStyle={{
                  paddingBottom: '20px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                }}
              />
              <Line
                type='monotone'
                dataKey='Overall'
                stroke={PILLAR_COLORS.Overall}
                strokeWidth={4}
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
              />
              {PILLAR_ORDER.map(name => (
                <Line
                  key={name}
                  type='monotone'
                  dataKey={name}
                  stroke={PILLAR_COLORS[name]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveChart>

          {/* The same figures as a table, with each year's DTI page. */}
          <div className='overflow-x-auto mt-6'>
            <table className='w-full text-sm text-left'>
              <caption className='sr-only'>
                {t('competitiveness.byYearCaption')}
              </caption>
              <thead>
                <tr className='text-[10px] font-bold tracking-widest uppercase border-b border-kapwa-border-weak text-kapwa-text-support'>
                  <th scope='col' className='py-2 pr-4'>
                    {t('competitiveness.columns.year')}
                  </th>
                  <th scope='col' className='py-2 pr-4'>
                    {t('competitiveness.columns.score')}
                  </th>
                  <th scope='col' className='py-2 pr-4'>
                    {t('competitiveness.columns.rank')}
                  </th>
                  <th scope='col' className='py-2 pr-4'>
                    {t('competitiveness.columns.pillars')}
                  </th>
                  <th scope='col' className='py-2'>
                    {t('competitiveness.columns.source')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {editions.map(e => {
                  const profile = getCivicSource(e.sources[0] as string);
                  return (
                    <tr
                      key={e.year}
                      className='border-b border-kapwa-border-weak text-kapwa-text-strong'
                    >
                      <th scope='row' className='py-2 pr-4 font-bold'>
                        {e.year}
                      </th>
                      <td className='py-2 pr-4 font-mono'>{e.overall_score}</td>
                      <td className='py-2 pr-4'>
                        {rankLabel(e.overall_rank)}
                        {e.peer_count ? ` / ${e.peer_count}` : ''}
                      </td>
                      <td className='py-2 pr-4'>{e.pillars.length}</td>
                      <td className='py-2'>
                        <a
                          href={profile.url}
                          target='_blank'
                          rel='noreferrer'
                          className='inline-flex gap-1 items-center underline underline-offset-2 text-kapwa-text-brand hover:text-kapwa-text-brand-bold'
                        >
                          {t('competitiveness.profileLink', { year: e.year })}
                          <ExternalLink
                            aria-hidden='true'
                            className='w-3 h-3'
                          />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </DetailSection>
      ) : (
        <div className='grid grid-cols-1 gap-8 lg:grid-cols-12'>
          <div className='space-y-3 lg:col-span-5'>
            {edition.pillars.map(p => (
              <button
                key={p.name}
                onClick={() => setSelectedPillar(p.name)}
                aria-pressed={currentPillar.name === p.name}
                className={cn(
                  'flex min-h-[56px] w-full items-center justify-between gap-3 rounded-2xl border p-4 text-left transition-all',
                  currentPillar.name === p.name
                    ? 'bg-kapwa-bg-surface border-kapwa-border-brand shadow-sm'
                    : 'border-kapwa-border-weak bg-kapwa-bg-surface'
                )}
              >
                <span
                  className={cn(
                    'text-sm font-bold',
                    currentPillar.name === p.name
                      ? 'text-kapwa-text-brand-bold'
                      : 'text-kapwa-text-support'
                  )}
                >
                  {p.name}
                </span>
                <span className='flex gap-2 items-center'>
                  <Badge variant='slate'>{rankLabel(p.rank)}</Badge>
                  <Badge variant='slate'>{p.score.toFixed(4)}</Badge>
                </span>
              </button>
            ))}
          </div>
          <div className='lg:col-span-7'>
            <DetailSection
              title={t('competitiveness.indicators', {
                pillar: currentPillar.name,
              })}
              icon={Target}
              className='bg-kapwa-bg-surface/30'
            >
              {currentPillar.indicators_status === 'published' ? (
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  {currentPillar.indicators.map(ind => (
                    <div
                      key={ind.name}
                      className='border-kapwa-border-weak bg-kapwa-bg-surface flex min-h-[100px] flex-col justify-between rounded-xl border p-4 shadow-xs'
                    >
                      <span className='text-kapwa-text-support text-[10px] leading-tight font-bold tracking-widest uppercase'>
                        {ind.name}
                      </span>
                      <span className='flex gap-2 justify-between items-baseline mt-2'>
                        <span className='text-xl font-black text-kapwa-text-strong'>
                          {ind.score.toFixed(4)}
                        </span>
                        <span className='text-xs font-bold text-kapwa-text-support'>
                          {rankLabel(ind.rank)}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <NotVerified
                  label={t('competitiveness.indicatorsWithheld')}
                  detail={t('competitiveness.indicatorsWithheldDetail', {
                    year: edition.year,
                  })}
                />
              )}
            </DetailSection>
          </div>
        </div>
      )}

      {/* Provenance for the selected edition */}
      <SourceNote className='mt-kapwa-lg' sources={edition.sources} />
    </>
  );
}
