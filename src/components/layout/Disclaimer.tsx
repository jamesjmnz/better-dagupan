import { FC } from 'react';

import { Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { config } from '@/lib/lguConfig';

/**
 * Better Dagupan is an independent, community-led project and not a government
 * website. Both presentations below render the same statement from the same
 * locale keys so the two can never drift apart.
 *
 * The portal and LGU names are interpolated from config/lgu.config.json rather
 * than written into the locale files, so a fork only has to change the config.
 */
const disclaimerValues = () => ({
  portal: config.portal.name,
  lgu: config.lgu.name,
});

/**
 * Compact single line for the global footer, so the statement is present on
 * every route rather than only where someone thought to add it.
 */
export const DisclaimerLine: FC = () => {
  const { t } = useTranslation('common');

  return (
    <p className='max-w-xl text-[11px] leading-relaxed text-kapwa-text-disabled'>
      {t('disclaimer.short', disclaimerValues())}
    </p>
  );
};

/**
 * Prominent notice for the homepage, where most first-time visitors land and
 * where the footer sits well below the fold.
 */
export const DisclaimerNotice: FC = () => {
  const { t } = useTranslation('common');
  const values = disclaimerValues();

  return (
    <aside
      aria-label={t('disclaimer.noticeTitle', values)}
      className='container mx-auto px-4'
    >
      <div className='flex flex-col gap-4 rounded-2xl border border-kapwa-border-weak bg-kapwa-bg-surface-raised p-5 sm:flex-row sm:items-start'>
        <div className='text-kapwa-text-brand shrink-0' aria-hidden='true'>
          <Info className='h-5 w-5' />
        </div>
        <div className='space-y-1'>
          <h2 className='text-kapwa-text-strong text-sm font-bold'>
            {t('disclaimer.noticeTitle', values)}
          </h2>
          <p className='text-kapwa-text-support text-sm leading-relaxed'>
            {t('disclaimer.noticeBody', values)}
          </p>
          <a
            href={config.lgu.officialWebsite}
            target='_blank'
            rel='noopener noreferrer'
            className='text-kapwa-text-link hover:text-kapwa-text-link-hover inline-block pt-1 text-sm font-semibold underline underline-offset-2'
          >
            {t('disclaimer.officialSiteLabel', values)}
          </a>
        </div>
      </div>
    </aside>
  );
};
