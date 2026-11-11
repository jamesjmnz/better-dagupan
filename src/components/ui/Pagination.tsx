import { Button } from '@bettergov/kapwa/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  resultsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onResultsPerPageChange: (limit: number) => void;
}

export function PaginationControls({
  currentPage,
  totalPages,
  resultsPerPage,
  totalItems,
  onPageChange,
  onResultsPerPageChange,
}: PaginationProps) {
  const { t } = useTranslation('ui');
  // Helper to generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          '...',
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          '...',
          currentPage - 1,
          currentPage,
          currentPage + 1,
          '...',
          totalPages
        );
      }
    }
    return pages;
  };

  const start = (currentPage - 1) * resultsPerPage + 1;
  const end = Math.min(currentPage * resultsPerPage, totalItems);

  return (
    <div className='border-kapwa-border-weak bg-kapwa-bg-surface-raised flex flex-col items-center gap-4 border-t p-4 md:flex-row md:justify-between'>
      {/* Left: Info & Selector */}
      <div className='text-kapwa-text-disabled flex flex-wrap items-center justify-center gap-4 text-xs font-medium'>
        <span>
          <Trans
            t={t}
            i18nKey='pagination.showing'
            values={{
              start: Math.max(0, start),
              end: Math.max(0, end),
              total: totalItems.toLocaleString(),
            }}
            components={{
              bold: <span className='text-kapwa-text-strong font-bold' />,
            }}
          />
        </span>

        <div className='flex items-center gap-2'>
          <span aria-hidden='true'>{t('pagination.rows')}</span>
          <select
            aria-label={t('pagination.rows')}
            value={resultsPerPage}
            onChange={e => onResultsPerPageChange(Number(e.target.value))}
            className='focus:border-kapwa-border-brand focus:ring-kapwa-border-brand border-kapwa-border-weak bg-kapwa-bg-surface text-kapwa-text-support h-8 rounded-lg text-xs font-medium'
          >
            {[10, 20, 50, 100].map(val => (
              <option key={val} value={val}>
                {val}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: Navigation Buttons */}
      <nav className='isolate flex items-center gap-1 rounded-md shadow-sm'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className='h-8 w-8 p-0'
          aria-label={t('pagination.previous')}
        >
          <ChevronLeft className='h-4 w-4' aria-hidden='true' />
        </Button>

        <div className='hidden gap-1 sm:flex'>
          {getPageNumbers().map((page, idx) =>
            page === '...' ? (
              <span
                key={`ellipsis-${idx}`}
                className='text-kapwa-text-disabled px-2 py-1 text-xs'
              >
                ...
              </span>
            ) : (
              <button
                key={idx}
                onClick={() => onPageChange(page as number)}
                className={`h-8 w-8 rounded-lg text-xs font-bold transition-colors ${
                  currentPage === page
                    ? 'bg-kapwa-bg-brand-default text-kapwa-text-inverse'
                    : 'hover:bg-kapwa-bg-surface-raised border-kapwa-border-weak bg-kapwa-bg-surface text-kapwa-text-support border'
                }`}
              >
                {page}
              </button>
            )
          )}
        </div>

        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className='h-8 w-8 p-0'
          aria-label={t('pagination.next')}
        >
          <ChevronRight className='h-4 w-4' aria-hidden='true' />
        </Button>
      </nav>
    </div>
  );
}
