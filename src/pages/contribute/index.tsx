import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';

import {
  Breadcrumb,
  BreadcrumbHome,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/navigation/Breadcrumb';
import { ModuleHeader } from '@/components/layout/PageLayouts';
import { config } from '@/lib/lguConfig';

const GITHUB_ISSUE_URL = `${config.portal.githubUrl}/issues/new?template=contribution.yml`;

export default function ContributePage() {
  const { t } = useTranslation('pages');
  const steps = t('contribute.steps', { returnObjects: true }) as string[];
  const whatList = t('contribute.whatList', {
    returnObjects: true,
  }) as string[];

  return (
    <div className='animate-in fade-in mx-auto max-w-4xl space-y-8 px-4 pb-20 duration-500 md:px-0'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbHome href='/' />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{t('contribute.breadcrumb')}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <ModuleHeader
        as='h1'
        title={t('contribute.title', { portal: config.portal.name })}
        description={t('contribute.description')}
      />

      <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
        <div className='space-y-6'>
          <div className='space-y-3'>
            <h3 className='text-kapwa-text-strong text-lg font-bold'>
              {t('contribute.howTitle')}
            </h3>
            <ol className='text-kapwa-text-support space-y-3 text-sm leading-relaxed'>
              {steps.map((step, index) => (
                <li key={index} className='flex gap-3'>
                  <span className='bg-kapwa-bg-brand-default text-kapwa-text-inverse flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold'>
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <a
            href={GITHUB_ISSUE_URL}
            target='_blank'
            rel='noopener noreferrer'
            className='bg-kapwa-bg-brand-default hover:bg-kapwa-bg-brand-hover text-kapwa-text-inverse flex min-h-[48px] items-center justify-center gap-2 rounded-2xl px-8 py-4 font-bold shadow-xl transition-all'
          >
            {t('contribute.openForm')} <ExternalLink className='h-4 w-4' />
          </a>

          <div className='flex gap-4 rounded-2xl border border-kapwa-border-weak bg-kapwa-bg-surface p-5'>
            <p className='text-kapwa-text-support text-xs leading-relaxed'>
              <Trans
                t={t}
                i18nKey='contribute.whyGithub'
                components={{ strong: <strong /> }}
              />
            </p>
          </div>
        </div>

        <aside className='space-y-6'>
          <div className='space-y-3'>
            <h3 className='text-kapwa-text-strong text-lg font-bold'>
              {t('contribute.whatTitle')}
            </h3>
            <ul className='text-kapwa-text-support space-y-2 text-sm'>
              {whatList.map((item, index) => (
                <li key={index} className='flex gap-2'>
                  <span className='text-kapwa-text-success'>&#10003;</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className='flex gap-4 rounded-2xl border border-kapwa-border-warning bg-kapwa-bg-warning-weak p-5'>
            <p className='text-xs leading-relaxed text-kapwa-orange-800'>
              <Trans
                t={t}
                i18nKey='contribute.note'
                components={{ strong: <strong /> }}
              />
            </p>
          </div>

          <Link
            to='/services'
            className='text-kapwa-text-brand hover:text-kapwa-text-brand-bold flex items-center gap-1 text-sm font-bold transition-colors'
          >
            {t('contribute.back')}
          </Link>
        </aside>
      </div>
    </div>
  );
}
