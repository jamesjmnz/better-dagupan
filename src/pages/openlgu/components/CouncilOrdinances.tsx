import { useEffect, useState } from 'react';

import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Landmark,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { EmptyState } from '@/components/ui/EmptyState';
import SearchInput from '@/components/ui/SearchInput';
import { config } from '@/lib/lguConfig';
import { lguLabels } from '@/lib/lguLabels';

interface CouncilOrdinance {
  id: number;
  /** When the council posted it on its site, not the enactment date. */
  postedAt: string;
  title: string;
  link: string;
  classifications: string[];
}

interface OrdinancesResponse {
  items: CouncilOrdinance[];
  page: number;
  total: number;
  totalPages: number;
  classifications: { id: number; name: string; count?: number }[];
}

const controlClassName =
  'focus-visible:ring-kapwa-border-brand focus-visible:outline-none focus-visible:ring-2';

/**
 * Ordinances the council posts on its own website, shown as titles that link
 * back to the council's pages while the portal's legislative records are not
 * published. Nothing is stored or re-hosted.
 */
export default function CouncilOrdinances() {
  const { t, i18n } = useTranslation('openlgu');
  const feed = config.openlgu?.councilFeed;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [classification, setClassification] = useState('');
  const [data, setData] = useState<OrdinancesResponse | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading'
  );

  useEffect(() => {
    if (!feed?.api) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setStatus('loading');
      const params = new URLSearchParams({ page: String(page) });
      if (search.trim()) params.set('search', search.trim());
      if (classification) params.set('classification', classification);
      try {
        const response = await fetch(`/api/council-ordinances?${params}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(String(response.status));
        const body = (await response.json()) as Partial<OrdinancesResponse>;
        // A 200 with some other shape (a proxy page, a stub) is a failure too.
        if (!Array.isArray(body?.items)) throw new Error('unexpected response');
        setData(body as OrdinancesResponse);
        setStatus('ready');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') setStatus('error');
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [feed?.api, page, search, classification]);

  if (!feed?.api) return null;

  const body = lguLabels.body;
  const classifications = data?.classifications ?? [];
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  return (
    <section
      aria-labelledby='council-ordinances-heading'
      className='border-kapwa-border-weak bg-kapwa-bg-surface mb-10 rounded-xl border p-4 shadow-sm sm:p-6'
    >
      <div className='mb-6 flex flex-col gap-4'>
        <div>
          <h2
            id='council-ordinances-heading'
            className='text-kapwa-text-strong kapwa-heading-md font-bold'
          >
            {t('councilOrdinances.title', { body })}
          </h2>
          <p className='text-kapwa-text-support mt-1 text-sm'>
            {t('councilOrdinances.description', { body })}
          </p>
        </div>
        <div className='flex flex-col gap-2 sm:flex-row'>
          {classifications.length > 0 && (
            <>
              <label className='sr-only' htmlFor='council-ordinances-class'>
                {t('councilOrdinances.classificationLabel')}
              </label>
              <select
                id='council-ordinances-class'
                value={classification}
                aria-describedby={
                  classification ? 'council-ordinances-class-note' : undefined
                }
                onChange={event => {
                  setClassification(event.target.value);
                  setPage(1);
                }}
                className={`border-kapwa-border-weak bg-kapwa-bg-surface text-kapwa-text-strong min-h-11 rounded-lg border px-3 py-2 text-sm sm:max-w-xs ${controlClassName}`}
              >
                <option value=''>
                  {t('councilOrdinances.allClassifications')}
                </option>
                {classifications.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </>
          )}
          <SearchInput
            id='council-ordinances-search'
            aria-label={t('councilOrdinances.searchLabel', { body })}
            placeholder={t('councilOrdinances.searchPlaceholder')}
            value={search}
            onChangeValue={value => {
              setSearch(value);
              setPage(1);
            }}
            size='md'
            className='sm:flex-1'
          />
        </div>
      </div>

      {classification && status !== 'error' && (
        <p
          id='council-ordinances-class-note'
          className='text-kapwa-text-support mb-4 text-xs'
        >
          {t('councilOrdinances.classificationNote')}
        </p>
      )}

      {status === 'error' ? (
        <EmptyState
          icon={Landmark}
          title={t('councilOrdinances.unavailableTitle')}
          message={t('councilOrdinances.unavailableMessage', { body })}
          actionHref={feed.pageUrl}
          actionLabel={t('councilOrdinances.openCouncilPage')}
        />
      ) : status === 'ready' && data && data.items.length === 0 ? (
        <EmptyState
          title={t('councilOrdinances.noMatchesTitle')}
          message={t('councilOrdinances.noMatchesMessage')}
        />
      ) : (
        <ul
          className='divide-kapwa-border-weak divide-y'
          aria-busy={status === 'loading'}
        >
          {(data?.items ?? []).map(ordinance => (
            <li
              key={ordinance.id}
              className='flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6'
            >
              <a
                href={ordinance.link}
                target='_blank'
                rel='noreferrer'
                className={`text-kapwa-text-strong hover:text-kapwa-text-brand rounded-sm text-sm font-medium ${controlClassName}`}
              >
                {ordinance.title}
                <ExternalLink
                  className='ml-1 inline h-3 w-3'
                  aria-label={t('councilOrdinances.opensCouncilPage')}
                />
              </a>
              <div className='text-kapwa-text-support flex shrink-0 flex-wrap gap-x-3 gap-y-1 text-xs sm:max-w-[40%] sm:justify-end sm:text-right'>
                {ordinance.classifications.map(name => (
                  <span key={name}>{name}</span>
                ))}
                <time dateTime={ordinance.postedAt}>
                  {t('councilOrdinances.posted', {
                    date: formatDate(ordinance.postedAt),
                  })}
                </time>
              </div>
            </li>
          ))}
        </ul>
      )}

      {data && data.totalPages > 1 && status !== 'error' && (
        <nav
          aria-label={t('councilOrdinances.pagination')}
          className='mt-4 flex items-center justify-between gap-2 text-sm'
        >
          <button
            type='button'
            onClick={() => setPage(current => Math.max(1, current - 1))}
            disabled={page <= 1}
            className={`text-kapwa-text-brand inline-flex min-h-11 items-center gap-1 rounded-lg px-2 disabled:opacity-40 ${controlClassName}`}
          >
            <ChevronLeft className='h-4 w-4' aria-hidden='true' />
            {t('councilOrdinances.previous')}
          </button>
          <span className='text-kapwa-text-support text-center'>
            {t('councilOrdinances.pageOf', {
              page,
              totalPages: data.totalPages,
              total: data.total,
            })}
          </span>
          <button
            type='button'
            onClick={() =>
              setPage(current => Math.min(data.totalPages, current + 1))
            }
            disabled={page >= data.totalPages}
            className={`text-kapwa-text-brand inline-flex min-h-11 items-center gap-1 rounded-lg px-2 disabled:opacity-40 ${controlClassName}`}
          >
            {t('councilOrdinances.next')}
            <ChevronRight className='h-4 w-4' aria-hidden='true' />
          </button>
        </nav>
      )}

      <p className='text-kapwa-text-support mt-4 text-xs'>
        {t('councilOrdinances.attribution', { body })}{' '}
        <a
          href={feed.pageUrl}
          target='_blank'
          rel='noreferrer'
          className={`text-kapwa-text-brand hover:text-kapwa-text-brand-bold rounded-sm underline ${controlClassName}`}
        >
          {t('councilOrdinances.openCouncilPage')}
        </a>
      </p>
    </section>
  );
}
