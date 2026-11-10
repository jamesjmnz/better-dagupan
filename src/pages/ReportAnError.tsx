import { FC } from 'react';

import { useSearchParams } from 'react-router-dom';

import {
  ExternalLink,
  FileWarning,
  Github,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { SEO } from '@/components/layout/SEO';
import { config } from '@/lib/lguConfig';
import {
  buildReportEmailUrl,
  buildReportIssueUrl,
  normalizeReportedPage,
} from '@/lib/reportError';

const focusRing =
  'focus-visible:ring-kapwa-border-focus focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none';

/**
 * Explains how a reader gets a wrong civic fact corrected.
 *
 * There is no form or backend here. The reader is sent to a public GitHub
 * issue form, or to email, and the only thing the portal pre-fills is the
 * page they came from. Nothing about the reader is collected.
 */
const ReportAnError: FC = () => {
  const { t } = useTranslation('common');
  const [searchParams] = useSearchParams();

  const page = normalizeReportedPage(searchParams.get('page'));
  const origin = typeof window === 'undefined' ? '' : window.location.origin;

  const values = { portal: config.portal.name, lgu: config.lgu.name };
  const issueUrl = buildReportIssueUrl(config.portal.githubUrl, page, origin);
  const emailUrl = config.portal.contactEmail
    ? buildReportEmailUrl(
        config.portal.contactEmail,
        page
          ? t('reportError.emailSubjectPage', { page })
          : t('reportError.emailSubject')
      )
    : null;

  const rules = [
    t('reportError.ruleSource', values),
    t('reportError.ruleLink', values),
    t('reportError.ruleReview', values),
    t('reportError.rulePublic', values),
  ];

  return (
    <div className='bg-kapwa-bg-surface-raised min-h-screen'>
      <SEO
        title={t('reportError.seoTitle', values)}
        description={t('reportError.seoDescription', values)}
        keywords={['correction', 'report an error', config.lgu.fullName]}
      />

      <div className='container mx-auto max-w-3xl px-4 py-8 md:py-12'>
        <header className='bg-kapwa-bg-surface border-kapwa-border-weak rounded-2xl border p-6 shadow-xs md:p-8'>
          <div className='bg-kapwa-bg-brand-weak text-kapwa-text-brand mb-4 w-fit rounded-xl p-3'>
            <FileWarning aria-hidden='true' className='h-6 w-6' />
          </div>
          <h1 className='text-kapwa-text-strong kapwa-heading-xl font-extrabold'>
            {t('reportError.title', values)}
          </h1>
          <p className='text-kapwa-text-support mt-3 leading-relaxed'>
            {t('reportError.intro', values)}
          </p>

          {page && (
            <p className='border-kapwa-border-weak bg-kapwa-bg-surface-raised mt-5 rounded-lg border px-4 py-3 text-sm'>
              <span className='text-kapwa-text-support block text-xs font-semibold'>
                {t('reportError.reportingPage', values)}
              </span>
              <code
                data-testid='reported-page'
                className='text-kapwa-text-strong break-all'
              >
                {page}
              </code>
            </p>
          )}
        </header>

        <section
          aria-labelledby='report-error-how'
          className='bg-kapwa-bg-surface border-kapwa-border-weak mt-6 rounded-2xl border p-6 shadow-xs md:p-8'
        >
          <h2
            id='report-error-how'
            className='text-kapwa-text-strong flex items-center gap-2 text-lg font-bold'
          >
            <ShieldCheck
              aria-hidden='true'
              className='text-kapwa-text-brand h-5 w-5'
            />
            {t('reportError.howTitle', values)}
          </h2>
          <ul className='text-kapwa-text-support mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed'>
            {rules.map(rule => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </section>

        <div className='mt-6 grid gap-6 md:grid-cols-2'>
          <section
            aria-labelledby='report-error-github'
            className='bg-kapwa-bg-surface border-kapwa-border-weak flex flex-col rounded-2xl border p-6 shadow-xs'
          >
            <h2
              id='report-error-github'
              className='text-kapwa-text-strong flex items-center gap-2 font-bold'
            >
              <Github aria-hidden='true' className='h-5 w-5' />
              {t('reportError.githubTitle', values)}
            </h2>
            <p className='text-kapwa-text-support mt-2 flex-1 text-sm leading-relaxed'>
              {t('reportError.githubBody', values)}
            </p>
            <a
              href={issueUrl}
              target='_blank'
              rel='noopener noreferrer'
              aria-label={t('reportError.githubActionLabel', values)}
              data-testid='report-error-github'
              className={`bg-kapwa-bg-brand-default text-kapwa-text-inverse hover:bg-kapwa-bg-brand-hover mt-5 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-colors ${focusRing}`}
            >
              {t('reportError.githubAction', values)}
              <ExternalLink aria-hidden='true' className='h-4 w-4' />
            </a>
          </section>

          {emailUrl && (
            <section
              aria-labelledby='report-error-email'
              className='bg-kapwa-bg-surface border-kapwa-border-weak flex flex-col rounded-2xl border p-6 shadow-xs'
            >
              <h2
                id='report-error-email'
                className='text-kapwa-text-strong flex items-center gap-2 font-bold'
              >
                <Mail aria-hidden='true' className='h-5 w-5' />
                {t('reportError.emailTitle', values)}
              </h2>
              <p className='text-kapwa-text-support mt-2 flex-1 text-sm leading-relaxed'>
                {t('reportError.emailBody', {
                  ...values,
                  email: config.portal.contactEmail,
                })}
              </p>
              <a
                href={emailUrl}
                data-testid='report-error-email'
                className={`border-kapwa-border-weak bg-kapwa-bg-surface text-kapwa-text-strong hover:bg-kapwa-bg-surface-raised mt-5 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-bold transition-colors ${focusRing}`}
              >
                <Mail aria-hidden='true' className='h-4 w-4' />
                {t('reportError.emailAction', values)}
              </a>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportAnError;
