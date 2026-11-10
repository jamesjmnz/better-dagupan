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

import { SEO } from '@/components/layout/SEO';
import { config } from '@/lib/lguConfig';
import { lguLabels } from '@/lib/lguLabels';

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
  const sitemapSections: SitemapSection[] = [
    {
      title: 'Main Pages',
      icon: <Home className='w-5 h-5' />,
      links: [
        { title: 'Home', url: '/', description: 'Main landing page' },
        {
          title: 'About',
          url: '/about',
          description: `About ${config.portal.name}`,
        },
        {
          title: 'Search',
          url: '/search',
          description: 'Search the portal',
        },
        {
          title: 'Contact',
          url: '/contact',
          description: 'Ways to reach the project volunteers',
        },
        {
          title: 'Accessibility',
          url: '/accessibility',
          description: 'Accessibility statement and features',
        },
        {
          title: 'Terms of Service',
          url: '/terms-of-service',
          description: 'Terms for using this portal',
        },
      ],
    },
    {
      title: 'Services',
      icon: <Briefcase className='w-5 h-5' />,
      links: [
        {
          title: 'Public Services',
          url: '/services',
          description: `Services offered by the ${lguLabels.fullName}`,
        },
      ],
    },
    {
      title: 'Government',
      icon: <Building2 className='w-5 h-5' />,
      links: [
        {
          title: 'Elected Officials',
          url: '/government/elected-officials',
          description: `The ${lguLabels.head}, Vice ${lguLabels.head} and ${lguLabels.body}`,
        },
        {
          title: 'Committees',
          url: '/government/elected-officials/committees',
          description: `Standing committees of the ${lguLabels.body}`,
        },
        {
          title: 'Departments',
          url: '/government/departments',
          description: `Offices of the ${lguLabels.fullName}`,
        },
        {
          title: lguLabels.subdivisions,
          url: '/government/barangays',
          description: `The barangays of ${lguLabels.name}`,
        },
      ],
    },
    ...(config.features.statistics
      ? [
          {
            title: 'Statistics',
            icon: <BarChart3 className='w-5 h-5' />,
            links: [
              {
                title: 'Overview',
                url: '/statistics',
                description: `Key figures about ${lguLabels.name}`,
              },
              {
                title: 'Population',
                url: '/statistics/population',
                description: 'Census population figures',
              },
              {
                title: 'Income',
                url: '/statistics/municipal-income',
                description: `${lguLabels.adjective} income figures`,
              },
              {
                title: 'Competitiveness',
                url: '/statistics/competitiveness',
                description: 'Cities and Municipalities Competitiveness Index',
              },
            ],
          },
        ]
      : []),
    ...(config.features.transparency
      ? [
          {
            title: 'Transparency',
            icon: <FileCheck className='w-5 h-5' />,
            links: [
              {
                title: 'Overview',
                url: '/transparency',
                description: 'Public funds, works and procurement',
              },
              {
                title: 'Public Funds',
                url: '/transparency/financial',
                description: 'Income and expenditure',
              },
              {
                title: 'Procurement',
                url: '/transparency/procurement',
                description: 'Bids and awarded contracts',
              },
              {
                title: 'Infrastructure Projects',
                url: '/transparency/infrastructure',
                description: 'DPWH projects in the city',
              },
            ],
          },
        ]
      : []),
    ...(config.features.openLGU
      ? [
          {
            title: 'Legislation',
            icon: <FileText className='w-5 h-5' />,
            links: [
              {
                title: 'Ordinances and Resolutions',
                url: '/openlgu',
                description: `Legislative records of the ${lguLabels.body}`,
              },
              {
                title: 'Terms',
                url: '/openlgu/terms',
                description: `Terms of the ${lguLabels.body}`,
              },
            ],
          },
        ]
      : []),
    {
      title: 'Data and Community',
      icon: <Globe className='w-5 h-5' />,
      links: [
        {
          title: 'Weather',
          url: '/data/weather',
          description: `Current weather in ${lguLabels.name}`,
        },
        {
          title: 'Exchange Rates',
          url: '/data/forex',
          description: 'Foreign exchange rates',
        },
        {
          title: 'Contribute',
          url: '/contribute',
          description: 'Help improve the data on this portal',
        },
        {
          title: 'Join Us',
          url: '/join-us',
          description: 'Volunteer with the project',
        },
        {
          title: 'Ideas',
          url: '/ideas',
          description: 'Suggest improvements',
        },
      ],
    },
  ];

  return (
    <div className='py-12 min-h-screen bg-kapwa-bg-surface-raised'>
      <SEO
        title='Sitemap'
        description='Complete sitemap — find all pages and services available on this portal.'
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
                Sitemap
              </h1>
              <p className='mt-2 text-kapwa-text-support'>
                A complete guide to all pages and services available on
                {config.portal.name}
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
                            <ChevronRight className='w-4 h-4 group-hover:text-kapwa-text-link text-kapwa-text-disabled' />
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
              Can&apos;t find what you&apos;re looking for? Try using our{' '}
              <Link
                to='/search'
                className='text-kapwa-text-brand hover:underline'
              >
                search feature
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SitemapPage;
