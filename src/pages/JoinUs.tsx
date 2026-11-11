import { FC } from 'react';

import { Link } from 'react-router-dom';

import {
  ArrowRightIcon,
  CodeIcon,
  FlagIcon,
  LanguagesIcon,
  LinkIcon,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { SEO } from '@/components/layout/SEO';
import { config } from '@/lib/lguConfig';

interface Way {
  key: 'report' | 'sources' | 'translate' | 'code';
  icon: LucideIcon;
  href: string;
}

const JoinUs: FC = () => {
  const { t } = useTranslation('pages');
  const values = { portal: config.portal.name, lgu: config.lgu.fullName };
  const issues = `${config.portal.githubUrl}/issues`;

  const ways: Way[] = [
    { key: 'report', icon: FlagIcon, href: '/report-an-error' },
    { key: 'sources', icon: LinkIcon, href: issues },
    { key: 'translate', icon: LanguagesIcon, href: issues },
    { key: 'code', icon: CodeIcon, href: config.portal.githubUrl },
  ];

  return (
    <div className='bg-kapwa-bg-surface-raised min-h-screen'>
      <SEO
        title={t('joinUs.seoTitle')}
        description={t('joinUs.seoDescription', values)}
      />
      <div className='container mx-auto px-4 py-8 md:py-12'>
        <div className='bg-kapwa-bg-surface border-kapwa-border-weak mt-4 rounded-lg border p-6 shadow-xs md:p-8 md:py-16'>
          <div className='mx-auto max-w-3xl text-center'>
            <h1 className='text-kapwa-text-strong kapwa-heading-xl mb-4 font-extrabold'>
              {t('joinUs.title', values)}
            </h1>
            <p className='text-kapwa-text-support text-lg leading-relaxed'>
              {t('joinUs.intro', values)}
            </p>
          </div>
        </div>

        <ul className='mt-8 grid grid-cols-1 gap-6 md:grid-cols-2'>
          {ways.map(way => {
            const external = way.href.startsWith('http');
            const className =
              'text-kapwa-text-brand mt-4 inline-flex min-h-11 items-center gap-2 font-semibold underline underline-offset-2 hover:no-underline';
            const label = (
              <>
                {t(`joinUs.ways.${way.key}.action`)}
                <ArrowRightIcon aria-hidden='true' className='h-4 w-4' />
              </>
            );
            return (
              <li
                key={way.key}
                className='bg-kapwa-bg-surface border-kapwa-border-weak flex flex-col rounded-lg border p-6 shadow-xs'
              >
                <div className='bg-kapwa-bg-brand-weak text-kapwa-text-brand mb-4 w-fit rounded-lg p-3'>
                  <way.icon aria-hidden='true' className='h-6 w-6' />
                </div>
                <h2 className='text-kapwa-text-strong mb-2 text-lg font-semibold'>
                  {t(`joinUs.ways.${way.key}.title`)}
                </h2>
                <p className='text-kapwa-text-support flex-1 text-sm leading-relaxed'>
                  {t(`joinUs.ways.${way.key}.description`, values)}
                </p>
                {external ? (
                  <a
                    href={way.href}
                    target='_blank'
                    rel='noopener noreferrer'
                    className={className}
                  >
                    {label}
                  </a>
                ) : (
                  <Link to={way.href} className={className}>
                    {label}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>

        <div className='bg-kapwa-bg-surface border-kapwa-border-weak mt-8 rounded-lg border p-6 text-center shadow-xs'>
          <p className='text-kapwa-text-support mb-4'>
            {t('joinUs.ideasBody')}
          </p>
          <Link
            to='/ideas'
            className='bg-kapwa-bg-brand-default text-kapwa-text-inverse inline-flex min-h-11 items-center gap-2 rounded-lg px-5 py-2.5 font-semibold hover:opacity-90'
          >
            {t('joinUs.ideasAction')}
            <ArrowRightIcon aria-hidden='true' className='h-4 w-4' />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JoinUs;
