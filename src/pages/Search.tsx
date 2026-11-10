import { FC, useMemo, useState } from 'react';

import Fuse from 'fuse.js';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

import { Input } from '@bettergov/kapwa/input';
import { SearchIcon } from 'lucide-react';

import mergedServicesData from '@/data/citizens-charter/merged-services.json';
import { Badge, EmptyState } from '@/components/ui';

interface MergedService {
  slug: string;
  service: string;
  plainLanguageName?: string;
  type: string;
  category: { name: string; slug: string };
  classification?: string;
}

interface HitProps {
  hit: MergedService;
}

const Hit: FC<HitProps> = ({ hit }) => {
  return (
    <article className='hit-item border-kapwa-border-weak hover:bg-kapwa-bg-surface-raised hover:border-kapwa-border-brand border-b p-4 transition-all'>
      <a href={`/services/${hit.slug}`} className='block'>
        <h2 className='text-kapwa-text-info text-lg font-semibold hover:underline'>
          {hit.plainLanguageName || hit.service}
        </h2>
        <div className='text-kapwa-text-support mt-1 flex items-center gap-2 text-xs'>
          {hit.category && <span>{hit.category.name}</span>}
          <Badge
            variant='primary'
            className='bg-kapwa-bg-info-weak text-kapwa-text-info'
          >
            {hit.type}
          </Badge>
          {hit.classification && (
            <span className='text-kapwa-text-disabled'>
              {hit.classification}
            </span>
          )}
        </div>
      </a>
    </article>
  );
};

const SearchPage: FC = () => {
  const { t } = useTranslation('pages');
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  const fuse = useMemo(() => {
    return new Fuse(mergedServicesData as MergedService[], {
      keys: ['service', 'plainLanguageName', 'category.name', 'officeDivision'],
      threshold: 0.3,
    });
  }, []);

  const filteredResults = useMemo(() => {
    let results: MergedService[] = query
      ? fuse.search(query).map(r => r.item)
      : (mergedServicesData as MergedService[]);

    if (typeFilter) results = results.filter(s => s.type === typeFilter);
    if (categoryFilter)
      results = results.filter(s => s.category.name === categoryFilter);

    return results;
  }, [query, typeFilter, categoryFilter, fuse]);

  const categories = Array.from(
    new Set((mergedServicesData as MergedService[]).map(s => s.category.name))
  );

  const activeFiltersCount = (typeFilter ? 1 : 0) + (categoryFilter ? 1 : 0);

  return (
    <div className='container mx-auto px-4 py-8 md:py-12'>
      <Helmet>
        <title>{t('search.documentTitle')}</title>
        <meta name='description' content={t('search.metaDescription')} />
      </Helmet>

      <h1 className='kapwa-heading-xl text-kapwa-text-strong font-extrabold'>
        {t('search.title')}
      </h1>

      <div className='mb-6'>
        <div className='relative'>
          <SearchIcon className='absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-kapwa-text-disabled' />
          <Input
            type='text'
            placeholder={t('search.placeholder')}
            value={query}
            onChange={e => setQuery(e.target.value)}
            className='pl-12'
          />
        </div>
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className='mb-6 flex flex-wrap items-center gap-2'>
          <span className='text-kapwa-text-disabled text-sm'>
            {t('search.activeFilters')}
          </span>
          {typeFilter && (
            <Badge variant='primary' className='flex items-center gap-1'>
              {t('search.typeBadge', { type: typeFilter })}
              <button
                onClick={() => setTypeFilter('')}
                className='hover:text-kapwa-text-inverse ml-1'
                aria-label={t('search.removeType')}
              >
                ×
              </button>
            </Badge>
          )}
          {categoryFilter && (
            <Badge variant='secondary' className='flex items-center gap-1'>
              {t('search.categoryBadge', { category: categoryFilter })}
              <button
                onClick={() => setCategoryFilter('')}
                className='hover:text-kapwa-text-inverse ml-1'
                aria-label={t('search.removeCategory')}
              >
                ×
              </button>
            </Badge>
          )}
          {(typeFilter || categoryFilter) && (
            <button
              onClick={() => {
                setTypeFilter('');
                setCategoryFilter('');
              }}
              className='text-kapwa-text-brand hover:text-kapwa-text-link-hover text-sm font-medium'
            >
              {t('search.clearAll')}
            </button>
          )}
        </div>
      )}

      <div className='grid grid-cols-1 gap-8 lg:grid-cols-4'>
        <div className='lg:col-span-1'>
          <div className='bg-kapwa-bg-surface border-kapwa-border-weak sticky top-24 rounded-lg border p-4 shadow-sm'>
            <h3 className='mb-4 kapwa-heading-md text-kapwa-text-strong'>
              {t('search.filterBy')}
            </h3>

            <div className='mb-6'>
              <h4 className='mb-3 kapwa-label-sm text-kapwa-text-disabled'>
                {t('search.type')}
              </h4>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className='border-kapwa-border-weak bg-kapwa-bg-surface text-kapwa-text-strong w-full rounded-lg border p-2 text-sm focus:border-kapwa-border-focus focus:outline-none focus:ring-2 focus:ring-kapwa-border-focus/20'
              >
                <option value=''>{t('search.all')}</option>
                <option value='transaction'>{t('search.transaction')}</option>
                <option value='information'>{t('search.information')}</option>
              </select>
            </div>

            <div>
              <h4 className='mb-3 kapwa-label-sm text-kapwa-text-disabled'>
                {t('search.category')}
              </h4>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className='border-kapwa-border-weak bg-kapwa-bg-surface text-kapwa-text-strong w-full rounded-lg border p-2 text-sm focus:border-kapwa-border-focus focus:outline-none focus:ring-2 focus:ring-kapwa-border-focus/20'
              >
                <option value=''>{t('search.all')}</option>
                {categories.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className='lg:col-span-3'>
          <div className='bg-kapwa-bg-surface overflow-hidden rounded-lg shadow-sm'>
            {filteredResults.length === 0 ? (
              <EmptyState
                title={t('search.noResults')}
                message={
                  query
                    ? t('search.noMatches', { query })
                    : t('search.adjustFilters')
                }
                icon={SearchIcon}
                actionLabel={
                  query || typeFilter || categoryFilter
                    ? t('search.clearFilters')
                    : undefined
                }
                onAction={
                  query || typeFilter || categoryFilter
                    ? () => {
                        setQuery('');
                        setTypeFilter('');
                        setCategoryFilter('');
                      }
                    : undefined
                }
              />
            ) : (
              <>
                <div className='border-kapwa-border-weak border-b p-4'>
                  <p className='text-kapwa-text-disabled text-sm'>
                    {t('search.resultsFound', {
                      count: filteredResults.length,
                    })}
                  </p>
                </div>
                {filteredResults.map(hit => (
                  <Hit key={hit.slug} hit={hit} />
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
