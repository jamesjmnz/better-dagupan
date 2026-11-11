import { useEffect, useState } from 'react';

import { Link, useParams } from 'react-router-dom';

import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Coins,
  DollarSign,
  Download,
  ExternalLink,
  FileText,
  Gavel,
  ImageIcon,
  Layers,
  MapPin,
  Search,
  TrendingUp,
  Users,
  Video,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

// --- Components ---
import { DetailSection } from '@/components/layout/PageLayouts';
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
import { EmptyState } from '@/components/ui/EmptyState';

import { formatPesoAdaptive } from '@/lib/format';
import { config } from '@/lib/lguConfig';

// --- Strict Types (Matched to API Response) ---
interface ProjectComponent {
  componentId: string;
  description: string;
  infraType: string;
  typeOfWork: string;
  region: string;
  province: string;
  coordinates?: {
    latitude: number;
    longitude: number;
    source?: string;
    locationVerified?: boolean;
  };
}

interface ProjectBidder {
  name: string;
  pcabId?: string;
  participation: number;
  isWinner: boolean;
}

interface DPWHProjectDetail {
  contractId: string;
  description: string;
  category: string;
  status: string;
  budget: number;
  amountPaid: number;
  progress: number;
  location: {
    region: string;
    province: string;
    municipality?: string; // Sometimes flattened in API
    infraType: string;
    coordinates: {
      latitude: number;
      longitude: number;
      verified: boolean;
    };
  };
  infraType: string;
  contractor: string;
  startDate: string;
  completionDate?: string | null;
  infraYear: string;
  contractEffectivityDate?: string;
  expiryDate?: string;
  nysReason?: string | null;
  programName: string;
  sourceOfFunds: string;
  isVerifiedByDpwh: boolean;
  isVerifiedByPublic: boolean;
  isLive: boolean;
  livestreamUrl?: string | null;
  latitude: number;
  longitude: number;
  components?: ProjectComponent[];
  winnerNames?: string;
  bidders?: ProjectBidder[];
  procurement?: {
    contractName: string;
    abc: string;
    status: string;
    fundingInstrument: string;
    advertisementDate: string;
    bidSubmissionDeadline: string;
    dateOfAward: string;
    awardAmount: string;
  };
  links?: {
    advertisement?: string;
    contractAgreement?: string;
    noticeOfAward?: string;
    noticeToProceed?: string;
    programOfWork?: string;
    engineeringDesign?: string;
  };
  imageSummary?: {
    totalImages: number;
    latestImageDate: string;
    hasImages: boolean;
  };
}

// --- Helpers ---
const formatDate = (
  dateString: string | null | undefined,
  locale: string,
  fallback: string
) => {
  if (!dateString) return fallback;
  try {
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return fallback;
  }
};

const formatDateTime = (
  dateString: string | null | undefined,
  locale: string,
  fallback: string
) => {
  if (!dateString) return fallback;
  try {
    return new Date(dateString).toLocaleString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return fallback;
  }
};

const getStatusVariant = (
  status: string
): 'success' | 'warning' | 'error' | 'primary' | 'slate' => {
  switch (status) {
    case 'Completed':
      return 'success';
    case 'On-Going':
      return 'primary';
    case 'For Procurement':
      return 'warning';
    case 'Not Started':
      return 'slate';
    case 'Terminated':
      return 'error';
    default:
      return 'slate';
  }
};

export default function InfrastructureDetail() {
  const { contractId } = useParams<{ contractId: string }>();
  const { t, i18n } = useTranslation('transparency');
  const [project, setProject] = useState<DPWHProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const notAvailable = t('infrastructure.notAvailable');
  const showDate = (value?: string | null) =>
    formatDate(value, i18n.language, notAvailable);
  const showDateTime = (value?: string | null) =>
    formatDateTime(value, i18n.language, notAvailable);

  useEffect(() => {
    const loadProjectDetail = async () => {
      if (!contractId) return;
      setLoading(true);
      setError(false);

      try {
        // USE API DIRECTLY FOR FULL DETAILS
        const response = await fetch(
          `https://api.dpwh.bettergov.ph/projects/${contractId}`
        );

        if (!response.ok) {
          throw new Error(`Failed to load project: ${response.status}`);
        }

        const result = await response.json();
        setProject(result.data);
      } catch (err) {
        console.error('Error loading project detail:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadProjectDetail();
  }, [contractId]);

  // --- Sub-components for Cleaner Render ---
  const DocumentRow = ({ label, url }: { label: string; url?: string }) => {
    if (!url) return null;
    return (
      <a
        href={url}
        target='_blank'
        rel='noopener noreferrer'
        className='flex justify-between items-center p-3 rounded-xl border transition-all group hover:border-kapwa-border-brand border-kapwa-border-weak bg-kapwa-bg-surface hover:bg-kapwa-bg-surface-raised'
      >
        <div className='flex gap-3 items-center'>
          <div className='p-2 rounded-lg border transition-colors group-hover:text-kapwa-text-brand border-kapwa-border-weak bg-kapwa-bg-surface-raised text-kapwa-text-disabled'>
            <FileText className='w-4 h-4' />
          </div>
          <span className='text-sm font-bold text-kapwa-text-support group-hover:text-kapwa-text-strong'>
            {label}
          </span>
        </div>
        <ExternalLink className='group-hover:text-kapwa-text-brand-600 text-kapwa-text-support h-3.5 w-3.5 transition-colors' />
      </a>
    );
  };

  const InfoRow = ({
    label,
    value,
  }: {
    label: string;
    value?: string | number | null;
  }) => (
    <div>
      <label className='text-kapwa-text-disabled mb-1 block text-[10px] font-bold tracking-widest uppercase'>
        {label}
      </label>
      <p className='text-sm font-bold text-kapwa-text-strong wrap-break-word'>
        {value || notAvailable}
      </p>
    </div>
  );

  if (loading)
    return (
      <div className='container px-4 pt-20 mx-auto space-y-8 min-h-screen animate-in fade-in'>
        <div className='w-1/3 h-8 rounded animate-pulse bg-kapwa-bg-hover' />
        <div className='w-full h-64 rounded-3xl animate-pulse bg-kapwa-bg-hover' />
      </div>
    );

  if (error || !project)
    return (
      <div className='container px-4 pt-20 mx-auto min-h-screen animate-in fade-in'>
        <EmptyState
          title={t('project.unavailableTitle')}
          message={
            error ? t('project.unavailableMessage') : t('project.notFound')
          }
          actionHref='/transparency/infrastructure'
          actionLabel={t('project.back')}
          icon={AlertCircle}
        />
      </div>
    );

  const hasDocuments =
    project.links && Object.values(project.links).some(link => !!link);

  return (
    <div className='pb-20 mx-auto space-y-8 max-w-7xl duration-500 animate-in fade-in'>
      {/* 1. Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbHome href='/' />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href='/transparency/infrastructure'>
              {t('project.breadcrumb')}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{project.contractId}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* 2. Header Section */}
      <div className='mb-8'>
        <Link
          to='/transparency/infrastructure'
          className='inline-flex gap-2 items-center mb-6 text-xs font-bold tracking-widest uppercase transition-colors hover:text-kapwa-text-brand text-kapwa-text-disabled'
        >
          <ArrowLeft className='w-4 h-4' /> {t('project.back')}
        </Link>

        <div className='flex flex-col gap-6'>
          <div className='max-w-4xl'>
            <div className='flex flex-wrap gap-3 items-center mb-4'>
              <Badge
                variant={getStatusVariant(project.status)}
                className='gap-1.5 px-2.5 py-1 text-[10px]'
              >
                {project.status}
              </Badge>
              <span className='border-kapwa-border-weak bg-kapwa-bg-surface-raised text-kapwa-text-disabled rounded border px-2 py-0.5 font-mono text-xs font-medium'>
                {project.contractId}
              </span>
              {project.isLive && (
                <Badge variant='error' className='animate-pulse'>
                  {t('project.liveStream')}
                </Badge>
              )}
              {project.isVerifiedByDpwh && (
                <Badge variant='success'>{t('project.dpwhVerified')}</Badge>
              )}
            </div>
            <h1 className='text-kapwa-text-strong kapwa-heading-xl font-extrabold leading-tight'>
              {project.description}
            </h1>
          </div>
        </div>
      </div>

      {/* 3. Key Stats Grid */}
      <div className='grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-4'>
        <Card className='shadow-sm border-kapwa-border-weak'>
          <CardContent className='flex flex-col justify-between p-5 h-full'>
            <div className='flex gap-2 items-center mb-2'>
              <div className='border-kapwa-border-weak bg-kapwa-bg-surface-raised text-kapwa-text-disabled rounded-md border p-1.5'>
                <DollarSign className='w-4 h-4' />
              </div>
              <span className='text-kapwa-text-disabled text-[10px] font-bold tracking-widest uppercase'>
                {t('project.totalBudget')}
              </span>
            </div>
            <div>
              <p
                className='text-2xl font-black truncate text-kapwa-text-strong'
                title={formatPesoAdaptive(project.budget).fullString}
              >
                {formatPesoAdaptive(project.budget).fullString}
              </p>
              <p className='text-kapwa-text-disabled mt-0.5 text-xs font-medium'>
                {t('project.allocated')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className='shadow-sm border-kapwa-border-weak'>
          <CardContent className='flex flex-col justify-between p-5 h-full'>
            <div className='flex gap-2 items-center mb-2'>
              <div className='border-kapwa-border-weak bg-kapwa-bg-surface-raised text-kapwa-text-disabled rounded-md border p-1.5'>
                <Coins className='w-4 h-4' />
              </div>
              <span className='text-kapwa-text-disabled text-[10px] font-bold tracking-widest uppercase'>
                {t('project.paidAmount')}
              </span>
            </div>
            <div>
              <p
                className='text-2xl font-black truncate text-kapwa-text-strong'
                title={formatPesoAdaptive(project.amountPaid).fullString}
              >
                {formatPesoAdaptive(project.amountPaid).fullString}
              </p>
              <p className='text-kapwa-text-disabled mt-0.5 text-xs font-medium'>
                {t('project.disbursed', {
                  percent:
                    project.budget > 0
                      ? ((project.amountPaid / project.budget) * 100).toFixed(1)
                      : 0,
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className='shadow-sm bg-kapwa-bg-surface-raised/50 border-kapwa-border-weak'>
          <CardContent className='flex flex-col justify-between p-5 h-full'>
            <div className='flex gap-2 items-center mb-2'>
              <div className='border-kapwa-border-weak bg-kapwa-bg-surface text-kapwa-text-disabled rounded-md border p-1.5'>
                <TrendingUp className='w-4 h-4' />
              </div>
              <span className='text-kapwa-text-disabled text-[10px] font-bold tracking-widest uppercase'>
                {t('project.progress')}
              </span>
            </div>
            <div>
              <p className='mb-2 text-2xl font-black text-kapwa-text-brand'>
                {project.progress.toFixed(1)}%
              </p>
              <div className='overflow-hidden w-full h-2 rounded-full bg-kapwa-bg-active'>
                <div
                  className='h-full rounded-full transition-all bg-kapwa-bg-brand-default'
                  style={{ width: `${Math.min(project.progress, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='shadow-sm border-kapwa-border-weak'>
          <CardContent className='flex flex-col justify-between p-5 h-full'>
            <div className='flex gap-2 items-center mb-2'>
              <div className='border-kapwa-border-weak bg-kapwa-bg-surface-raised text-kapwa-text-disabled rounded-md border p-1.5'>
                <Calendar className='w-4 h-4' />
              </div>
              <span className='text-kapwa-text-disabled text-[10px] font-bold tracking-widest uppercase'>
                {t('project.fiscalYear')}
              </span>
            </div>
            <div>
              <p className='text-2xl font-black text-kapwa-text-strong'>
                {project.infraYear}
              </p>
              <p className='text-kapwa-text-disabled mt-0.5 truncate text-xs font-medium'>
                {project.programName}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Main Two-Column Layout */}
      <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
        {/* LEFT: MAIN INFO */}
        <div className='space-y-8 lg:col-span-2'>
          {/* Project Information */}
          <DetailSection title={t('project.sections.info')} icon={FileText}>
            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
              <InfoRow
                label={t('project.fields.contractId')}
                value={project.contractId}
              />
              <InfoRow
                label={t('project.fields.category')}
                value={project.category}
              />
              <InfoRow
                label={t('project.fields.infraType')}
                value={project.location.infraType}
              />
              <InfoRow
                label={t('project.fields.program')}
                value={project.programName}
              />
              <div className='sm:col-span-2'>
                <InfoRow
                  label={t('project.fields.sourceOfFunds')}
                  value={project.sourceOfFunds}
                />
              </div>
            </div>
          </DetailSection>

          {/* Timeline */}
          <DetailSection title={t('project.sections.timeline')} icon={Calendar}>
            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
              <InfoRow
                label={t('project.fields.startDate')}
                value={showDate(project.startDate)}
              />
              <InfoRow
                label={t('project.fields.completionDate')}
                value={showDate(project.completionDate)}
              />
              <InfoRow
                label={t('project.fields.contractEffectivity')}
                value={showDate(project.contractEffectivityDate)}
              />
              <InfoRow
                label={t('project.fields.expiryDate')}
                value={showDate(project.expiryDate)}
              />
              {project.nysReason && (
                <div className='p-3 rounded-lg border border-kapwa-border-weak bg-kapwa-bg-surface-raised sm:col-span-2'>
                  <InfoRow
                    label={t('project.fields.delayReason')}
                    value={project.nysReason}
                  />
                </div>
              )}
            </div>
          </DetailSection>

          {/* Contractor & Bidders (New Section!) */}
          <DetailSection title={t('project.sections.contractor')} icon={Users}>
            <div className='space-y-6'>
              <div>
                <InfoRow
                  label={t('project.fields.primaryContractor')}
                  value={project.contractor}
                />
                {project.winnerNames && (
                  <p className='mt-1 text-xs text-kapwa-text-disabled'>
                    {t('project.winnerNames', { names: project.winnerNames })}
                  </p>
                )}
              </div>

              {project.bidders && project.bidders.length > 0 && (
                <div>
                  <label className='text-kapwa-text-disabled mb-3 block text-[10px] font-bold tracking-widest uppercase'>
                    {t('project.fields.bidders')}
                  </label>
                  <div className='space-y-2'>
                    {project.bidders.map((bidder, i) => (
                      <div
                        key={i}
                        className={`flex items-center justify-between rounded-lg border p-3 ${bidder.isWinner ? 'border-kapwa-border-success bg-kapwa-bg-success-weak' : 'bg-kapwa-bg-surface border-kapwa-border-weak'}`}
                      >
                        <div>
                          <p
                            className={`text-sm font-bold ${bidder.isWinner ? 'text-kapwa-text-success' : 'text-kapwa-text-support'}`}
                          >
                            {bidder.name}
                          </p>
                          {bidder.pcabId && (
                            <p className='text-xs text-kapwa-text-disabled'>
                              PCAB: {bidder.pcabId}
                            </p>
                          )}
                        </div>
                        <div className='text-right'>
                          {bidder.isWinner && (
                            <Badge variant='success' className='mb-1'>
                              {t('project.winner')}
                            </Badge>
                          )}
                          <p className='font-mono text-xs text-kapwa-text-disabled'>
                            {bidder.participation}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DetailSection>

          {/* Procurement Details (New Section!) */}
          {project.procurement && (
            <DetailSection
              title={t('project.sections.procurement')}
              icon={Gavel}
            >
              <div className='space-y-6'>
                <InfoRow
                  label={t('project.fields.contractName')}
                  value={project.procurement.contractName}
                />
                <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
                  <InfoRow
                    label={t('project.fields.abc')}
                    value={project.procurement.abc}
                  />
                  <InfoRow
                    label={t('project.fields.awardAmount')}
                    value={project.procurement.awardAmount}
                  />
                  <InfoRow
                    label={t('project.fields.statusCode')}
                    value={project.procurement.status}
                  />
                  <InfoRow
                    label={t('project.fields.fundingInstrument')}
                    value={project.procurement.fundingInstrument}
                  />
                </div>
                <div className='grid grid-cols-1 gap-4 pt-4 border-t border-kapwa-border-weak sm:grid-cols-3'>
                  <InfoRow
                    label={t('project.fields.advertisement')}
                    value={showDateTime(project.procurement.advertisementDate)}
                  />
                  <InfoRow
                    label={t('project.fields.bidSubmission')}
                    value={showDateTime(
                      project.procurement.bidSubmissionDeadline
                    )}
                  />
                  <InfoRow
                    label={t('project.fields.awardDate')}
                    value={showDateTime(project.procurement.dateOfAward)}
                  />
                </div>
              </div>
            </DetailSection>
          )}

          {/* Project Components (New Section!) */}
          {project.components && project.components.length > 0 && (
            <DetailSection
              title={t('project.sections.components', {
                count: project.components.length,
              })}
              icon={Layers}
            >
              <div className='space-y-3'>
                {project.components.map((comp, idx) => (
                  <div
                    key={idx}
                    className='p-4 rounded-xl border border-kapwa-border-weak bg-kapwa-bg-surface-raised'
                  >
                    <div className='flex justify-between items-start mb-2'>
                      <h4 className='text-sm font-bold text-kapwa-text-strong'>
                        {t('project.component', { number: idx + 1 })}
                      </h4>
                      <span className='border-kapwa-border-weak bg-kapwa-bg-surface text-kapwa-text-disabled rounded border px-1.5 py-0.5 font-mono text-[10px]'>
                        {comp.componentId}
                      </span>
                    </div>
                    <p className='mb-3 text-xs leading-relaxed text-kapwa-text-support'>
                      {comp.description}
                    </p>
                    <div className='grid grid-cols-2 gap-2 text-xs'>
                      <p>
                        <span className='text-kapwa-text-disabled'>
                          {t('project.componentType')}
                        </span>{' '}
                        <span className='font-medium text-kapwa-text-strong'>
                          {comp.infraType}
                        </span>
                      </p>
                      <p>
                        <span className='text-kapwa-text-disabled'>
                          {t('project.componentWork')}
                        </span>{' '}
                        <span className='font-medium text-kapwa-text-strong'>
                          {comp.typeOfWork}
                        </span>
                      </p>
                      <p>
                        <span className='text-kapwa-text-disabled'>
                          {t('project.componentCoords')}
                        </span>{' '}
                        <span className='font-mono text-kapwa-text-support'>
                          {comp.coordinates?.latitude.toFixed(5)},{' '}
                          {comp.coordinates?.longitude.toFixed(5)}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </DetailSection>
          )}
        </div>

        {/* RIGHT: ACTIONS & MEDIA */}
        <div className='space-y-6'>
          {/* Documents */}
          <DetailSection
            title={t('project.sections.documents')}
            icon={Download}
          >
            {hasDocuments ? (
              <div className='space-y-2'>
                <DocumentRow
                  label={t('project.documents.advertisement')}
                  url={project.links?.advertisement}
                />
                <DocumentRow
                  label={t('project.documents.noticeOfAward')}
                  url={project.links?.noticeOfAward}
                />
                <DocumentRow
                  label={t('project.documents.contractAgreement')}
                  url={project.links?.contractAgreement}
                />
                <DocumentRow
                  label={t('project.documents.noticeToProceed')}
                  url={project.links?.noticeToProceed}
                />
                <DocumentRow
                  label={t('project.documents.programOfWork')}
                  url={project.links?.programOfWork}
                />
                <DocumentRow
                  label={t('project.documents.engineeringDesign')}
                  url={project.links?.engineeringDesign}
                />
              </div>
            ) : (
              <div className='p-4 text-center rounded-xl border border-dashed border-kapwa-border-weak bg-kapwa-bg-surface-raised'>
                <p className='text-xs font-medium text-kapwa-text-disabled'>
                  {t('project.noDocuments')}
                </p>
              </div>
            )}
          </DetailSection>

          {/* Location */}
          <DetailSection title={t('project.sections.location')} icon={MapPin}>
            <div className='space-y-4'>
              <div>
                <InfoRow
                  label={t('project.fields.regionProvince')}
                  value={`${project.location.region}, ${project.location.province}`}
                />
              </div>

              {project.latitude && project.longitude ? (
                <>
                  <div className='border-kapwa-border-weak bg-kapwa-bg-surface-raised text-kapwa-text-disabled rounded border p-2 text-center font-mono text-[10px]'>
                    {project.latitude.toFixed(6)},{' '}
                    {project.longitude.toFixed(6)}
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${project.latitude},${project.longitude}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='hover:border-kapwa-border-brand hover:text-kapwa-text-brand border-kapwa-border-weak bg-kapwa-bg-surface text-kapwa-text-support flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold shadow-sm transition-all'
                  >
                    {t('project.viewOnMaps')}{' '}
                    <ExternalLink className='w-3 h-3' />
                  </a>
                </>
              ) : (
                <div className='p-4 text-center rounded-xl border border-dashed border-kapwa-border-weak bg-kapwa-bg-surface-raised'>
                  <MapPin className='mx-auto mb-2 w-6 h-6 text-kapwa-text-support' />
                  <p className='text-xs text-kapwa-text-disabled'>
                    {t('project.noCoordinates')}
                  </p>
                </div>
              )}
            </div>
          </DetailSection>

          {/* Images */}
          {project.imageSummary && (
            <DetailSection
              title={t('project.sections.images')}
              icon={ImageIcon}
            >
              <div className='flex justify-between items-center'>
                <span className='text-sm text-kapwa-text-support'>
                  {t('project.totalImages')}
                </span>
                <span className='font-bold text-kapwa-text-strong'>
                  {project.imageSummary.totalImages}
                </span>
              </div>
              {project.imageSummary.latestImageDate && (
                <div className='flex justify-between items-center pt-2 mt-2 border-t border-kapwa-border-weak'>
                  <span className='text-xs text-kapwa-text-disabled'>
                    {t('project.latestImage')}
                  </span>
                  <span className='text-xs font-medium text-kapwa-text-support'>
                    {showDate(project.imageSummary.latestImageDate)}
                  </span>
                </div>
              )}
            </DetailSection>
          )}

          {/* Live Stream */}
          {project.isLive && project.livestreamUrl && (
            <div className='p-5 rounded-2xl border-2 border-kapwa-border-danger bg-kapwa-bg-danger-weak'>
              <div className='flex gap-2 items-center mb-3 text-kapwa-text-danger'>
                <Video className='w-5 h-5 animate-pulse' />
                <span className='font-bold'>{t('project.liveFeed')}</span>
              </div>
              <a
                href={project.livestreamUrl}
                target='_blank'
                rel='noreferrer'
                className='flex gap-2 justify-center items-center py-3 w-full font-bold rounded-xl shadow-lg transition-colors bg-kapwa-bg-danger-default text-kapwa-text-inverse hover:bg-kapwa-bg-danger-default'
              >
                {t('project.watchStream')} <ExternalLink className='w-4 h-4' />
              </a>
            </div>
          )}

          {/* Bisto Link */}
          <div className='p-4 rounded-xl border border-kapwa-border-weak bg-kapwa-bg-surface-raised'>
            <p className='mb-3 text-xs leading-relaxed text-kapwa-text-disabled'>
              {t('project.verifyNational')}
            </p>
            <a
              href={`https://bisto.ph/project/${encodeURIComponent(project.contractId)}`} //waiting for bisto.ph PR
              target='_blank'
              rel='noreferrer'
              className='hover:border-kapwa-border-brand hover:text-kapwa-text-brand border-kapwa-border-weak bg-kapwa-bg-surface text-kapwa-text-support flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold shadow-sm transition-all'
            >
              {t('project.searchBisto')} <Search className='w-3 h-3' />
            </a>
          </div>
        </div>
      </div>

      <div className='pt-8 text-center'>
        <p className='text-xs text-kapwa-text-disabled'>
          {t('project.source')}{' '}
          <a
            href='https://transparency.bettergov.ph/dpwh/'
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex gap-1 items-center font-bold transition-colors text-kapwa-text-brand hover:text-kapwa-text-brand-bold hover:underline'
          >
            {t('project.sourceLink', { portal: config.portal.name })}
            <ExternalLink className='w-3 h-3' />
          </a>
        </p>
      </div>
    </div>
  );
}
