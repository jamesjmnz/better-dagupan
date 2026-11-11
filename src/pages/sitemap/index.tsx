import { FC, ReactNode } from 'react';

import { Link } from 'react-router-dom';

import {
  BarChart3,
  Briefcase,
  Building2,
  ChevronRight,
  FileCheck,
  FileText,
  Globe,
  Home,
} from 'lucide-react';

import { Trans, useTranslation } from 'react-i18next';

import { SEO } from '@/components/layout/SEO';
import { config } from '@/lib/lguConfig';
import { lguLabels } from '@/lib/lguLabels';
import { useLguTerms } from '@/lib/useLguTerms';

interface SitemapSection {
  title: string;
  icon: ReactNode;
  links: {
    title: string;
    url: string;
    description?: string;
  }[];
}

const SitemapPage: FC = () => {
  const { t } = useTranslation('pages');
  const terms = useLguTerms();
  const link = (key: string) => ({
    title: t(`sitemap.links.${key}.title`),
    description: t(`sitemap.links.${key}.description`, terms),
  });
  const sitemapSections: SitemapSection[] = [
    {
      title: t('sitemap.sections.main'),
      icon: <Home className='w-5 h-5' />,
      links: [
        { ...link('home'), url: '/' },
        { ...link('about'), url: '/about' },
        { ...link('search'), url: '/search' },
        { ...link('contact'), url: '/contact' },
        { ...link('accessibility'), url: '/accessibility' },
        { ...link('terms'), url: '/terms-of-service' },
      ],
    },
    {
      title: t('sitemap.sections.services'),
      icon: <Briefcase className='w-5 h-5' />,
      links: [{ ...link('services'), url: '/services' }],
    },
    {
      title: t('sitemap.sections.government'),
      icon: <Building2 className='w-5 h-5' />,
      links: [
        { ...link('officials'), url: '/government/elected-officials' },
        {
          ...link('committees'),
          url: '/government/elected-officials/committees',
        },
        { ...link('departments'), url: '/government/departments' },
        {
          title: t('sitemap.subdivisions', { context: config.lgu.type }),
          url: '/government/barangays',
          description: t('sitemap.links.barangays.description', terms),
        },
      ],
    },
    ...(config.features.statistics
      ? [
          {
            title: t('sitemap.sections.statistics'),
            icon: <BarChart3 className='w-5 h-5' />,
            links: [
              { ...link('statsOverview'), url: '/statistics' },
              { ...link('population'), url: '/statistics/population' },
              { ...link('income'), url: '/statistics/municipal-income' },
              {
                ...link('competitiveness'),
                url: '/statistics/competitiveness',
              },
            ],
          },
        ]
      : []),
    ...(config.features.transparency
      ? [
          {
            title: t('sitemap.sections.transparency'),
            icon: <FileCheck className='w-5 h-5' />,
            links: [
              { ...link('transparencyOverview'), url: '/transparency' },
              { ...link('funds'), url: '/transparency/financial' },
              { ...link('procurement'), url: '/transparency/procurement' },
              {
                ...link('infrastructure'),
                url: '/transparency/infrastructure',
              },
            ],
          },
        ]
      : []),
    ...(config.features.openLGU
      ? [
          {
            title: t('sitemap.sections.legislation'),
            icon: <FileText className='w-5 h-5' />,
            links: [
              { ...link('legislation'), url: '/openlgu' },
              { ...link('openlguTerms'), url: '/openlgu/terms' },
            ],
          },
        ]
      : []),
    {
      title: t('sitemap.sections.community'),
      icon: <Globe className='w-5 h-5' />,
      links: [
        { ...link('weather'), url: '/data/weather' },
        { ...link('forex'), url: '/data/forex' },
        { ...link('reportError'), url: '/report-an-error' },
        { ...link('contribute'), url: '/contribute' },
        { ...link('joinUs'), url: '/join-us' },
        { ...link('ideas'), url: '/ideas' },
      ],
    },
  ];

  return (
    <div className='py-12 min-h-screen bg-kapwa-bg-surface-raised'>
      <SEO
        title={t('sitemap.seoTitle')}
        description={t('sitemap.seoDescription')}
        keywords={[
          'sitemap',
          'navigation',
          'government services',
          lguLabels.fullName,
          'website map',
        ]}
      />

      <div className='container mx-auto px-4 py-8 md:py-12'>
        <div className='mx-auto max-w-5xl'>
          <div className='overflow-hidden rounded-xl bg-kapwa-bg-surface shadow-xs'>
            <div className='p-6 border-b border-kapwa-border-weak md:p-8'>
              <h1 className='text-kapwa-text-strong kapwa-heading-xl font-extrabold'>
                {t('sitemap.title')}
              </h1>
              <p className='mt-2 text-kapwa-text-support'>
                {t('sitemap.intro', { portal: config.portal.name })}
              </p>
            </div>

            <div className='p-6 md:p-8'>
              <div className='space-y-12'>
                {sitemapSections.map((section, index) => (
                  <div key={index}>
                    <div className='flex items-center mb-4'>
                      <div className='p-2 mr-3 rounded-md bg-kapwa-bg-surface text-kapwa-text-brand'>
                        {section.icon}
                      </div>
                      <h2 className='text-xl font-bold text-kapwa-text-strong'>
                        {section.title}
                      </h2>
                    </div>

                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                      {section.links.map((link, linkIndex) => (
                        <Link
                          key={linkIndex}
                          to={link.url}
                          className='flex flex-col p-4 rounded-lg border transition-colors group hover:border-kapwa-border-brand hover:bg-kapwa-bg-surface-brand border-kapwa-border-weak'
                        >
                          <div className='flex justify-between items-center mb-2'>
                            <h3 className='font-medium group-hover:text-kapwa-text-brand text-kapwa-text-strong'>
                              {link.title}
                            </h3>
                            <ChevronRight className='w-4 h-4 group-hover:text-kapwa-text-link text-kapwa-text-support' />
                          </div>
                          {link.description && (
                            <p className='text-sm text-kapwa-text-support'>
                              {link.description}
                            </p>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className='mt-8 text-sm text-center text-kapwa-text-support'>
            <p>
              <Trans
                t={t}
                i18nKey='sitemap.notFound'
                components={{
                  anchor: (
                    <Link
                      to='/search'
                      className='text-kapwa-text-brand underline underline-offset-2 hover:no-underline'
                    />
                  ),
                }}
              />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SitemapPage;
