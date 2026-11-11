import { useTranslation } from 'react-i18next';

/** The fallback a failed section shows, in the reader's language. */
export function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation('ui');
  return (
    <div className='rounded-lg border border-kapwa-border-danger bg-kapwa-bg-danger-weak p-6 text-center'>
      <p className='text-kapwa-text-danger text-sm font-medium'>
        {t('errorBoundary.message')}
      </p>
      <button
        type='button'
        onClick={onRetry}
        className='mt-2 text-xs text-kapwa-text-link hover:underline'
      >
        {t('errorBoundary.retry')}
      </button>
    </div>
  );
}
