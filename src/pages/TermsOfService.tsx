import { FC } from 'react';

import {
  AlertTriangle,
  ExternalLink,
  FileText,
  Mail,
  Scale,
  Shield,
} from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';

import { config } from '@/lib/lguConfig';
import { SEO } from '@/components/layout/SEO';

const TermsOfService: FC = () => {
  const { t, i18n } = useTranslation('pages');
  const list = (key: string) =>
    t(`terms.${key}`, { returnObjects: true }) as string[];
  const publicDomain = list('publicDomain');
  const currentDate = new Date().toLocaleDateString(i18n.language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className='bg-kapwa-bg-surface-raised min-h-screen'>
      <SEO
        title={t('terms.seoTitle')}
        description={t('terms.seoDescription')}
      />

      {/* Header Section */}
      <section className='from-kapwa-brand-600 text-kapwa-text-inverse bg-linear-to-r to-kapwa-blue-700 py-16'>
        <div className='container mx-auto px-4'>
          <div className='mx-auto max-w-4xl text-center'>
            <div className='mb-6 flex justify-center'>
              <div className='bg-kapwa-bg-surface/20 rounded-full p-4 backdrop-blur-sm'>
                <Scale className='text-kapwa-text-inverse h-12 w-12' />
              </div>
            </div>
            <h1 className='text-kapwa-text-strong kapwa-heading-xl font-extrabold'>
              {t('terms.title')}
            </h1>
            <p className='text-xl opacity-90'>
              {t('terms.lastUpdated', { date: currentDate })}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className='container mx-auto max-w-4xl px-4 py-12'>
        <div className='bg-kapwa-bg-surface space-y-8 rounded-lg p-8 shadow-lg'>
          {/* Acceptance of Terms */}
          <section>
            <div className='mb-4 flex items-center gap-3'>
              <FileText className='text-kapwa-text-brand h-6 w-6' />
              <h2 className='text-kapwa-text-strong kapwa-heading-lg font-bold'>
                {t('terms.acceptanceTitle')}
              </h2>
            </div>
            <p className='text-kapwa-text-support leading-relaxed'>
              {t('terms.acceptance')}
            </p>
          </section>

          {/* Public Domain Content */}
          <section>
            <div className='mb-4 flex items-center gap-3'>
              <Shield className='text-kapwa-text-brand h-6 w-6' />
              <h2 className='text-kapwa-text-strong kapwa-heading-lg font-bold'>
                {t('terms.publicDomainTitle')}
              </h2>
            </div>
            <div className='text-kapwa-text-support space-y-4 leading-relaxed'>
              {publicDomain.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </section>

          {/* "AS IS" Disclaimer */}
          <section>
            <div className='mb-4 flex items-center gap-3'>
              <AlertTriangle className='h-6 w-6 text-kapwa-text-warning' />
              <h2 className='text-kapwa-text-strong kapwa-heading-lg font-bold'>
                {t('terms.asIsTitle')}
              </h2>
            </div>
            <div className='mb-4 border-l-4 border-kapwa-border-warning bg-kapwa-bg-warning-weak p-4'>
              <p className='mb-2 font-semibold text-kapwa-text-warning'>
                {t('terms.asIsLead')}
              </p>
              <ul className='list-inside list-disc space-y-1 text-kapwa-text-warning'>
                {list('asIsList').map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className='text-kapwa-text-strong mb-4 kapwa-heading-lg font-bold'>
              {t('terms.liabilityTitle')}
            </h2>
            <div className='text-kapwa-text-support space-y-4 leading-relaxed'>
              <p>{t('terms.liabilityLead')}</p>
              <ul className='ml-4 list-inside list-disc space-y-1'>
                {list('liabilityList').map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p>{t('terms.liabilityScope')}</p>
            </div>
          </section>

          {/* User Responsibilities */}
          <section>
            <h2 className='text-kapwa-text-strong mb-4 kapwa-heading-lg font-bold'>
              {t('terms.responsibilitiesTitle')}
            </h2>
            <div className='text-kapwa-text-support space-y-4 leading-relaxed'>
              <p className='font-semibold'>{t('terms.responsibilitiesLead')}</p>
              <ul className='ml-4 list-inside list-disc space-y-1'>
                {list('responsibilitiesList').map((_, index) => (
                  <li key={index}>
                    <Trans
                      t={t}
                      i18nKey={`terms.responsibilitiesList.${index}`}
                      components={{ strong: <strong /> }}
                    />
                  </li>
                ))}
              </ul>

              <div className='bg-kapwa-bg-info-weak mt-4 border-l-4 border-kapwa-border-info p-4'>
                <p className='mb-2 font-semibold text-kapwa-text-info'>
                  {t('terms.encourageLead')}
                </p>
                <ul className='text-kapwa-text-info list-inside list-disc space-y-1'>
                  {list('encourageList').map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* No Professional Advice */}
          <section>
            <h2 className='text-kapwa-text-strong mb-4 kapwa-heading-lg font-bold'>
              {t('terms.adviceTitle')}
            </h2>
            <p className='text-kapwa-text-support leading-relaxed'>
              {t('terms.advice')}
            </p>
          </section>

          {/* Source Links */}
          <section>
            <div className='mb-4 flex items-center gap-3'>
              <ExternalLink className='text-kapwa-text-brand h-6 w-6' />
              <h2 className='text-kapwa-text-strong kapwa-heading-lg font-bold'>
                {t('terms.sourcesTitle')}
              </h2>
            </div>
            <div className='text-kapwa-text-support space-y-4 leading-relaxed'>
              <p>{t('terms.sourcesLead')}</p>
              <ul className='ml-4 list-inside list-disc space-y-1'>
                {list('sourcesList').map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p>{t('terms.sourcesNote')}</p>
            </div>
          </section>

          {/* Website Availability */}
          <section>
            <h2 className='text-kapwa-text-strong mb-4 kapwa-heading-lg font-bold'>
              {t('terms.availabilityTitle')}
            </h2>
            <div className='text-kapwa-text-support space-y-4 leading-relaxed'>
              <p>{t('terms.availabilityLead')}</p>
              <ul className='ml-4 list-inside list-disc space-y-1'>
                {list('availabilityList').map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* Indemnification */}
          <section>
            <h2 className='text-kapwa-text-strong mb-4 kapwa-heading-lg font-bold'>
              {t('terms.indemnificationTitle')}
            </h2>
            <p className='text-kapwa-text-support leading-relaxed'>
              {t('terms.indemnification')}
            </p>
          </section>

          {/* Modifications */}
          <section>
            <h2 className='text-kapwa-text-strong mb-4 kapwa-heading-lg font-bold'>
              {t('terms.modificationsTitle')}
            </h2>
            <p className='text-kapwa-text-support leading-relaxed'>
              {t('terms.modifications')}
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className='text-kapwa-text-strong mb-4 kapwa-heading-lg font-bold'>
              {t('terms.lawTitle')}
            </h2>
            <p className='text-kapwa-text-support leading-relaxed'>
              {t('terms.law')}
            </p>
          </section>

          {/* Severability */}
          <section>
            <h2 className='text-kapwa-text-strong mb-4 kapwa-heading-lg font-bold'>
              {t('terms.severabilityTitle')}
            </h2>
            <p className='text-kapwa-text-support leading-relaxed'>
              {t('terms.severability')}
            </p>
          </section>

          {/* Content Concerns */}
          <section>
            <h2 className='text-kapwa-text-strong mb-4 kapwa-heading-lg font-bold'>
              {t('terms.concernsTitle')}
            </h2>
            <div className='text-kapwa-text-support space-y-4 leading-relaxed'>
              <p>{t('terms.concernsLead')}</p>

              <div className='border-kapwa-border-weak bg-kapwa-bg-surface-raised rounded-lg border p-4'>
                <h3 className='text-kapwa-text-strong mb-2 font-semibold'>
                  {t('terms.reportingTitle')}
                </h3>
                <p className='mb-2'>{t('terms.reportingLead')}</p>
                <ul className='mb-4 ml-4 list-inside list-disc space-y-1'>
                  {list('reportingList').map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>

                <div className='mb-2 flex items-center gap-2'>
                  <Mail className='text-kapwa-text-brand h-5 w-5' />
                  <p className='font-semibold'>
                    {t('terms.contactUs')}{' '}
                    <a
                      href={`mailto:${config.portal.contactEmail}`}
                      className='text-kapwa-text-brand hover:text-kapwa-text-brand'
                    >
                      {config.portal.contactEmail}
                    </a>
                  </p>
                </div>

                <p className='mb-2'>{t('terms.includeLead')}</p>
                <ul className='ml-4 list-inside list-disc space-y-1'>
                  {list('includeList').map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className='bg-kapwa-bg-success-weak rounded-lg border border-kapwa-border-success p-4'>
                <h3 className='mb-2 font-semibold text-kapwa-text-success'>
                  {t('terms.responseTitle')}
                </h3>
                <ul className='list-inside list-disc space-y-1 text-kapwa-text-success'>
                  {list('responseList').map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className='bg-kapwa-bg-danger-weak rounded-lg border border-kapwa-border-danger p-4'>
                <p className='text-kapwa-text-danger'>
                  <Trans
                    t={t}
                    i18nKey='terms.frivolous'
                    components={{ strong: <strong /> }}
                  />
                </p>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section className='border-t pt-8'>
            <div className='mb-4 flex items-center gap-3'>
              <Mail className='text-kapwa-text-brand h-6 w-6' />
              <h2 className='text-kapwa-text-strong kapwa-heading-lg font-bold'>
                {t('terms.contactTitle')}
              </h2>
            </div>
            <div className='bg-kapwa-bg-surface border-kapwa-border-brand rounded-lg border p-6'>
              <p className='text-kapwa-text-brand-bold mb-2'>
                {t('terms.contactLead')}
              </p>
              <p className='text-kapwa-text-brand-bold text-xl font-semibold'>
                <a
                  href='mailto:volunteers@bettergov.ph'
                  className='hover:text-kapwa-text-brand transition-colors'
                >
                  volunteers@bettergov.ph
                </a>
              </p>
              <p className='text-kapwa-text-brand-bold mt-4 italic'>
                {t('terms.educational')}
              </p>
            </div>
            <div>
              <p className='text-kapwa-text-strong mt-4 font-semibold'>
                {t('terms.effective')}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
