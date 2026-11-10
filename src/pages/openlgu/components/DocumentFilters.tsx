import { Button } from '@bettergov/kapwa/button';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/Badge';
import SelectPicker from '@/components/ui/SelectPicker';

import { getDocTypeBadgeVariant } from '@/lib/openlgu';

import type { FilterType } from '../layout';

interface DocumentFiltersProps {
  filterType: FilterType;
  setFilterType: (type: FilterType) => void;
  authorIds: string[];
  setAuthorIds: (ids: string[]) => void;
  year: string;
  setYear: (year: string) => void;
  authorOptions: Array<{ label: string; value: string }>;
  yearOptions: Array<{ label: string; value: string }>;
}

const typeOptions: Array<{ labelKey: string; value: FilterType }> = [
  { labelKey: 'common.allDocuments', value: 'all' },
  { labelKey: 'common.ordinances', value: 'ordinance' },
  { labelKey: 'common.resolutions', value: 'resolution' },
  { labelKey: 'common.executiveOrders', value: 'executive_order' },
];

export default function DocumentFilters({
  filterType,
  setFilterType,
  authorIds,
  setAuthorIds,
  year,
  setYear,
  authorOptions,
  yearOptions,
}: DocumentFiltersProps) {
  const { t } = useTranslation('openlgu');
  const localizedTypeOptions = typeOptions.map(option => ({
    label: t(option.labelKey),
    value: option.value,
  }));
  const hasActiveFilters =
    filterType !== 'all' || authorIds.length > 0 || year !== '';

  const handleClearAll = () => {
    setFilterType('all');
    setAuthorIds([]);
    setYear('');
  };

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center gap-3'>
        {/* Type Filter - Single Select */}
        <div className='min-w-[180px] flex-1 sm:flex-none'>
          <SelectPicker
            options={localizedTypeOptions}
            selectedValues={[filterType]}
            onSelect={selected => setFilterType(selected[0]?.value || 'all')}
            placeholder={t('filters.type')}
            size='md'
            searchable={false}
            clearable={true}
          />
        </div>

        {/* Author Filter - Multi Select */}
        <div className='min-w-[240px] flex-1 sm:flex-none'>
          <SelectPicker
            options={authorOptions}
            selectedValues={authorIds}
            onSelect={selected => setAuthorIds(selected.map(s => s.value))}
            placeholder={t('filters.authors')}
            size='md'
            searchable={true}
            clearable={true}
          />
        </div>

        {/* Year Filter - Single Select */}
        <div className='min-w-[140px] flex-1 sm:flex-none'>
          <SelectPicker
            options={yearOptions}
            selectedValues={year ? [year] : []}
            onSelect={selected => setYear(selected[0]?.value || '')}
            placeholder={t('filters.year')}
            size='md'
            searchable={true}
            clearable={true}
          />
        </div>

        {/* Clear All Button */}
        {hasActiveFilters && (
          <Button
            variant='ghost'
            size='md'
            onClick={handleClearAll}
            leftIcon={<X className='h-4 w-4' />}
          >
            {t('common.clearAll')}
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className='flex flex-wrap gap-2'>
          {filterType !== 'all' && (
            <Badge
              variant={getDocTypeBadgeVariant(filterType)}
              className='cursor-pointer hover:opacity-80'
              onClick={() => setFilterType('all')}
            >
              {t('filters.typeBadge', {
                type: localizedTypeOptions.find(o => o.value === filterType)
                  ?.label,
              })}
            </Badge>
          )}
          {authorIds.length > 0 && (
            <Badge
              variant='secondary'
              className='cursor-pointer hover:opacity-80'
              onClick={() => setAuthorIds([])}
            >
              {t('filters.authorBadge', { count: authorIds.length })}
            </Badge>
          )}
          {year && (
            <Badge
              variant='slate'
              className='cursor-pointer hover:opacity-80'
              onClick={() => setYear('')}
            >
              {t('filters.yearBadge', { year })}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
