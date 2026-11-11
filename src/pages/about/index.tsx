import { FC } from 'react';

import { Link } from 'react-router-dom';

import {
  CodeIcon,
  FileCheckIcon,
  FlagIcon,
  LayersIcon,
  ScaleIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { SEO } from '@/components/layout/SEO';
import { config } from '@/lib/lguConfig';

const VERIFICATION_GUIDE_PATH = '/blob/main/docs/civic-data-verification.md';

const AboutPage: FC = () => {
  const { t } = useTranslation('about');
  const values = { portal: config.portal.name, lgu: config.lgu.fullName };
  const list = (key: string) =>
    t(key, { ...values, returnObjects: true }) as string[];

  const sectionTitle =
    'text-kapwa-text-strong mb-4 flex items-center gap-2 text-2xl font-bold';
  const body = 'text-kapwa-text-support mb-4 leading-relaxed';
  const link =
    'text-kapwa-text-brand font-semibold underline underline-offset-2 hover:no-underline';

  return (
    <div className='bg-kapwa-bg-surface-raised min-h-screen'>
      <SEO
        title={t('seoTitle', values)}
        description={t('seoDescription', values)}
      />
      <div className='container mx-auto px-4 py-8 md:py-12'>
        <div className='bg-kapwa-bg-surface border-kapwa-border-weak mt-4 rounded-lg border p-6 shadow-xs md:p-8 md:py-16'>
          <div className='mx-auto max-w-3xl'>
            <h1 className='text-kapwa-text-strong kapwa-heading-xl mb-6 font-extrabold'>
              {t('title', values)}
            </h1>
            <p className='text-kapwa-text-strong mb-4 text-lg leading-relaxed'>
              {t('intro', values)}
            </p>
            <p className='border-kapwa-border-brand bg-kapwa-bg-surface-raised text-kapwa-text-support mb-10 rounded-r-lg border-l-4 p-4 leading-relaxed'>
              {t('notOfficial', values)}
            </p>

            <section className='mb-10'>
              <h2 className={sectionTitle}>
                <LayersIcon
                  aria-hidden='true'
                  className='text-kapwa-text-brand h-6 w-6'
                />
                {t('coverage.title')}
              </h2>
              <ul className='text-kapwa-text-support list-disc space-y-2 pl-6'>
                {list('coverage.items').map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className='mb-10'>
              <h2 className={sectionTitle}>
                <FileCheckIcon
                  aria-hidden='true'
                  className='text-kapwa-text-brand h-6 w-6'
                />
                {t('sources.title')}
              </h2>
              <ul className='text-kapwa-text-support mb-4 list-disc space-y-2 pl-6'>
                {list('sources.items').map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <a
                href={`${config.portal.githubUrl}${VERIFICATION_GUIDE_PATH}`}
                target='_blank'
                rel='noopener noreferrer'
                className={link}
              >
                {t('sources.guideLink')}
              </a>
            </section>

            <section className='mb-10'>
              <h2 className={sectionTitle}>
                <CodeIcon
                  aria-hidden='true'
                  className='text-kapwa-text-brand h-6 w-6'
                />
                {t('origin.title')}
              </h2>
              <p className={body}>{t('origin.body', values)}</p>
              <a
                href={config.portal.githubUrl}
                target='_blank'
                rel='noopener noreferrer'
                className={link}
              >
                {t('origin.codeLink')}
              </a>
            </section>

            <section className='mb-10'>
              <h2 className={sectionTitle}>
                <ScaleIcon
                  aria-hidden='true'
                  className='text-kapwa-text-brand h-6 w-6'
                />
                {t('license.title')}
              </h2>
              <p className={body}>
                {t('license.description', values)}{' '}
                <a
                  href='https://creativecommons.org/publicdomain/zero/1.0/'
                  target='_blank'
                  rel='noopener noreferrer'
                  className={link}
                >
                  {t('license.ccLink')}
                </a>{' '}
                {t('license.explanation')}
              </p>
            </section>

            <section className='bg-kapwa-bg-surface-raised border-kapwa-border-weak rounded-lg border p-6'>
              <h2 className={sectionTitle}>
                <FlagIcon
                  aria-hidden='true'
                  className='text-kapwa-text-brand h-6 w-6'
                />
                {t('cta.title')}
              </h2>
              <p className={body}>{t('cta.body')}</p>
              <div className='flex flex-wrap gap-3'>
                <Link
                  to='/report-an-error'
                  className='bg-kapwa-bg-brand-default text-kapwa-text-inverse inline-flex min-h-11 items-center rounded-lg px-5 py-2.5 font-semibold hover:opacity-90'
                >
                  {t('cta.report')}
                </Link>
                <Link
                  to='/join-us'
                  className='border-kapwa-border-brand text-kapwa-text-brand inline-flex min-h-11 items-center rounded-lg border px-5 py-2.5 font-semibold hover:bg-kapwa-bg-surface'
                >
                  {t('cta.help')}
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
