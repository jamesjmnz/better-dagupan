import { Link } from 'react-router-dom';

import { Button } from '@bettergov/kapwa/button';
import { AlertTriangleIcon, HomeIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { SEO } from '@/components/layout/SEO';

export default function NotFound() {
  const { t } = useTranslation('pages');
  return (
    <div className='min-h-screen bg-linear-to-br from-kapwa-brand-600 via-kapwa-brand-700 to-kapwa-brand-800'>
      <SEO
        title={t('notFound.seoTitle')}
        description={t('notFound.seoDescription')}
        keywords={['Not Found', '404', 'Page Not Found']}
        noIndex
      />

      <div className='relative'>
        <div className='relative mx-auto max-w-6xl px-4 pt-16 pb-10 sm:px-6 lg:px-8'>
          {/* 404 Section */}
          <div className='mb-16 text-center'>
            <div className='bg-kapwa-bg-surface/20 mb-8 inline-flex h-24 w-24 items-center justify-center rounded-full backdrop-blur-sm'>
              <AlertTriangleIcon className='text-kapwa-text-inverse h-12 w-12' />
            </div>
            <h1 className='text-kapwa-text-inverse mb-4 text-6xl font-bold tracking-tight md:text-8xl'>
              404
            </h1>
            <div className='mb-8 space-y-4'>
              <h2 className='text-kapwa-text-inverse kapwa-heading-lg font-semibold'>
                {t('notFound.title')}
              </h2>
              <p className='mx-auto max-w-2xl text-lg leading-relaxed text-kapwa-text-inverse/80'>
                {t('notFound.body')}
              </p>
            </div>
            {/* Actions */}
            <div className='flex flex-col items-center justify-center gap-4 sm:flex-row'>
              <Link to='/'>
                <Button
                  size='lg'
                  className='text-kapwa-text-info hover:bg-kapwa-bg-info-weak bg-kapwa-bg-surface px-8 font-semibold'
                >
                  <HomeIcon className='mr-2 h-5 w-5' />
                  {t('notFound.home')}
                </Button>
              </Link>
              <Button
                variant='outline'
                size='lg'
                className='text-kapwa-text-inverse hover:bg-kapwa-bg-surface/10 border-white px-8'
                onClick={() => window.history.back()}
              >
                {t('notFound.back')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
