import { FC } from 'react';

import { Link } from 'react-router-dom';

import { ArrowRightIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { SEO } from '@/components/layout/SEO';
import { config } from '@/lib/lguConfig';

/*
  The project's open plans. Each one says what it is waiting on, so no
  status here is a promise of when it will ship.
*/
type Need = 'database' | 'volunteer' | 'source';

const PLANS: { key: string; need: Need }[] = [
  { key: 'legislation', need: 'database' },
  { key: 'pangasinan', need: 'volunteer' },
  { key: 'barangayCouncils', need: 'source' },
  { key: 'moreServices', need: 'source' },
];

const NEED_STYLES: Record<Need, string> = {
  database: 'bg-kapwa-bg-info-weak text-kapwa-text-info',
  volunteer: 'bg-kapwa-bg-accent-purple-weak text-kapwa-text-accent-purple',
  source: 'bg-kapwa-bg-warning-weak text-kapwa-orange-800',
};

const Ideas: FC = () => {
  const { t } = useTranslation('pages');
  const values = { portal: config.portal.name, lgu: config.lgu.fullName };
  const newIssue = `${config.portal.githubUrl}/issues/new`;

  return (
    <div className='bg-kapwa-bg-surface-raised min-h-screen'>
      <SEO
        title={t('ideas.seoTitle')}
        description={t('ideas.seoDescription', values)}
      />
      <div className='container mx-auto px-4 py-8 md:py-12'>
        <div className='bg-kapwa-bg-surface border-kapwa-border-weak mt-4 rounded-lg border p-6 shadow-xs md:p-8 md:py-16'>
          <div className='mx-auto max-w-3xl text-center'>
            <h1 className='text-kapwa-text-strong kapwa-heading-xl mb-4 font-extrabold'>
              {t('ideas.title')}
            </h1>
            <p className='text-kapwa-text-support text-lg leading-relaxed'>
              {t('ideas.intro', values)}
            </p>
          </div>
        </div>

        <ul className='mt-8 space-y-4'>
          {PLANS.map(plan => (
            <li
              key={plan.key}
              className='bg-kapwa-bg-surface border-kapwa-border-weak rounded-lg border p-6 shadow-xs'
            >
              <div className='mb-2 flex flex-wrap items-center justify-between gap-3'>
                <h2 className='text-kapwa-text-strong text-lg font-semibold'>
                  {t(`ideas.plans.${plan.key}.title`)}
                </h2>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${NEED_STYLES[plan.need]}`}
                >
                  {t(`ideas.needs.${plan.need}`)}
                </span>
              </div>
              <p className='text-kapwa-text-support leading-relaxed'>
                {t(`ideas.plans.${plan.key}.description`, values)}
              </p>
            </li>
          ))}
        </ul>

        <div className='bg-kapwa-bg-surface border-kapwa-border-weak mt-8 rounded-lg border p-6 text-center shadow-xs'>
          <h2 className='text-kapwa-text-strong mb-2 text-xl font-bold'>
            {t('ideas.ctaTitle')}
          </h2>
          <p className='text-kapwa-text-support mb-4'>{t('ideas.ctaBody')}</p>
          <div className='flex flex-wrap justify-center gap-3'>
            <a
              href={newIssue}
              target='_blank'
              rel='noopener noreferrer'
              className='bg-kapwa-bg-brand-default text-kapwa-text-inverse inline-flex min-h-11 items-center gap-2 rounded-lg px-5 py-2.5 font-semibold hover:opacity-90'
            >
              {t('ideas.suggest')}
              <ArrowRightIcon aria-hidden='true' className='h-4 w-4' />
            </a>
            <Link
              to='/join-us'
              className='border-kapwa-border-brand text-kapwa-text-brand inline-flex min-h-11 items-center rounded-lg border px-5 py-2.5 font-semibold hover:bg-kapwa-bg-surface-raised'
            >
              {t('ideas.help')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ideas;
