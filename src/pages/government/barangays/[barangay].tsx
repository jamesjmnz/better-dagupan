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

import type { Barangay } from '@/types/directoryTypes';

const barangaysData = barangaysDataRaw as Barangay[];

export default function BarangayDetail() {
  const { t } = useTranslation('common');
  const { barangay: slug } = useParams();
  const barangay = barangaysData.find(b => b.slug === slug);

  if (!barangay)
    return <div className='p-20 text-center'>Barangay not found</div>;

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
              className='text-kapwa-text-disabled h-4 w-4'
            />
            <h2
              id='officials-heading'
              className='kapwa-heading-md text-kapwa-text-strong'
            >
              {t('barangays.officialsTitle')}
            </h2>
          </div>

          {/*
            officials is empty for every record. The only city-government
            roster found covers the 2018-2020 term, so rendering it would
            present former officials as current ones. The section says that
            outright rather than rendering nothing, which would read as though
            the barangay has no officials.
          */}
          {barangay.officials.length === 0 ? (
            <NotVerified
              label={t('barangays.officialsNotVerified')}
              detail={t('barangays.officialsNotVerifiedWhy')}
            />
          ) : null}
        </section>

        {/* --- CONTACT --- */}
        <section className='space-y-3' aria-labelledby='contact-heading'>
          <div className='border-kapwa-border-weak flex items-center gap-2 border-b pb-3'>
            <PhoneIcon
              aria-hidden='true'
              className='text-kapwa-text-disabled h-4 w-4'
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
              <NotVerified label={t('barangays.addressNotVerified')} />
            )}
            {barangay.trunkline.length === 0 && (
              <NotVerified label={t('barangays.contactNotVerified')} />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
