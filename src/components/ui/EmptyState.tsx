import { Link } from 'react-router-dom';

import { ArrowLeft, LucideIcon, PlusCircle, SearchX } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionHref?: string;
  /** Runs instead of navigating. Takes precedence over `actionHref`. */
  onAction?: () => void;
  actionLabel?: string; // New prop to customize the button text
  icon?: LucideIcon;
}

const actionClassName =
  'border-kapwa-border-weak bg-kapwa-bg-surface text-kapwa-text-support hover:border-kapwa-border-weak hover:bg-kapwa-bg-surface-raised mt-8 inline-flex min-h-[48px] items-center gap-2 rounded-xl border px-6 py-3 text-sm font-bold transition-all hover:shadow-md';

export function EmptyState({
  title,
  message,
  actionHref,
  onAction,
  actionLabel: customActionLabel,
  icon: Icon = SearchX,
}: EmptyStateProps) {
  const { t } = useTranslation('ui');
  const heading = title ?? t('emptyState.title');
  const body = message ?? t('emptyState.message');
  const actionLabel = customActionLabel ?? t('emptyState.goBack');

  // Adaptive Icon logic: Use Plus icon if it's a contribution, otherwise an Arrow
  const isContribution =
    !!customActionLabel &&
    (customActionLabel.toLowerCase().includes('suggest') ||
      customActionLabel.toLowerCase().includes('add'));

  // Auto-detect external links
  const isExternal = actionHref?.startsWith('http');

  const actionContent = (
    <>
      {isContribution ? (
        <PlusCircle className='text-kapwa-text-brand h-4 w-4' />
      ) : (
        <ArrowLeft className='text-kapwa-text-disabled h-4 w-4' />
      )}
      {actionLabel}
    </>
  );

  return (
    <div className='animate-in fade-in zoom-in-95 flex flex-col items-center justify-center py-20 text-center duration-500'>
      {/* Icon Wrapper */}
      <div className='bg-kapwa-bg-surface-raised mb-kapwa-md rounded-full p-kapwa-md ring-8 ring-kapwa-bg-surface/50'>
        <Icon
          className='text-kapwa-text-support h-12 w-12'
          aria-hidden='true'
        />
      </div>

      {/* Text Content */}
      <h3 className='text-kapwa-text-strong kapwa-heading-lg leading-tight'>
        {heading}
      </h3>
      <p className='text-kapwa-text-support mx-auto mt-kapwa-xs max-w-sm kapwa-body-sm-default leading-relaxed'>
        {body}
      </p>

      {/* Conditional Action Button */}
      {onAction ? (
        <button type='button' onClick={onAction} className={actionClassName}>
          {actionContent}
        </button>
      ) : (
        actionHref &&
        (isExternal ? (
          <a
            href={actionHref}
            target='_blank'
            rel='noopener noreferrer'
            className={actionClassName}
          >
            {actionContent}
          </a>
        ) : (
          <Link to={actionHref} className={actionClassName}>
            {actionContent}
          </Link>
        ))
      )}
    </div>
  );
}
