import { Link } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

import {
  ChevronRight,
  ExternalLink,
  FileText,
  HardHat,
  HeartHandshake,
  Landmark,
  Search,
  ShoppingBag,
  Users,
} from 'lucide-react';

import { DetailSection } from '@/components/layout';
import { config } from '@/lib/lguConfig';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardGrid } from '@/components/ui/Card';
import { useLguTerms } from '@/lib/useLguTerms';

export default function TransparencyIndex() {
  const { t } = useTranslation(['transparency', 'common']);
  const terms = useLguTerms();
  const disclaimer = { portal: config.portal.name, lgu: config.lgu.name };

  const sections = [
    {
      title: t('index.funds.title'),
      description: t('index.funds.description', terms),
      icon: Landmark,
      href: '/transparency/financial',
      color: 'blue',
      badge: t('index.funds.badge'),
    },
    {
      title: t('index.works.title'),
      description: t('index.works.description'),
      icon: HardHat,
      href: '/transparency/infrastructure',
      color: 'orange',
      badge: t('index.works.badge'),
    },
    {
      title: t('index.procurement.title'),
      description: t('index.procurement.description', terms),
      icon: ShoppingBag,
      href: '/transparency/procurement',
      color: 'blue',
      badge: t('index.procurement.badge'),
    },
  ];

  return (
    <div className='animate-in fade-in duration-500'>
      {/* 1. Grassroots Mission Box - Uses Brand Orange to signify "Community" */}
      <div className='mb-10'>
        <div className='bg-kapwa-orange-50 flex flex-col items-center gap-6 rounded-3xl border-0 p-6 shadow-sm md:flex-row'>
          <div className='text-kapwa-orange-600 bg-kapwa-bg-surface rounded-2xl p-4 shadow-md'>
            <HeartHandshake className='h-8 w-8' />
          </div>
          <div className='flex-1 space-y-2 text-center md:text-left'>
            <h3 className='text-[10px] font-bold tracking-widest text-kapwa-orange-800 uppercase'>
              {t('common:disclaimer.noticeTitle', disclaimer)}
            </h3>
            <p className='text-sm leading-relaxed text-kapwa-orange-800'>
              {t('common:disclaimer.noticeBody', disclaimer)}
            </p>
          </div>
        </div>
      </div>

      {/* 2. The Three Pillars of Oversight - Using CardGrid */}
      <CardGrid columns={3}>
        {sections.map(section => (
          <Link key={section.href} to={section.href} className='group'>
            <Card
              hover
              className='border-kapwa-border-weak flex h-full flex-col'
            >
              <CardContent className='flex h-full flex-col p-6'>
                <div className='mb-6 flex items-start justify-between'>
                  <div
                    className={`rounded-2xl p-3 shadow-sm transition-all ${
                      section.color === 'blue'
                        ? 'bg-kapwa-bg-surface text-kapwa-text-brand group-hover:bg-kapwa-bg-brand-default group-hover:text-kapwa-text-inverse'
                        : 'bg-kapwa-orange-50 text-kapwa-orange-600 group-hover:bg-kapwa-orange-100 group-hover:text-kapwa-text-inverse'
                    }`}
                  >
                    <section.icon className='h-6 w-6' />
                  </div>
                  <Badge
                    variant={section.color === 'blue' ? 'primary' : 'secondary'}
                    dot
                  >
                    {section.badge}
                  </Badge>
                </div>

                <div className='flex-1 space-y-2'>
                  <h4 className='group-hover:text-kapwa-text-brand text-kapwa-text-strong text-lg font-extrabold transition-colors'>
                    {section.title}
                  </h4>
                  <p className='text-kapwa-text-support text-xs leading-relaxed'>
                    {section.description}
                  </p>
                </div>

                <div className='mt-8 flex items-center justify-between border-t border-kapwa-border-weak pt-4 transition-transform group-hover:translate-x-1'>
                  <span className='text-kapwa-text-brand text-[10px] font-black tracking-widest uppercase'>
                    {t('index.analyze')}
                  </span>
                  <ChevronRight className='text-kapwa-text-support h-4 w-4' />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </CardGrid>

      {/* 3. Community Engagement Block */}
      <div className='mt-10 grid grid-cols-1 gap-8 md:grid-cols-2'>
        <DetailSection
          title={t('index.helpTitle')}
          icon={Search}
          className='bg-kapwa-bg-surface-raised border-kapwa-border-weak flex h-full flex-col'
        >
          <div className='flex h-full flex-col justify-between'>
            <p className='text-kapwa-text-support mb-6 text-sm leading-relaxed'>
              {t('index.helpBody')}
            </p>
            <a
              href={`${config.portal.githubUrl}/issues`}
              target='_blank'
              rel='noreferrer'
              className='text-kapwa-text-inverse bg-kapwa-brand-600 hover:bg-kapwa-brand-700 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-colors'
            >
              <Users className='h-4 w-4' /> {t('index.reportIssue')}
            </a>
          </div>
        </DetailSection>

        <DetailSection
          title={t('index.sourcesTitle')}
          icon={FileText}
          className='flex h-full flex-col'
        >
          <div className='flex h-full flex-col justify-between'>
            <p className='text-kapwa-text-support mb-6 text-[11px] font-medium italic'>
              {t('index.sourcesBody')}
            </p>
            <div className='flex flex-col gap-3'>
              <a
                href='https://transparency.bettergov.ph'
                target='_blank'
                rel='noreferrer'
                className='text-kapwa-text-inverse bg-kapwa-brand-600 hover:bg-kapwa-brand-700 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-colors'
              >
                {t('index.dashboard')} <ExternalLink className='h-3 w-3' />
              </a>
              <a
                href='https://data.bettergov.ph/'
                target='_blank'
                rel='noreferrer'
                className='text-kapwa-text-inverse bg-kapwa-brand-600 hover:bg-kapwa-brand-700 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-colors'
              >
                {t('index.dataPortal')} <ExternalLink className='h-3 w-3' />
              </a>
            </div>
          </div>
        </DetailSection>
      </div>
    </div>
  );
}
