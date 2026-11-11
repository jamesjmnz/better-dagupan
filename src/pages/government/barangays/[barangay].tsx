import { useParams } from 'react-router-dom';

import { PhoneIcon, UsersIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { NotVerified, SourceNote } from '@/components/civic';
import { BarangayHeader } from '@/components/government/BarangayHeader';
import {
  Breadcrumb,
  BreadcrumbHome,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/navigation/Breadcrumb';

import barangaysDataRaw from '@/data/directory/barangays.json';

import type {
  Barangay,
  BarangayOfficial,
  BarangaySeat,
  OfficialNameStatus,
} from '@/types/directoryTypes';

const barangaysData = barangaysDataRaw as Barangay[];

/** The i18n key naming each seat, so the title follows the reader's language. */
const SEAT_LABEL: Record<BarangaySeat, string> = {
  punong_barangay: 'barangays.punongBarangay',
  sk_chairperson: 'barangays.skChairperson',
};

/** The i18n key explaining why a seat's holder is withheld. */
function withheldNameKey(status: OfficialNameStatus): string {
  return status === 'conflicting_sources'
    ? 'barangays.nameNotVerifiedConflict'
    : 'barangays.nameNotVerifiedUncorroborated';
}

/**
 * Every citation behind the officials section, deduplicated in first-seen
 * order: the sources naming each holder, then the laws establishing the term.
 */
function officialsSources(officials: BarangayOfficial[]): string[] {
  return [
    ...new Set([
      ...officials.flatMap(official => official.sources),
      ...officials.flatMap(official => official.term_sources),
    ]),
  ];
}

export default function BarangayDetail() {
  const { t } = useTranslation(['common', 'government']);
  const { barangay: slug } = useParams();
  const barangay = barangaysData.find(b => b.slug === slug);

  if (!barangay)
    return (
      <div className='p-20 text-center'>
        {t('government:barangays.notFound')}
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
            <BreadcrumbLink href='/government/barangays'>
              {t('barangays.title')}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{barangay.barangay_name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* --- IDENTITY HEADER --- */}
      <BarangayHeader barangay={barangay} />

      {/* Where every figure above came from, and when it was last checked. */}
      <SourceNote sources={barangay.sources} />

      {/*
        A plain wrapper, not a <main id='main-content'>: the app shell in
        src/App.tsx already provides that landmark and the skip link that
        targets it, and repeating the id here made it a duplicate.
      */}
      <div className='space-y-6'>
        {/* --- OFFICIALS --- */}
        <section className='space-y-3' aria-labelledby='officials-heading'>
          <div className='border-kapwa-border-weak flex items-center gap-2 border-b pb-3'>
            <UsersIcon
              aria-hidden='true'
              className='text-kapwa-text-support h-4 w-4'
            />
            <h2
              id='officials-heading'
              className='kapwa-heading-md text-kapwa-text-strong'
            >
              {t('barangays.officialsTitle')}
            </h2>
          </div>

          {/*
            Every seat is listed whether or not its holder is published. A
            withheld name says why, so the seat never reads as vacant.
          */}
          <ul className='grid grid-cols-1 gap-3 md:grid-cols-2'>
            {barangay.officials.map(official => (
              <li
                key={official.seat}
                className='border-kapwa-border-weak bg-kapwa-bg-surface rounded-xl border p-4'
              >
                <p className='text-kapwa-text-brand text-[10px] font-bold tracking-widest uppercase'>
                  {t(SEAT_LABEL[official.seat])}
                </p>
                {official.name ? (
                  /*
                    Rendered verbatim, as the city's roster prints it.
                    toTitleCase() would turn "DV." into "Dv.".
                  */
                  <p className='text-kapwa-text-strong mt-1 text-lg leading-tight font-bold'>
                    {official.name}
                  </p>
                ) : (
                  <NotVerified
                    label={t('barangays.nameNotVerified')}
                    detail={t(withheldNameKey(official.name_status))}
                    className='mt-2'
                  />
                )}
                {official.term && (
                  <p className='text-kapwa-text-support mt-2 text-xs font-medium'>
                    {t('barangays.term', { term: official.term })}
                  </p>
                )}
              </li>
            ))}
          </ul>

          <NotVerified
            label={t('barangays.councilNotVerified')}
            detail={t('barangays.councilNotVerifiedWhy')}
          />

          <p className='text-kapwa-text-support text-xs leading-relaxed'>
            {t('barangays.termNote')}
          </p>

          {/* Who names each holder, and the laws the term follows from. */}
          <SourceNote sources={officialsSources(barangay.officials)} />
        </section>

        {/* --- CONTACT --- */}
        <section className='space-y-3' aria-labelledby='contact-heading'>
          <div className='border-kapwa-border-weak flex items-center gap-2 border-b pb-3'>
            <PhoneIcon
              aria-hidden='true'
              className='text-kapwa-text-support h-4 w-4'
            />
            <h2
              id='contact-heading'
              className='kapwa-heading-md text-kapwa-text-strong'
            >
              {t('barangays.contactTitle')}
            </h2>
          </div>

          <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
            {barangay.address === null && (
              <NotVerified
                label={t('barangays.addressNotVerified')}
                detail={t('barangays.contactNotVerifiedWhy')}
              />
            )}
            {barangay.trunkline.length === 0 && (
              <NotVerified
                label={t('barangays.contactNotVerified')}
                detail={t('barangays.contactNotVerifiedWhy')}
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
