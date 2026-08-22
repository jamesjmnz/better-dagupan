import { useState } from 'react';

import { Link } from 'react-router-dom';

import { ArrowRight, MapPinIcon, Users2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { SourceNote } from '@/components/civic';
import { PageHero } from '@/components/layout/PageLayouts';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import SearchInput from '@/components/ui/SearchInput';

import { lguLabels } from '@/lib/lguLabels';
import { barangayHeading } from '@/lib/stringUtils';

import barangaysDataRaw from '@/data/directory/barangays.json';

import type { Barangay } from '@/types/directoryTypes';

const barangaysData = barangaysDataRaw as Barangay[];

/** Every citation behind the index, deduplicated, in first-seen order. */
const indexSources = [
  ...new Set(barangaysData.flatMap(barangay => barangay.sources)),
];

/** Matches the PSGC name and any spelling another authoritative source uses. */
function matchesSearch(barangay: Barangay, search: string): boolean {
  const needle = search.trim().toLowerCase();
  if (!needle) return true;

  return [barangay.barangay_name, ...barangay.name_variants.map(v => v.name)]
    .join(' ')
    .toLowerCase()
    .includes(needle);
}

export default function BarangaysIndex() {
  const { t } = useTranslation('common');
  const [search, setSearch] = useState('');

  const filtered = barangaysData
    .filter(barangay => matchesSearch(barangay, search))
    .sort((a, b) => a.barangay_name.localeCompare(b.barangay_name));

  return (
    <>
      <PageHero
        title={t('barangays.title')}
        description={t('barangays.count', {
          count: barangaysData.length,
          lgu: lguLabels.fullName,
        })}
      >
        <SearchInput
          value={search}
          onChangeValue={setSearch}
          placeholder={t('barangays.searchPlaceholder')}
          className='md:w-72'
        />
      </PageHero>

      <SourceNote sources={indexSources} className='mb-6' />

      {filtered.length === 0 ? (
        <EmptyState title={t('barangays.noMatches')} message='' />
      ) : (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {filtered.map(barangay => (
            <Link
              key={barangay.slug}
              to={barangay.slug}
              className='group block h-full'
              aria-label={t('barangays.profileOf', {
                name: barangayHeading(barangay.barangay_name),
              })}
            >
              <Card
                hover
                className='border-kapwa-border-weak flex h-full flex-col shadow-xs'
              >
                <CardContent className='flex h-full flex-col space-y-4 p-4'>
                  {/* Top Row: Icon and Title */}
                  <div className='flex items-start gap-3'>
                    <div className='bg-kapwa-bg-surface text-kapwa-text-brand border-kapwa-border-brand group-hover:bg-kapwa-bg-brand-default group-hover:text-kapwa-text-inverse shrink-0 rounded-lg border p-2 shadow-sm transition-colors'>
                      <MapPinIcon className='h-5 w-5' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      {/*
                        Rendered verbatim. The PSGC already cases these names
                        correctly, and toTitleCase() would turn "Barangay II"
                        into "Barangay Ii" - see src/lib/stringUtils.test.ts.
                      */}
                      <h3 className='group-hover:text-kapwa-text-brand text-kapwa-text-strong text-base leading-tight font-bold transition-colors'>
                        {barangay.barangay_name}
                      </h3>
                      <p className='text-kapwa-text-disabled mt-0.5 font-mono text-[10px] tracking-wider'>
                        {barangay.psgc_10_digit_code}
                      </p>
                    </div>
                    <ArrowRight className='group-hover:text-kapwa-text-link text-kapwa-text-support mt-1 h-4 w-4 transition-all' />
                  </div>

                  {/* Middle Row: the figures the PSGC actually establishes */}
                  <div className='border-kapwa-border-weak bg-kapwa-bg-surface-raised/50 flex items-center gap-2 rounded-xl border px-3 py-2'>
                    <div className='border-kapwa-border-weak bg-kapwa-bg-surface text-kapwa-text-disabled shrink-0 rounded-full border p-1 shadow-sm'>
                      <Users2 className='h-3.5 w-3.5' />
                    </div>
                    <div className='min-w-0'>
                      <p className='text-kapwa-text-disabled mb-0.5 text-[9px] leading-none font-bold tracking-tighter uppercase'>
                        {t('barangays.population')}
                      </p>
                      <p className='text-kapwa-text-support truncate text-xs leading-tight font-bold'>
                        {barangay.population_2024_popcen.toLocaleString(
                          'en-PH'
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Row: classification & action */}
                  <div className='border-kapwa-border-weak mt-auto flex items-center justify-between gap-4 border-t pt-3'>
                    <span className='text-kapwa-text-disabled text-[11px] font-medium'>
                      {t(`barangays.${barangay.urban_rural}`)}
                    </span>

                    <span className='text-kapwa-text-brand text-[10px] font-black tracking-tighter uppercase opacity-0 transition-opacity group-hover:opacity-100'>
                      {t('barangays.viewProfile')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
