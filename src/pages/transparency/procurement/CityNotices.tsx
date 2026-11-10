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

interface CityNotice {
  id: number;
  date: string;
  title: string;
  link: string;
  type: string | null;
}

interface NoticesResponse {
  items: CityNotice[];
  page: number;
  total: number;
  totalPages: number;
  types: { id: number; name: string; count?: number }[];
}

/**
 * Bid and award notices the City Government posts on its own website, shown
 * as titles that link back to the city's pages. Nothing is re-hosted.
 */
export default function CityNotices() {
  const { t, i18n } = useTranslation('common');
  const feed = config.transparency.procurement.cityNotices;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [data, setData] = useState<NoticesResponse | null>(null);
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
      if (type) params.set('type', type);
      try {
        const response = await fetch(`/api/city-procurement?${params}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(String(response.status));
        const body = (await response.json()) as Partial<NoticesResponse>;
        // A 200 with some other shape (a proxy page, a stub) would otherwise
        // crash the whole procurement page on `items.length`.
        if (!Array.isArray(body?.items)) throw new Error('unexpected response');
        setData(body as NoticesResponse);
        setStatus('ready');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') setStatus('error');
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [feed?.api, page, search, type]);

  if (!feed?.api) return null;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  return (
    <section
      aria-labelledby='city-notices-heading'
      className='border-kapwa-border-weak bg-kapwa-bg-surface mt-10 rounded-xl border p-6 shadow-sm'
    >
      <div className='mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
        <div>
          <h2
            id='city-notices-heading'
            className='text-kapwa-text-strong kapwa-heading-md font-bold'
          >
            {t('cityNotices.title')}
          </h2>
          <p className='text-kapwa-text-support mt-1 text-sm'>
            {t('cityNotices.description', { lgu: lguLabels.fullName })}
          </p>
        </div>
        <div className='flex flex-col gap-2 sm:flex-row'>
          <label className='sr-only' htmlFor='city-notices-type'>
            {t('cityNotices.typeLabel')}
          </label>
          <select
            id='city-notices-type'
            value={type}
            onChange={event => {
              setType(event.target.value);
              setPage(1);
            }}
            className='border-kapwa-border-weak bg-kapwa-bg-surface text-kapwa-text-strong focus-visible:ring-kapwa-border-brand rounded-lg border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2'
          >
            <option value=''>{t('cityNotices.allTypes')}</option>
            {(data?.types ?? [])
              .filter(option => option.count !== 0)
              .map(option => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
          </select>
          <SearchInput
            placeholder={t('cityNotices.searchPlaceholder')}
            value={search}
            onChangeValue={value => {
              setSearch(value);
              setPage(1);
            }}
            size='sm'
          />
        </div>
      </div>

      {status === 'error' ? (
        <EmptyState
          icon={Landmark}
          title={t('cityNotices.unavailableTitle')}
          message={t('cityNotices.unavailableMessage')}
          actionHref={feed.pageUrl}
          actionLabel={t('cityNotices.openCityPage')}
        />
      ) : status === 'ready' && data && data.items.length === 0 ? (
        <EmptyState
          title={t('cityNotices.noMatchesTitle')}
          message={t('cityNotices.noMatchesMessage')}
        />
      ) : (
        <ul
          className='divide-kapwa-border-weak divide-y'
          aria-busy={status === 'loading'}
        >
          {(data?.items ?? []).map(notice => (
            <li
              key={notice.id}
              className='flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6'
            >
              <a
                href={notice.link}
                target='_blank'
                rel='noreferrer'
                className='text-kapwa-text-strong hover:text-kapwa-text-brand focus-visible:ring-kapwa-border-brand rounded-sm text-sm font-medium focus-visible:outline-none focus-visible:ring-2'
              >
                {notice.title}
                <ExternalLink
                  className='ml-1 inline h-3 w-3'
                  aria-label={t('cityNotices.opensCityPage')}
                />
              </a>
              <div className='text-kapwa-text-support flex shrink-0 gap-3 text-xs'>
                {notice.type && <span>{notice.type}</span>}
                <time dateTime={notice.date}>{formatDate(notice.date)}</time>
              </div>
            </li>
          ))}
        </ul>
      )}

      {data && data.totalPages > 1 && status !== 'error' && (
        <nav
          aria-label={t('cityNotices.pagination')}
          className='mt-4 flex items-center justify-between text-sm'
        >
          <button
            type='button'
            onClick={() => setPage(current => Math.max(1, current - 1))}
            disabled={page <= 1}
            className='text-kapwa-text-brand inline-flex items-center gap-1 disabled:opacity-40'
          >
            <ChevronLeft className='h-4 w-4' aria-hidden='true' />
            {t('cityNotices.previous')}
          </button>
          <span className='text-kapwa-text-support'>
            {t('cityNotices.pageOf', {
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
            className='text-kapwa-text-brand inline-flex items-center gap-1 disabled:opacity-40'
          >
            {t('cityNotices.next')}
            <ChevronRight className='h-4 w-4' aria-hidden='true' />
          </button>
        </nav>
      )}

      <p className='text-kapwa-text-support mt-4 text-xs'>
        {t('cityNotices.attribution', { lgu: lguLabels.fullName })}{' '}
        <a
          href={feed.pageUrl}
          target='_blank'
          rel='noreferrer'
          className='text-kapwa-text-brand hover:text-kapwa-text-brand-bold underline'
        >
          {t('cityNotices.openCityPage')}
        </a>
      </p>
    </section>
  );
}
