import { GlobeIcon, MapPinIcon, PhoneIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/Badge';

import { getCivicSource } from '@/lib/civicSources';
import { barangayHeading } from '@/lib/stringUtils';

import type { Barangay } from '@/types/directoryTypes';

interface BarangayHeaderProps {
  barangay: Pick<
    Barangay,
    | 'barangay_name'
    | 'name_variants'
    | 'psgc_10_digit_code'
    | 'urban_rural'
    | 'population_2024_popcen'
  > &
    Partial<Pick<Barangay, 'address' | 'trunkline' | 'website'>>;
}

export function BarangayHeader({ barangay }: BarangayHeaderProps) {
  const { t } = useTranslation('common');
  const contactValue = barangay.trunkline?.[0];

  return (
    <header
      className='bg-kapwa-bg-surface border-kapwa-border-weak rounded-xl border p-6 shadow-sm'
      role='banner'
      aria-label='Barangay information header'
    >
      {/* Top Row: Name + Classification */}
      <div className='mb-4 flex items-center justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <MapPinIcon
            aria-hidden='true'
            className='text-kapwa-text-brand h-5 w-5'
          />
          {/*
            The PSGC name is rendered verbatim. Passing it through
            toTitleCase() would print "Barangay Ii" for Barangay II.
          */}
          <h1 className='kapwa-heading-lg text-kapwa-text-strong'>
            {barangayHeading(barangay.barangay_name)}
          </h1>
        </div>
        <Badge variant='slate' dot>
          {t(`barangays.${barangay.urban_rural}`)}
        </Badge>
      </div>

      {/*
        Spellings found on other pages. The only such page is the city's
        2018-2020 barangay table, so these are labelled historical and given
        the period they come from. Calling them "also written as" would imply
        they might be current, which this portal has no evidence for.
      */}
      {barangay.name_variants.length > 0 && (
        <div className='mb-4'>
          <ul className='space-y-0.5'>
            {barangay.name_variants.map(variant => {
              const source = getCivicSource(variant.source);

              return (
                <li
                  key={variant.name}
                  className='text-kapwa-text-disabled text-xs italic'
                >
                  {t('civic.historicalSpelling', {
                    period: source.coverage ?? '',
                    name: variant.name,
                  })}
                  {' — '}
                  {source.agency}
                </li>
              );
            })}
          </ul>
          <p className='text-kapwa-text-disabled mt-1 text-[11px] not-italic'>
            {t('civic.historicalSpellingNote')}
          </p>
        </div>
      )}

      {/* Verified PSGC figures */}
      <dl className='mb-4 flex flex-wrap gap-x-8 gap-y-2 text-sm'>
        <div>
          <dt className='text-kapwa-text-disabled text-[10px] font-bold tracking-widest uppercase'>
            {t('barangays.psgcCode')}
          </dt>
          <dd className='text-kapwa-text-support font-mono'>
            {barangay.psgc_10_digit_code}
          </dd>
        </div>
        <div>
          <dt className='text-kapwa-text-disabled text-[10px] font-bold tracking-widest uppercase'>
            {t('barangays.population')}
          </dt>
          <dd className='text-kapwa-text-support'>
            {barangay.population_2024_popcen.toLocaleString('en-PH')}{' '}
            <span className='text-kapwa-text-disabled text-xs'>
              ({t('barangays.populationNote')})
            </span>
          </dd>
        </div>
      </dl>

      {/* Address and contact appear only when a source establishes them. */}
      {barangay.address && (
        <p className='text-kapwa-text-support mb-4 text-sm'>
          {barangay.address}
        </p>
      )}

      {(contactValue || barangay.website) && (
        <div className='flex flex-col gap-4 text-sm md:flex-row md:gap-6'>
          {contactValue && (
            <a
              href={`tel:${contactValue}`}
              className='text-kapwa-text-support hover:text-kapwa-text-brand flex items-center gap-2 transition-colors'
            >
              <PhoneIcon aria-hidden='true' className='h-4 w-4' />
              <span>{contactValue}</span>
            </a>
          )}
          {barangay.website && (
            <a
              href={barangay.website}
              target='_blank'
              rel='noreferrer'
              className='text-kapwa-text-support hover:text-kapwa-text-brand flex items-center gap-2 transition-colors'
            >
              <GlobeIcon aria-hidden='true' className='h-4 w-4' />
              <span>{barangay.website}</span>
            </a>
          )}
        </div>
      )}
    </header>
  );
}
