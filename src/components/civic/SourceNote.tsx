import { FC } from 'react';

import { ExternalLink, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  earliestVerificationDate,
  formatVerificationDate,
  resolveCivicSources,
} from '@/lib/civicSources';

/**
 * The citation line shown beneath any published civic record.
 *
 * Better Dagupan is not the government, so a reader has no reason to take its
 * word for anything. Every published record names the agency that published
 * the figure, links the exact document, and says when it was last checked, so
 * the reader can go and confirm it. This component is the single place that
 * renders that, and is meant to be reused by every dataset that follows.
 *
 * Each source carries its own verification date, and the record-level date is
 * the oldest of them, so a stale citation cannot hide behind a freshly checked
 * one sitting next to it.
 */
export const SourceNote: FC<{
  sources: readonly string[];
  className?: string;
}> = ({ sources, className }) => {
  const { t, i18n } = useTranslation('common');
  const resolved = resolveCivicSources(sources);

  if (resolved.length === 0) return null;

  // The record is only as current as its least recently checked source.
  const recordVerified = earliestVerificationDate(sources);

  const label =
    resolved.length > 1 ? t('civic.sourcesLabel') : t('civic.sourceLabel');

  return (
    // A labelled region rather than a bare div: the citation is the reason a
    // reader can trust the page, so it should be reachable as a landmark.
    <section
      aria-label={label}
      className={`border-kapwa-border-weak bg-kapwa-bg-surface-raised/60 rounded-xl border p-4 ${className ?? ''}`}
    >
      <div className='text-kapwa-text-support flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase'>
        <ShieldCheck aria-hidden='true' className='h-3.5 w-3.5' />
        <span>{label}</span>
      </div>

      <ul className='mt-2 space-y-1.5'>
        {resolved.map(source => (
          <li
            key={source.id}
            className='text-kapwa-text-support text-xs leading-relaxed'
          >
            <span className='text-kapwa-text-strong font-semibold'>
              {source.agency}
            </span>{' '}
            &mdash;{' '}
            <a
              href={source.url}
              target='_blank'
              rel='noreferrer'
              className='text-kapwa-text-link hover:text-kapwa-text-link-hover inline-flex items-center gap-1 underline underline-offset-2'
            >
              {source.title}
              <ExternalLink aria-hidden='true' className='h-3 w-3' />
            </a>
            {/*
              Each citation states when it was last checked. Without this a
              reader cannot tell which of several sources is the stale one.
            */}
            <span className='text-kapwa-text-disabled block text-[11px]'>
              {t('civic.lastVerified', {
                date: formatVerificationDate(source.verified, i18n.language),
              })}
            </span>
          </li>
        ))}
      </ul>

      {/*
        Only worth repeating at record level when there is more than one date
        to reconcile; with a single source the line above already says it.
      */}
      {recordVerified && resolved.length > 1 && (
        <p className='text-kapwa-text-disabled mt-2 text-[11px]'>
          {t('civic.recordVerified', {
            date: formatVerificationDate(recordVerified, i18n.language),
          })}
        </p>
      )}
    </section>
  );
};
