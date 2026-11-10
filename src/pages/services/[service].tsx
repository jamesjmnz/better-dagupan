import { Link, useParams } from 'react-router-dom';

import { format, isValid } from 'date-fns';
import {
  AlertCircle,
  ArrowRight,
  Banknote,
  BookOpen,
  Building2,
  Calendar,
  CalendarCheck,
  CheckCircle2Icon,
  ClipboardList,
  Clock,
  Edit3,
  ExternalLink,
  FileText,
  HeartHandshake,
  Info,
  LinkIcon,
  LucideIcon,
  Users,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { DetailSection, useBreadcrumbs } from '@/components/layout';
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
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { RequirementGrid } from './components/RequirementGrid';
import { ProcessTimeline } from './components/ProcessTimeline';
import { SupportingDocumentsDetail } from './components/SupportingDocumentsDetail';
import { FeesCard } from './components/FeesCard';

import { getServiceBySlug } from '@/lib/services';
import { config } from '@/lib/lguConfig';
import { toTitleCase } from '@/lib/stringUtils';

import departmentsDataRaw from '@/data/directory/departments.json';
import executiveDataRaw from '@/data/directory/executive.json';
import legislativeDataRaw from '@/data/directory/legislative.json';

import type {
  Department,
  ExecutiveOfficial,
  LegislativeChamber,
} from '@/types/directoryTypes';

const departmentsData = departmentsDataRaw as Department[];
const executiveData = executiveDataRaw as ExecutiveOfficial[];
const legislativeData = legislativeDataRaw as LegislativeChamber[];

import type { QuickInfo, Source } from '@/types/servicesTypes';

const QUICK_INFO_CONFIG: Record<
  keyof QuickInfo,
  { labelKey: string; icon: LucideIcon }
> = {
  processingTime: {
    labelKey: 'detail.quickInfo.processingTime',
    icon: Clock,
  },
  fee: { labelKey: 'detail.quickInfo.fee', icon: Banknote },
  whoCanApply: { labelKey: 'detail.quickInfo.whoCanApply', icon: Users },
  appointmentType: {
    labelKey: 'detail.quickInfo.appointmentType',
    icon: Calendar,
  },
  validity: { labelKey: 'detail.quickInfo.validity', icon: CalendarCheck },
  documents: { labelKey: 'detail.quickInfo.documents', icon: FileText },
};

export default function ServiceDetail() {
  const { t } = useTranslation('services');
  const { service: serviceSlug } = useParams<{ service: string }>();

  // Auto-generate breadcrumbs using the hook (must be called before early returns)
  const breadcrumbs = useBreadcrumbs();

  if (!serviceSlug) return null;

  const service = getServiceBySlug(decodeURIComponent(serviceSlug));
  if (!service)
    return (
      <EmptyState
        title={t('detail.notFound')}
        message={t('detail.notFoundBody')}
        actionHref='/services'
        actionLabel={t('detail.backToServices')}
      />
    );

  const officeSlugs = Array.isArray(service.officeSlug)
    ? service.officeSlug
    : [service.officeSlug].filter(Boolean);

  // Collect offices from all sources (departments, executive, legislative)
  const involvedOffices = [
    ...departmentsData
      .filter(d => officeSlugs.includes(d.slug))
      .map(d => ({
        slug: d.slug,
        name: d.office_name,
        type: 'department',
      })),
    ...executiveData
      .filter(e => officeSlugs.includes(e.slug))
      .map(e => ({
        slug: e.slug,
        name: e.role,
        type: 'executive',
      })),
    ...legislativeData
      .filter(l => officeSlugs.includes(l.slug))
      .map(l => ({
        slug: l.slug,
        name: l.chamber,
        type: 'legislative',
      })),
  ];
  const isTransaction = service.type === 'transaction';
  const updatedAtDate = service.updatedAt ? new Date(service.updatedAt) : null;
  const isVerified = updatedAtDate !== null && isValid(updatedAtDate);

  // Citizens Charter specific
  const isOfficialSource = service.source === 'citizens-charter';
  const needsVerification = service.needsVerification === true;

  const quickInfoArray = service.quickInfo
    ? (Object.entries(service.quickInfo) as [keyof QuickInfo, string][]).map(
        ([key, value]) => ({
          label: QUICK_INFO_CONFIG[key]
            ? t(QUICK_INFO_CONFIG[key].labelKey)
            : key,
          icon: QUICK_INFO_CONFIG[key]?.icon || FileText,
          value,
        })
      )
    : [];

  // Build Citizens Charter specific info items
  const ccInfoItems: { label: string; value: string; icon: LucideIcon }[] = [];
  if (service.processingTime) {
    ccInfoItems.push({
      label: t('detail.quickInfo.processingTime'),
      value: service.processingTime,
      icon: Clock,
    });
  }
  if (service.whoMayAvail) {
    ccInfoItems.push({
      label: t('detail.quickInfo.whoCanApply'),
      value: service.whoMayAvail,
      icon: Users,
    });
  }
  if (service.classification) {
    ccInfoItems.push({
      label: t('detail.classification'),
      value: service.classification,
      icon: FileText,
    });
  }

  return (
    <div className='animate-in fade-in mx-auto max-w-7xl space-y-6 duration-500'>
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <div key={crumb.href} className='flex items-center gap-2'>
                {index === 0 ? (
                  <BreadcrumbItem>
                    <BreadcrumbHome href={crumb.href} />
                  </BreadcrumbItem>
                ) : (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage>
                          {service.plainLanguageName || service.service}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={crumb.href}>
                          {crumb.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </>
                )}
              </div>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      {/* HEADER */}
      <header
        className={`border-kapwa-border-weak bg-kapwa-bg-surface overflow-hidden rounded-3xl border p-8 shadow-sm md:p-10 ${
          isOfficialSource ? 'border-l-4 border-l-kapwa-border-success' : ''
        }`}
      >
        <div className='max-w-3xl'>
          <div className='mb-6 flex flex-wrap items-center gap-2'>
            <Badge variant='primary'>{service.category.name}</Badge>
            <Badge variant={isTransaction ? 'success' : 'secondary'} dot>
              {isTransaction ? t('detail.transactional') : t('detail.resource')}
            </Badge>
            <Badge variant={isOfficialSource ? 'success' : 'secondary'} dot>
              {isOfficialSource
                ? t('source.officialCc')
                : t('source.community')}
            </Badge>
            {service.serviceNumber && (
              <Badge variant='outline'>
                {t('card.serviceNo', { number: service.serviceNumber })}
              </Badge>
            )}
            {needsVerification && (
              <Badge variant='warning' dot>
                {t('card.pendingVerification')}
              </Badge>
            )}
          </div>

          <h1 className='text-kapwa-text-strong kapwa-heading-xl font-extrabold'>
            {service.plainLanguageName || service.service}
          </h1>

          {service.description && (
            <p className='text-kapwa-text-support mb-8 max-w-2xl text-base leading-relaxed'>
              &quot;{service.description}&quot;
            </p>
          )}

          {/* Who May Avail (Citizens Charter) */}
          {service.whoMayAvail && !needsVerification && (
            <div className='border-kapwa-border-weak bg-kapwa-bg-surface-raised mb-8 rounded-xl border p-4'>
              <p className='text-kapwa-text-support text-sm font-medium'>
                <span className='text-kapwa-text-brand font-semibold'>
                  {t('detail.whoMayAvail')}{' '}
                </span>
                {service.whoMayAvail}
              </p>
            </div>
          )}

          {/* SINGLE PRIMARY ACTION */}
          {service.website && (
            <a
              href={service.website}
              target='_blank'
              rel='noreferrer'
              className='bg-kapwa-bg-brand-default hover:bg-kapwa-bg-brand-weak text-kapwa-text-inverse inline-flex min-h-[48px] items-center gap-3 rounded-xl px-6 py-3 font-semibold shadow-sm transition-all'
            >
              {t('detail.accessPortal')}
              <ExternalLink className='h-4 w-4 transition-transform group-hover:translate-x-0.5' />
            </a>
          )}
          {service.url && !service.website && (
            <a
              href={service.url}
              target='_blank'
              rel='noreferrer'
              className='bg-kapwa-bg-brand-default hover:bg-kapwa-bg-brand-weak text-kapwa-text-inverse inline-flex min-h-[48px] items-center gap-3 rounded-xl px-6 py-3 font-semibold shadow-sm transition-all'
            >
              {isTransaction
                ? t('detail.accessPortal')
                : t('detail.viewDocument')}
              <ExternalLink className='h-4 w-4 transition-transform group-hover:translate-x-0.5' />
            </a>
          )}
        </div>
      </header>

      {/* --- CONTENT AREA --- */}
      <div className='flex flex-col gap-8 xl:flex-row'>
        <div className='min-w-0 flex-1 space-y-8'>
          {/* Citizens Charter Info Grid (processing time, fees, etc.) */}
          {isOfficialSource && ccInfoItems.length > 0 && (
            <div className='grid grid-cols-2 gap-3 md:grid-cols-3'>
              {ccInfoItems.map((info, idx) => (
                <div
                  key={idx}
                  className='border-kapwa-border-weak bg-kapwa-bg-surface flex items-start gap-3 rounded-2xl border p-4 shadow-xs'
                >
                  <div className='text-kapwa-text-brand bg-kapwa-bg-surface-raised shrink-0 rounded-lg p-2'>
                    <info.icon className='h-4 w-4' />
                  </div>
                  <div>
                    <p className='text-kapwa-text-disabled mb-1 text-[10px] font-bold tracking-widest uppercase'>
                      {info.label}
                    </p>
                    <p className='text-kapwa-text-strong text-xs font-bold'>
                      {info.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Fees Card (Citizens Charter) */}
          {isOfficialSource && service.fees && <FeesCard fees={service.fees} />}

          {/* Pending Verification Notice */}
          {needsVerification && (
            <div className='border-kapwa-border-warning bg-kapwa-bg-warning-weak/30 flex items-start gap-3 rounded-2xl border p-4'>
              <Info className='text-kapwa-text-warning h-5 w-5 shrink-0' />
              <div>
                <p className='text-kapwa-text-strong mb-1 text-sm font-bold'>
                  {t('detail.pendingTitle')}
                </p>
                <p className='text-kapwa-text-support text-xs leading-relaxed'>
                  {t('detail.pendingBody')}
                </p>
              </div>
            </div>
          )}

          {/* Requirements (Citizens Charter) */}
          {isOfficialSource &&
            service.detailedRequirements &&
            service.detailedRequirements.length > 0 && (
              <RequirementGrid requirements={service.detailedRequirements} />
            )}

          {/* Supporting Documents Detail (Citizens Charter - optional) */}
          {isOfficialSource &&
            service.supportingDocumentsDetail &&
            Object.keys(service.supportingDocumentsDetail).length > 0 && (
              <div className='space-y-4'>
                <SupportingDocumentsDetail
                  detail={service.supportingDocumentsDetail}
                />
              </div>
            )}

          {/* Process Timeline (Citizens Charter) */}
          {isOfficialSource &&
            service.clientSteps &&
            service.clientSteps.length > 0 && (
              <ProcessTimeline steps={service.clientSteps} />
            )}

          {/* Regular Steps (community services) */}
          {!isOfficialSource && service.steps && service.steps.length > 0 && (
            <DetailSection
              title={
                isTransaction
                  ? t('detail.processSteps')
                  : t('detail.informationDetails')
              }
              icon={ClipboardList}
            >
              <div className='space-y-6'>
                {service.steps.map((step, idx) => (
                  <div key={idx} className='group flex gap-4'>
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold transition-colors ${
                        isTransaction
                          ? 'bg-kapwa-bg-surface text-kapwa-text-brand border-kapwa-border-brand'
                          : 'text-kapwa-text-accent-orange bg-kapwa-bg-accent-orange-weak border-kapwa-border-weak'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <p className='text-kapwa-text-support pt-1 text-sm leading-relaxed md:text-base'>
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </DetailSection>
          )}

          {/* Quick Info Grid (community services) */}
          {!isOfficialSource && isTransaction && quickInfoArray.length > 0 && (
            <div className='grid grid-cols-2 gap-3 md:grid-cols-3'>
              {quickInfoArray.map((info, idx) => (
                <div
                  key={idx}
                  className='border-kapwa-border-weak bg-kapwa-bg-surface flex items-start gap-3 rounded-2xl border p-4 shadow-xs'
                >
                  <div className='text-kapwa-text-brand bg-kapwa-bg-surface-raised shrink-0 rounded-lg p-2'>
                    <info.icon className='h-4 w-4' />
                  </div>
                  <div>
                    <p className='text-kapwa-text-disabled mb-1 text-[10px] font-bold tracking-widest uppercase'>
                      {info.label}
                    </p>
                    <p className='text-kapwa-text-strong text-xs font-bold'>
                      {info.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sources and References */}
          {service.sources && service.sources.length > 0 && (
            <DetailSection title={t('detail.sources')} icon={BookOpen}>
              <ul className='grid grid-cols-1 gap-3' role='list'>
                {service.sources.map((source: Source, idx: number) => (
                  <li
                    key={idx}
                    className='hover:border-kapwa-border-brand group border-kapwa-border-weak bg-kapwa-bg-surface-raised/50 flex items-start gap-3 rounded-xl border p-4 transition-all'
                  >
                    <div className='group-hover:text-kapwa-text-brand bg-kapwa-bg-surface text-kapwa-text-disabled rounded-lg p-2 shadow-sm'>
                      <LinkIcon className='h-3.5 w-3.5' />
                    </div>
                    <div className='flex flex-col'>
                      <p className='text-kapwa-text-disabled mb-1 text-[10px] font-bold tracking-widest uppercase'>
                        {t('detail.reference')}
                      </p>
                      {source.url ? (
                        <a
                          href={source.url}
                          target='_blank'
                          rel='noreferrer'
                          className='text-kapwa-text-brand inline-flex items-center gap-1.5 text-sm font-bold hover:underline'
                        >
                          {source.name} <ExternalLink className='h-3 w-3' />
                        </a>
                      ) : (
                        <span className='text-kapwa-text-support text-sm font-bold'>
                          {source.name}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </DetailSection>
          )}
        </div>

        {/* --- SIDEBAR --- */}
        <aside className='w-full space-y-6 xl:w-80'>
          {/* Data Integrity Card */}
          <div
            className={`flex flex-col gap-3 rounded-2xl border p-5 transition-colors ${
              isOfficialSource
                ? 'border-kapwa-border-success bg-kapwa-bg-success-weak/30'
                : isVerified
                  ? 'border-kapwa-border-success bg-kapwa-bg-success-weak/30'
                  : 'border-kapwa-border-weak bg-kapwa-bg-surface'
            }`}
          >
            <div className='flex items-center justify-between'>
              <p className='text-kapwa-text-disabled text-[10px] font-bold tracking-widest uppercase'>
                {t('detail.dataIntegrity')}
              </p>
              {isOfficialSource || isVerified ? (
                <CheckCircle2Icon className='h-4 w-4 text-kapwa-text-success' />
              ) : (
                <AlertCircle className='text-kapwa-text-support h-4 w-4' />
              )}
            </div>
            <div className='flex items-center gap-3'>
              <Clock
                className={`h-5 w-5 ${
                  isOfficialSource || isVerified
                    ? 'text-kapwa-text-success'
                    : 'text-kapwa-text-support'
                }`}
              />
              <div>
                <p
                  className={`text-sm font-bold ${
                    isOfficialSource || isVerified
                      ? 'text-kapwa-text-strong'
                      : 'text-kapwa-text-strong0'
                  }`}
                >
                  {isOfficialSource
                    ? t('detail.officialData')
                    : isVerified
                      ? t('detail.verifiedInformation')
                      : t('detail.unverifiedData')}
                </p>
                <p className='text-kapwa-text-disabled text-[11px] font-medium'>
                  {isOfficialSource
                    ? t('detail.fromCharter')
                    : isVerified
                      ? t('detail.lastAudit', {
                          date: format(updatedAtDate!, 'MMMM yyyy'),
                        })
                      : t('detail.awaitingVerification')}
                </p>
              </div>
            </div>
          </div>

          {/* Involved Offices */}
          {involvedOffices.length > 0 && (
            <DetailSection
              title={t('detail.responsibleOffices')}
              icon={Building2}
            >
              <div className='space-y-6'>
                {involvedOffices.map((off, idx) => {
                  const officePath =
                    off.type === 'executive'
                      ? `/government/executive/${off.slug}`
                      : off.type === 'legislative'
                        ? `/government/legislative/${off.slug}`
                        : `/government/departments/${off.slug}`;

                  return (
                    <div
                      key={off.slug}
                      className={
                        idx > 0 ? 'border-t border-kapwa-border-weak pt-5' : ''
                      }
                    >
                      <Link to={officePath} className='group block'>
                        <h3 className='group-hover:text-kapwa-text-brand text-kapwa-text-strong leading-tight font-bold transition-colors'>
                          {toTitleCase(off.name)}
                        </h3>
                        <span className='text-kapwa-text-brand mt-2 flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase'>
                          {t('detail.viewProfile')}{' '}
                          <ArrowRight className='h-3 w-3 transition-transform group-hover:translate-x-1' />
                        </span>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </DetailSection>
          )}

          {/* SUGGEST AN EDIT - NEW PLACEMENT & STYLE */}
          <Card hover={false} className='space-y-4'>
            <div className='flex items-center gap-3'>
              <div className='bg-kapwa-bg-accent-orange-weak text-kapwa-text-accent-orange rounded-lg p-2'>
                <HeartHandshake className='h-5 w-5' />
              </div>
              <h4 className='text-kapwa-text-strong text-sm leading-tight font-bold'>
                {t('detail.helpTitle')}
              </h4>
            </div>
            <p className='text-kapwa-text-disabled text-xs leading-relaxed'>
              {t('detail.helpBody')}
            </p>
            <a
              href={`${config.portal.githubUrl}/issues/new?template=contribution.yml&title=${encodeURIComponent(`[Edit] ${service.service}`)}`}
              target='_blank'
              rel='noopener noreferrer'
              className='group border-kapwa-border-weak text-kapwa-text-support hover:border-kapwa-border-weak hover:bg-kapwa-bg-surface-raised flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border-2 px-4 py-2.5 text-xs font-bold transition-all'
            >
              <Edit3 className='group-hover:text-kapwa-text-accent-orange text-kapwa-text-disabled h-3.5 w-3.5 transition-colors' />
              {t('detail.suggestEdit')}
            </a>
          </Card>
        </aside>
      </div>
    </div>
  );
}
