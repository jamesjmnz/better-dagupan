import { useEffect, useMemo, useState } from 'react';

import { Button } from '@bettergov/kapwa/button';
import {
  BarChart3,
  Briefcase,
  Building2,
  Download,
  ExternalLink,
  FileText,
  Search,
  Tags,
  TrendingUp,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { StatCard } from '@/components/ui/StatCard';
import { ModuleHeader } from '@/components/layout/PageLayouts';
import { Badge } from '@/components/ui/Badge';
import { CardGrid } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { PaginationControls } from '@/components/ui/Pagination';
import SearchInput from '@/components/ui/SearchInput';

import { formatPesoAdaptive } from '@/lib/format';
import { config } from '@/lib/lguConfig';
import { useLguTerms } from '@/lib/useLguTerms';
import { INDICES, PhilgepsDoc, client } from '@/lib/meilisearch';

import CityNotices from './CityNotices';

// Helper Interface for Aggregate Data (matching BetterGov structure)
interface AggregateStats {
  organization_name: string;
  count: number;
  total: number;
}

export default function ProcurementPage() {
  const { t, i18n } = useTranslation('transparency');
  const terms = useLguTerms();
  // --- State (Aligned with EnhancedSearchInterface) ---
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PhilgepsDoc[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(results.length / resultsPerPage);
  const paginatedResults = results.slice(
    (currentPage - 1) * resultsPerPage,
    (currentPage - 1) * resultsPerPage + resultsPerPage
  );

  // Statistics
  const [precomputedStats, setPrecomputedStats] =
    useState<AggregateStats | null>(null);
  const [chartDataResults, setChartDataResults] = useState<
    Partial<PhilgepsDoc>[]
  >([]); // Full dataset for charts

  // Constants
  // PhilGEPS has listed the LGU under more than one exact entity name over
  // time. Names stay out of config until confirmed against the live index;
  // every query and outbound link below is gated on at least one being set.
  const ORG_NAMES = config.transparency.procurement.organizationNames.filter(
    name => name.trim().length > 0
  );
  const ORG_CONFIGURED = ORG_NAMES.length > 0;
  const ORG_FILTER = `organization_name IN [${ORG_NAMES.map(name => JSON.stringify(name)).join(', ')}]`;
  const orgDashboardUrl = `${config.transparency.procurement.externalDashboard}${encodeURIComponent(ORG_NAMES[0] ?? '')}`;

  // Helper function to get badge variant based on award status
  const getAwardStatusBadgeVariant = (
    status: string | undefined
  ): 'success' | 'warning' | 'error' | 'slate' | 'primary' => {
    switch (status) {
      case 'Awarded':
        return 'success';
      case 'Failed':
      case 'Cancelled':
      case 'Disapproved':
      case 'Declined':
        return 'error';
      case 'Pending':
      case 'Under Review':
      case 'Published':
        return 'warning';
      default:
        return 'slate';
    }
  };

  // Helper function to get badge variant based on business category
  const getBusinessCategoryBadgeVariant = (
    category: string | undefined
  ): 'primary' | 'secondary' | 'warning' | 'success' | 'slate' => {
    if (!category) return 'slate';
    const cat = category.toLowerCase();
    if (
      cat.includes('construction') ||
      cat.includes('infrastructure') ||
      cat.includes('building')
    )
      return 'primary';
    if (
      cat.includes('service') ||
      cat.includes('consultancy') ||
      cat.includes('professional')
    )
      return 'secondary';
    if (
      cat.includes('supply') ||
      cat.includes('material') ||
      cat.includes('equipment')
    )
      return 'success';
    if (
      cat.includes('maintenance') ||
      cat.includes('repair') ||
      cat.includes('contract')
    )
      return 'warning';
    return 'primary';
  };

  // --- Data Loading ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Without a confirmed entity name the document filter would be
      // organization_name = "" and, more damagingly, the aggregate lookup below
      // searches the organizations index with an empty query, which returns an
      // arbitrary organization whose contract count and peso total would then
      // render as this LGU's. Show the empty state rather than another LGU's
      // procurement record.
      if (!ORG_CONFIGURED) {
        setResults([]);
        setChartDataResults([]);
        setPrecomputedStats(null);
        setLoading(false);
        return;
      }

      try {
        const index = client.index(INDICES.PHILGEPS);
        const orgIndex = client.index(INDICES.PHILGEPS_ORGS);

        // 1. Search Documents (Paginated)
        const searchPromise = index.search(query, {
          filter: ORG_FILTER,
          sort: ['award_date:desc'],
          limit: resultsPerPage,
          offset: (currentPage - 1) * resultsPerPage,
        });

        // 2. Fetch Precomputed Stats (Fast Total)
        // Sum the exact-name aggregates; the organizations search is fuzzy.
        const statsPromise: Promise<AggregateStats | null> =
          !precomputedStats && !query
            ? Promise.all(
                ORG_NAMES.map(name => orgIndex.search(name, { limit: 20 }))
              ).then(responses => {
                const matches = responses
                  .map((res, i) =>
                    (res.hits as unknown as AggregateStats[]).find(
                      hit => hit.organization_name === ORG_NAMES[i]
                    )
                  )
                  .filter((hit): hit is AggregateStats => Boolean(hit));
                if (matches.length === 0) return null;
                return matches.reduce((sum, hit) => ({
                  ...sum,
                  count: Number(sum.count) + Number(hit.count),
                  total: Number(sum.total) + Number(hit.total),
                }));
              })
            : Promise.resolve(null);

        // 3. Fetch Data for Visualizations
        // We need a larger dataset to calculate the "Unique Categories" and "Average Cost" accurately
        const chartPromise = index.search(query, {
          filter: ORG_FILTER,
          attributesToRetrieve: ['contract_amount', 'business_category'],
          limit: 5000,
        });

        const [searchRes, statsRes, chartRes] = await Promise.all([
          searchPromise,
          statsPromise,
          chartPromise,
        ]);

        setResults(searchRes.hits as unknown as PhilgepsDoc[]);

        if (statsRes) {
          setPrecomputedStats(statsRes);
        }

        setChartDataResults(
          chartRes.hits as {
            contract_amount: number;
            business_category: string;
          }[]
        );
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchData, 400);
    return () => clearTimeout(timer);
  }, [query, currentPage, resultsPerPage]); // eslint-disable-line react-hooks/exhaustive-deps -- ORG_NAMES and ORG_FILTER are config-derived constants; precomputedStats is only read conditionally

  // --- Derived Statistics ---
  const detailedStats = useMemo(() => {
    // Use precomputed totals if available (more accurate), otherwise sum the deep fetch
    const totalContractAmount =
      precomputedStats?.total ||
      chartDataResults.reduce(
        (sum, item) => sum + Number(item.contract_amount || 0),
        0
      );
    const totalContractCount =
      precomputedStats?.count || chartDataResults.length;

    // Calculate Averages
    const averageCost =
      totalContractCount > 0 ? totalContractAmount / totalContractCount : 0;

    // Unique Categories
    const uniqueCategories = new Set(
      chartDataResults.map(i => i.business_category).filter(Boolean)
    );

    return {
      uniqueCategories: uniqueCategories.size,
      totalContractAmount,
      totalContractCount,
      averageCost,
    };
  }, [chartDataResults, precomputedStats]);

  // --- Helpers ---
  const formatDate = (dateStr: string) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString(i18n.language, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : '-';

  const downloadCSV = () => {
    const headers = [
      'Reference',
      'Title',
      'Awardee',
      'Amount',
      'Date',
      'Status',
    ];
    const rows = results.map(r => [
      r.reference_id,
      `"${r.notice_title?.replace(/"/g, '""')}"`,
      `"${r.awardee_name?.replace(/"/g, '""')}"`,
      r.contract_amount,
      r.award_date,
      r.award_status,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `philgeps-search-results.csv`;
    a.click();
  };

  return (
    <div className='animate-in fade-in mx-auto max-w-full space-y-8 px-4 pb-20 duration-500 md:px-8'>
      <ModuleHeader
        title={t('procurement.title')}
        description={t('procurement.description', {
          fullName: terms.fullName,
        })}
      >
        <div className='flex w-full flex-col items-center gap-4 md:w-auto md:flex-row'>
          <SearchInput
            value={query}
            onChangeValue={setQuery}
            placeholder={t('procurement.searchPlaceholder')}
            className='w-full md:w-80'
          />
          <div className='flex shrink-0 gap-2'>
            <Button
              variant='outline'
              onClick={downloadCSV}
              className='h-11 px-3'
              title={t('procurement.downloadCsv')}
              aria-label={t('procurement.downloadCsv')}
            >
              <Download className='h-4 w-4' aria-hidden='true' />
            </Button>
          </div>
        </div>
      </ModuleHeader>

      {/* --- STATS GRID --- */}
      <CardGrid columns={4}>
        <StatCard
          icon={Tags}
          label={t('procurement.stats.categories')}
          value={detailedStats.uniqueCategories}
          subtext={t('procurement.stats.businessSectors')}
          iconBg='bg-kapwa-bg-surface-raised text-kapwa-text-strong'
        />

        <StatCard
          icon={Briefcase}
          label={t('procurement.stats.totalValue')}
          value={
            formatPesoAdaptive(detailedStats.totalContractAmount).fullString
          }
          subtext={t('procurement.stats.accumulatedValue')}
          iconBg='bg-kapwa-green-50 text-kapwa-green-600'
        />

        <StatCard
          icon={TrendingUp}
          label={t('procurement.stats.average')}
          value={formatPesoAdaptive(detailedStats.averageCost).fullString}
          subtext={t('procurement.stats.perContract')}
          iconBg='bg-kapwa-bg-brand-weak text-kapwa-text-brand'
        />

        <StatCard
          icon={FileText}
          label={t('procurement.stats.volume')}
          value={detailedStats.totalContractCount.toLocaleString()}
          subtext={t('procurement.stats.totalContracts')}
          iconBg='bg-kapwa-bg-surface-raised text-kapwa-text-strong'
        />
      </CardGrid>

      {/* --- RESULTS TABLE --- */}
      {loading ? (
        <div className='space-y-4'>
          {[1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              className='bg-kapwa-bg-surface-raised h-16 animate-pulse rounded-xl'
            />
          ))}
        </div>
      ) : results.length === 0 ? (
        <EmptyState
          title={
            ORG_CONFIGURED
              ? t('procurement.noRecordsTitle')
              : t('procurement.pendingTitle')
          }
          message={
            ORG_CONFIGURED
              ? t('procurement.noRecordsMessage')
              : t('procurement.pendingMessage', { fullName: terms.fullName })
          }
          icon={Search}
        />
      ) : (
        <div className='border-kapwa-border-weak bg-kapwa-bg-surface overflow-hidden rounded-xl border shadow-sm'>
          <div className='overflow-x-auto'>
            <table className='w-full text-left text-sm'>
              <thead className='border-kapwa-border-weak bg-kapwa-bg-surface-raised text-kapwa-text-disabled border-b text-xs font-bold tracking-wider uppercase'>
                <tr>
                  <th className='hidden w-32 px-3 py-3 md:table-cell md:px-6 md:py-4'>
                    {t('procurement.table.refId')}
                  </th>
                  <th className='px-3 py-3 sm:px-6 sm:py-4'>
                    {t('procurement.table.contractTitle')}
                  </th>
                  <th className='px-3 py-3 text-right sm:px-6 sm:py-4'>
                    {t('procurement.table.amount')}
                  </th>
                  <th className='hidden px-3 py-3 md:table-cell md:px-6 md:py-4'>
                    {t('procurement.table.date')}
                  </th>
                  <th className='px-3 py-3 text-center sm:px-6 sm:py-4'>
                    {t('procurement.table.status')}
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-kapwa-border-weak'>
                {paginatedResults.map(row => (
                  <tr
                    key={row.id}
                    className='group hover:bg-kapwa-bg-surface-raised/50 transition-colors'
                  >
                    <td className='group-hover:text-kapwa-text-brand text-kapwa-text-disabled hidden px-3 py-3 font-mono text-xs transition-colors md:table-cell md:px-6 md:py-4'>
                      {row.reference_id}
                    </td>
                    <td className='px-3 py-3 sm:px-6 sm:py-4'>
                      <p
                        className='text-kapwa-text-strong line-clamp-2 leading-snug font-bold'
                        title={row.notice_title}
                      >
                        {row.notice_title}
                      </p>
                      <div className='mt-1 flex flex-wrap items-center gap-2'>
                        <Badge
                          variant={getBusinessCategoryBadgeVariant(
                            row.business_category
                          )}
                          className='max-w-full text-[9px] sm:h-4 sm:px-1.5 sm:py-0'
                        >
                          <span className='truncate max-w-[100px] sm:max-w-[150px]'>
                            {row.business_category}
                          </span>
                        </Badge>
                        {row.awardee_name && (
                          <span
                            className='text-kapwa-text-disabled max-w-[150px] truncate text-xs sm:max-w-[200px]'
                            title={row.awardee_name}
                          >
                            • {row.awardee_name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className='text-kapwa-text-strong px-3 py-3 text-right font-mono font-bold sm:px-6 sm:py-4'>
                      {formatPesoAdaptive(row.contract_amount).fullString}
                    </td>
                    <td className='text-kapwa-text-support hidden px-3 py-3 text-xs whitespace-nowrap md:table-cell md:px-6 md:py-4'>
                      {formatDate(row.award_date)}
                    </td>
                    <td className='px-3 py-4 text-center sm:px-6'>
                      <Badge
                        variant={getAwardStatusBadgeVariant(row.award_status)}
                        className='max-w-full text-[10px]'
                      >
                        <span className='truncate max-w-[80px] sm:max-w-[120px] inline-block align-bottom'>
                          {row.award_status}
                        </span>
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            resultsPerPage={resultsPerPage}
            totalItems={results.length}
            onPageChange={setCurrentPage}
            onResultsPerPageChange={limit => {
              setResultsPerPage(limit);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      <CityNotices />

      {/* --- EXTERNAL LINKS FOOTER --- */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {/* Link 1: Local Analytics. Hidden until the entity name is confirmed,
            because an empty one resolves to the all-organizations index rather
            than to this LGU. */}
        {ORG_CONFIGURED && (
          <div className='hover:border-kapwa-border-brand border-kapwa-border-weak bg-kapwa-bg-surface flex h-full flex-col justify-between rounded-xl border p-6 shadow-sm transition-all'>
            <div className='mb-4 flex items-start gap-4'>
              <div className='bg-kapwa-blue-50 text-kapwa-blue-600 shrink-0 rounded-xl p-3'>
                <BarChart3 className='h-6 w-6' />
              </div>
              <div>
                <h4 className='text-kapwa-text-strong mb-1 font-bold'>
                  {t('procurement.analyticsTitle')}
                </h4>
                <p className='text-kapwa-text-disabled text-xs leading-relaxed'>
                  {t('procurement.analyticsBody', { lgu: terms.lgu })}
                </p>
              </div>
            </div>
            <a
              href={orgDashboardUrl}
              target='_blank'
              rel='noreferrer'
              className='text-kapwa-text-inverse bg-kapwa-brand-600 hover:bg-kapwa-brand-700 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-colors'
            >
              {t('procurement.analyticsAction', { lgu: terms.lgu })}{' '}
              <ExternalLink className='h-3 w-3' />
            </a>
          </div>
        )}

        {/* Link 2: National Comparison */}
        <div className='hover:border-kapwa-border-brand border-kapwa-border-weak bg-kapwa-bg-surface flex h-full flex-col justify-between rounded-xl border p-6 shadow-sm transition-all'>
          <div className='mb-4 flex items-start gap-4'>
            <div className='text-kapwa-text-inverse bg-kapwa-brand-600 shrink-0 rounded-xl p-3'>
              <Building2 className='h-6 w-6' />
            </div>
            <div>
              <h4 className='text-kapwa-text-strong mb-1 font-bold'>
                {t('procurement.dashboardTitle')}
              </h4>
              <p className='text-kapwa-text-disabled text-xs leading-relaxed'>
                {t('procurement.dashboardBody')}
              </p>
            </div>
          </div>
          <a
            href='https://transparency.bettergov.ph/procurement'
            target='_blank'
            rel='noreferrer'
            className='text-kapwa-text-inverse bg-kapwa-brand-600 hover:bg-kapwa-brand-700 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-colors'
          >
            {t('procurement.dashboardAction')}{' '}
            <ExternalLink className='h-3 w-3' />
          </a>
        </div>
      </div>
    </div>
  );
}
