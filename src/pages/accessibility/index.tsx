import { FC } from 'react';

import {
  AlertCircleIcon,
  CheckCircleIcon,
  EyeIcon,
  GlobeIcon,
  InfoIcon,
  KeyboardIcon,
  MailIcon,
  MousePointerIcon,
  SmartphoneIcon,
  Volume2Icon,
} from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';

import {
  PageHeader,
  SectionAlternator,
  SectionBlock,
} from '@/components/layout';
import { SEO } from '@/components/layout/SEO';
import { config } from '@/lib/lguConfig';
import { useLguTerms } from '@/lib/useLguTerms';

const AccessibilityPage: FC = () => {
  const { t } = useTranslation('pages');
  const terms = useLguTerms();
  const commitment = t('accessibility.commitment', {
    returnObjects: true,
  }) as string[];
  const accessibilityFeatures = [
    {
      icon: <EyeIcon className='h-6 w-6' />,
      title: t('accessibility.features.visual.title'),
      features: t('accessibility.features.visual.items', {
        returnObjects: true,
      }) as string[],
    },
    {
      icon: <KeyboardIcon className='h-6 w-6' />,
      title: t('accessibility.features.keyboard.title'),
      features: t('accessibility.features.keyboard.items', {
        returnObjects: true,
      }) as string[],
    },
    {
      icon: <Volume2Icon className='h-6 w-6' />,
      title: t('accessibility.features.audio.title'),
      features: t('accessibility.features.audio.items', {
        returnObjects: true,
      }) as string[],
    },
    {
      icon: <MousePointerIcon className='h-6 w-6' />,
      title: t('accessibility.features.motor.title'),
      features: t('accessibility.features.motor.items', {
        returnObjects: true,
      }) as string[],
    },
    {
      icon: <SmartphoneIcon className='h-6 w-6' />,
      title: t('accessibility.features.mobile.title'),
      features: t('accessibility.features.mobile.items', {
        returnObjects: true,
      }) as string[],
    },
    {
      icon: <GlobeIcon className='h-6 w-6' />,
      title: t('accessibility.features.language.title'),
      features: t('accessibility.features.language.items', {
        returnObjects: true,
      }) as string[],
    },
  ];

  const wcagCompliance = [
    {
      level: 'WCAG 2.1 Level AA',
      status: 'in-progress',
      description: t('accessibility.standards.wcag'),
    },
    {
      level: 'Section 508',
      status: 'in-progress',
      description: t('accessibility.standards.section508'),
    },
    {
      level: 'EN 301 549',
      status: 'not-evaluated',
      description: t('accessibility.standards.en301549'),
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircleIcon className='text-kapwa-text-success h-5 w-5' />;
      case 'in-progress':
      case 'partial':
        return <AlertCircleIcon className='text-kapwa-text-warning h-5 w-5' />;
      default:
        return <InfoIcon className='text-kapwa-text-brand h-5 w-5' />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-kapwa-bg-success-weak border-kapwa-border-success';
      case 'in-progress':
      case 'partial':
        return 'bg-kapwa-bg-warning-weak border-kapwa-border-warning';
      default:
        return 'bg-kapwa-bg-info-weak border-kapwa-border-info';
    }
  };

  return (
    <div className='min-h-screen'>
      <SEO
        title={t('accessibility.seoTitle')}
        description={t('accessibility.seoDescription')}
        keywords={[
          'accessibility',
          'WCAG',
          'screen reader',
          'keyboard navigation',
          'inclusive design',
          'disability support',
        ]}
      />

      <PageHeader
        variant='centered'
        title={t('accessibility.title')}
        description={t('accessibility.description', terms)}
        autoBreadcrumbs={true}
      />

      <SectionAlternator>
        <SectionBlock
          title={t('accessibility.commitmentTitle')}
          icon={CheckCircleIcon}
        >
          <div className='mx-auto max-w-4xl space-y-4'>
            {commitment.map((paragraph, index) => (
              <p key={index} className='text-kapwa-text-support text-lg'>
                {paragraph}
              </p>
            ))}
          </div>
        </SectionBlock>

        <SectionBlock title={t('accessibility.worksTitle')} icon={EyeIcon}>
          <div className='mx-auto max-w-4xl grid grid-cols-1 gap-6 md:grid-cols-2'>
            {accessibilityFeatures.map((feature, index) => (
              <div
                key={index}
                className='border-kapwa-border-weak bg-kapwa-bg-surface rounded-lg border p-6'
              >
                <div className='mb-4 flex items-center'>
                  <div className='bg-kapwa-bg-surface-raised text-kapwa-text-brand mr-3 rounded-md p-2'>
                    {feature.icon}
                  </div>
                  <h3 className='text-kapwa-text-strong text-lg font-semibold'>
                    {feature.title}
                  </h3>
                </div>
                <ul className='space-y-2'>
                  {feature.features.map((item, itemIndex) => (
                    <li key={itemIndex} className='flex items-start'>
                      <CheckCircleIcon className='text-kapwa-text-success mt-0.5 mr-2 h-4 w-4 flex-shrink-0' />
                      <span className='text-kapwa-text-support text-sm'>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </SectionBlock>

        <SectionBlock title={t('accessibility.standardsTitle')} icon={InfoIcon}>
          <div className='mx-auto max-w-4xl space-y-4'>
            {wcagCompliance.map((standard, index) => (
              <div
                key={index}
                className={`rounded-lg border p-4 ${getStatusColor(
                  standard.status
                )}`}
              >
                <div className='mb-2 flex items-center'>
                  {getStatusIcon(standard.status)}
                  <h3 className='text-kapwa-text-strong ml-2 text-lg font-semibold'>
                    {standard.level}
                  </h3>
                </div>
                <p className='text-kapwa-text-support'>
                  {standard.description}
                </p>
              </div>
            ))}
          </div>
        </SectionBlock>

        <SectionBlock
          title={t('accessibility.keyboardTitle')}
          icon={KeyboardIcon}
        >
          <div className='mx-auto max-w-4xl grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='space-y-3'>
              <div className='bg-kapwa-bg-surface-raised flex items-center justify-between rounded-lg p-3'>
                <span className='text-kapwa-text-strong font-medium'>
                  {t('accessibility.keys.skip')}
                </span>
                <kbd className='bg-kapwa-bg-active rounded-sm px-2 py-1 font-mono text-sm'>
                  {t('accessibility.keys.skipKey')}
                </kbd>
              </div>
              <div className='bg-kapwa-bg-surface-raised flex items-center justify-between rounded-lg p-3'>
                <span className='text-kapwa-text-strong font-medium'>
                  {t('accessibility.keys.move')}
                </span>
                <kbd className='bg-kapwa-bg-active rounded-sm px-2 py-1 font-mono text-sm'>
                  Tab / Shift+Tab
                </kbd>
              </div>
              <div className='bg-kapwa-bg-surface-raised flex items-center justify-between rounded-lg p-3'>
                <span className='text-kapwa-text-strong font-medium'>
                  {t('accessibility.keys.activate')}
                </span>
                <kbd className='bg-kapwa-bg-active rounded-sm px-2 py-1 font-mono text-sm'>
                  {t('accessibility.keys.activateKey')}
                </kbd>
              </div>
            </div>
            <div className='space-y-3'>
              <div className='bg-kapwa-bg-surface-raised flex items-center justify-between rounded-lg p-3'>
                <span className='text-kapwa-text-strong font-medium'>
                  {t('accessibility.keys.close')}
                </span>
                <kbd className='bg-kapwa-bg-active rounded-sm px-2 py-1 font-mono text-sm'>
                  {t('accessibility.keys.closeKey')}
                </kbd>
              </div>
              <div className='bg-kapwa-bg-surface-raised rounded-lg p-3'>
                <p className='text-kapwa-text-support text-sm'>
                  {t('accessibility.keys.noShortcut')}
                </p>
              </div>
            </div>
          </div>
        </SectionBlock>

        <SectionBlock title={t('accessibility.feedbackTitle')} icon={MailIcon}>
          <div className='mx-auto max-w-4xl'>
            <p className='text-kapwa-text-support mb-6 text-lg'>
              {t('accessibility.feedbackBody', terms)}
            </p>

            <div className='border-kapwa-border-weak bg-kapwa-bg-surface rounded-lg border p-6 max-w-lg'>
              <div className='mb-4 flex items-center'>
                <MailIcon className='text-kapwa-text-brand mr-3 h-6 w-6' />
                <h3 className='text-kapwa-text-strong text-lg font-semibold'>
                  {t('accessibility.emailTitle')}
                </h3>
              </div>
              <p className='text-kapwa-text-support mb-3'>
                {t('accessibility.emailBody')}
              </p>
              <a
                href={`mailto:${config.portal.contactEmail}`}
                className='text-kapwa-text-brand hover:text-kapwa-text-brand font-medium'
              >
                {config.portal.contactEmail}
              </a>
            </div>
          </div>
        </SectionBlock>

        <SectionBlock variant='default' className='!py-8'>
          <div className='mx-auto max-w-4xl text-center'>
            <p className='text-kapwa-text-support text-sm'>
              <Trans
                t={t}
                i18nKey='accessibility.lastUpdated'
                components={{ time: <time dateTime='2026-07-27' /> }}
              />
            </p>
            <p className='text-kapwa-text-support mt-2 text-sm'>
              {t('accessibility.revise')}
            </p>
          </div>
        </SectionBlock>
      </SectionAlternator>
    </div>
  );
};

export default AccessibilityPage;
