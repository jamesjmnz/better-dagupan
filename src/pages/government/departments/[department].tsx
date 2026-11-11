import { Link, useParams } from 'react-router-dom';

import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  GlobeIcon,
  MailIcon,
  PhoneIcon,
  UserIcon,
} from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbHome,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/navigation/Breadcrumb';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';

import { useTranslation } from 'react-i18next';

import { NotVerified, SourceNote } from '@/components/civic';

import { toTitleCase } from '@/lib/stringUtils';
import { toTelUri } from '@/lib/utils';
import { lguLabels } from '@/lib/lguLabels';

import departmentsDataRaw from '@/data/directory/departments.json';

import type { Department } from '@/types/directoryTypes';

const departmentsData = departmentsDataRaw as Department[];
import mergedServicesRaw from '@/data/citizens-charter/merged-services.json';

import type { Service } from '@/types/servicesTypes';

const mergedServicesData = mergedServicesRaw as Service[];

export default function DepartmentDetail() {
  const { t } = useTranslation('common');
  const { department: slug } = useParams();

  // 1. Data Lookup
  const dept = departmentsData.find(d => d.slug === slug);

  // Filter services from merged-services.json
  const associatedServices = mergedServicesData.filter(s => {
    const officeSlug = s.officeSlug;
    const slugs = Array.isArray(officeSlug)
      ? officeSlug
      : officeSlug
        ? [officeSlug]
        : [];
    return slugs.includes(slug || '');
  });

  if (!dept)
    return (
      <div
        className='text-kapwa-text-support p-20 text-center font-bold tracking-widest uppercase'
        role='alert'
      >
        {t('departments.notFound')}
      </div>
    );

  return (
    <div className='animate-in fade-in space-y-6 pb-20 duration-500'>
      {/* --- BREADCRUMBS --- */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbHome href='/' />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href='/government/departments'>
              {t('departments.title')}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{toTitleCase(dept.office_name)}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* --- COMPACT IDENTITY HEADER --- */}
      <Card
        hover={false}
        className='rounded-xl p-6'
        role='banner'
        aria-label={t('departments.headerLabel')}
      >
        {/* Top Row: Name + Badge */}
        <div className='mb-4 flex items-center justify-between gap-4'>
          <div className='flex items-center gap-3'>
            <Briefcase
              aria-hidden='true'
              className='text-kapwa-text-brand h-5 w-5'
            />
            {/*
              Rendered verbatim, like the barangay names: the city cases these
              for display and toTitleCase() lowercases a whole word before
              recapitalising it, which mangles the acronyms they carry.
            */}
            <h1 className='text-kapwa-text-strong kapwa-heading-xl font-extrabold'>
              {dept.office_name}
            </h1>
          </div>
          <Badge variant='secondary' dot>
            {t('departments.officialProfile')}
          </Badge>
        </div>

        {/* Middle: Address */}
        {dept.address ? (
          <p className='text-kapwa-text-support mb-4 text-sm'>
            {dept.address}, {lguLabels.location}
          </p>
        ) : (
          <NotVerified
            label={t('departments.addressNotVerified')}
            className='mb-4'
          />
        )}

        {/* Bottom: Contact Row */}
        <div className='flex flex-col gap-4 text-sm md:flex-row md:gap-6'>
          {dept.trunkline.length > 0 ? (
            dept.trunkline.map(number => (
              <a
                key={number}
                href={toTelUri(number) || '#'}
                className='text-kapwa-text-support hover:text-kapwa-text-brand flex items-center gap-2 transition-colors'
              >
                <PhoneIcon aria-hidden='true' className='h-4 w-4' />
                <span>{number}</span>
              </a>
            ))
          ) : (
            <NotVerified label={t('departments.contactNotVerified')} />
          )}
          {dept.website && (
            <a
              href={dept.website}
              target='_blank'
              rel='noreferrer'
              className='text-kapwa-text-support hover:text-kapwa-text-brand flex items-center gap-2 transition-colors'
            >
              <GlobeIcon aria-hidden='true' className='h-4 w-4' />
              <span>{t('departments.website')}</span>
            </a>
          )}
          {dept.email && (
            <a
              href={`mailto:${dept.email}`}
              className='text-kapwa-text-support hover:text-kapwa-text-brand flex items-center gap-2 transition-colors'
            >
              <MailIcon aria-hidden='true' className='h-4 w-4' />
              <span>{dept.email}</span>
            </a>
          )}
          {/* null means not verified, not "has none": say so instead of leaving a gap. */}
          {!dept.website && !dept.email && (
            <NotVerified label={t('departments.onlineContactNotVerified')} />
          )}
          {dept.website && !dept.email && (
            <NotVerified label={t('departments.emailNotVerified')} />
          )}
        </div>
      </Card>

      {/* Where the office and its contact details came from. */}
      <SourceNote sources={dept.sources} />

      {/*
        A plain wrapper, not a <main id='main-content'>: the app shell in
        src/App.tsx already provides that landmark and the skip link that
        targets it, and repeating them here made both duplicates.
      */}
      <div className='space-y-6'>
        {/*
          The section header renders whichever way this falls. An office with
          no published head must say so: rendering nothing would read as though
          the office has no head, which is never what a missing name means.
        */}
        <div
          className='space-y-2'
          role='group'
          aria-label={t('departments.leadershipTitle')}
        >
          <p className='sr-only'>{t('departments.leadershipTitle')}</p>
          <p className='text-kapwa-text-support pl-1 text-[10px] font-bold tracking-widest uppercase'>
            {t('departments.leadershipTitle')}
          </p>
          {dept.department_head ? (
            <Card hover={false} className='rounded-xl'>
              <div className='flex flex-col gap-4 md:flex-row md:items-center md:gap-6'>
                <div className='border-kapwa-border-brand text-kapwa-text-brand bg-kapwa-bg-surface flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2'>
                  <UserIcon className='h-8 w-8' />
                </div>
                <div className='flex-1'>
                  <h3 className='text-kapwa-text-strong text-xl font-bold'>
                    {dept.department_head.name}
                  </h3>
                  {/* The position exactly as the city publishes it. */}
                  <Badge variant='secondary' className='mt-1'>
                    {dept.department_head.title}
                  </Badge>
                  {dept.department_head.email && (
                    <a
                      href={`mailto:${dept.department_head.email}`}
                      className='text-kapwa-text-brand mt-2 flex items-center gap-2 text-sm'
                    >
                      <MailIcon className='h-4 w-4' />
                      {dept.department_head.email}
                    </a>
                  )}
                  {/* Who says so. The head is a separate claim from the office. */}
                  <SourceNote
                    sources={dept.department_head.sources}
                    className='mt-3'
                  />
                </div>
              </div>
            </Card>
          ) : (
            <NotVerified
              label={t('departments.headNotVerified')}
              detail={t(
                dept.department_head_status === 'conflicting_sources'
                  ? 'departments.headNotVerifiedConflict'
                  : 'departments.headNotVerifiedUncorroborated'
              )}
            />
          )}
        </div>

        {/* Department Services */}
        {associatedServices.length > 0 && (
          <div
            className='space-y-2'
            role='group'
            aria-label={t('departments.servicesTitle')}
          >
            <p className='sr-only'>{t('departments.servicesTitle')}</p>
            <p className='text-kapwa-text-support pl-1 text-[10px] font-bold tracking-widest uppercase'>
              {t('departments.servicesTitle')}
            </p>
            <div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3'>
              {associatedServices.map(service => (
                <Link
                  key={service.slug}
                  to={`/services/${service.slug}`}
                  className='group block'
                >
                  <Card
                    hover
                    className='hover:border-kapwa-border-brand border-kapwa-border-weak h-full shadow-xs'
                  >
                    <CardContent className='flex h-full items-center justify-between gap-3 p-4'>
                      <div className='flex min-w-0 items-center gap-3'>
                        <div className='bg-kapwa-bg-surface text-kapwa-text-brand group-hover:bg-kapwa-bg-brand-default border-kapwa-border-brand group-hover:text-kapwa-text-inverse shrink-0 rounded-lg border p-2 shadow-sm transition-colors'>
                          <CheckCircle2 className='h-5 w-5' />
                        </div>
                        <div className='min-w-0'>
                          <p className='text-kapwa-text-brand mb-0.5 truncate text-[10px] font-bold tracking-widest uppercase'>
                            {t('departments.serviceLabel')}
                          </p>
                          <p className='group-hover:text-kapwa-text-brand-bold text-kapwa-text-support text-sm leading-tight font-bold transition-colors'>
                            {service.plainLanguageName || service.service}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className='group-hover:text-kapwa-text-brand text-kapwa-text-support h-4 w-4 shrink-0 transition-all group-hover:translate-x-1' />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
