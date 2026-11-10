import { useMemo, useState } from 'react';

import { Link } from 'react-router-dom';

import { BookOpenIcon, ChevronLeft, User2, UsersIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { NotVerified, SourceNote } from '@/components/civic';
import { PageHero } from '@/components/layout/PageLayouts';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import SearchInput from '@/components/ui/SearchInput';

import { lguLabels } from '@/lib/lguLabels';

import legislativeDataRaw from '@/data/directory/legislative.json';

import type { LegislativeChamber } from '@/types/directoryTypes';

const legislativeData = legislativeDataRaw as LegislativeChamber[];

/**
 * An LGU has one legislative council. This page used to look it up by the
 * inherited slug '12th-sangguniang-bayan', which matched nothing here.
 */
const council: LegislativeChamber | null = legislativeData[0] ?? null;

export default function MunicipalCommitteesPage() {
  const { t } = useTranslation('common');
  const [searchTerm, setSearchTerm] = useState('');

  const chamber = council?.chamber ?? lguLabels.body;
  const committees = useMemo(() => council?.permanent_committees ?? [], []);
  const isPublished = council?.committees_status === 'published';

  const filteredCommittees = useMemo(() => {
    const q = searchTerm.toLowerCase();
    if (!q) return committees;
    return committees.filter(
      c =>
        c.committee.toLowerCase().includes(q) ||
        c.chairperson.toLowerCase().includes(q) ||
        c.members.some(m => m.name.toLowerCase().includes(q))
    );
  }, [committees, searchTerm]);

  const committeeSources = [...new Set(committees.flatMap(c => c.sources))];

  return (
    <>
      <PageHero
        title={t('electedOfficials.committeesTitle')}
        description={t('electedOfficials.committees.description', {
          chamber,
        })}
        breadcrumb={[
          { label: t('navbar.government'), href: '/government' },
          {
            label: t('government.electedofficialsTitle'),
            href: '/government/elected-officials',
          },
          {
            label: t('electedOfficials.committeesTitle'),
            href: '/government/elected-officials/committees',
          },
        ]}
      >
        {/* Nothing to search until assignments are published. */}
        {isPublished && (
          <SearchInput
            value={searchTerm}
            onChangeValue={setSearchTerm}
            placeholder={t('electedOfficials.committees.searchPlaceholder')}
            className='md:w-72'
          />
        )}
      </PageHero>

      {/* Back link */}
      <div className='flex items-center gap-1.5'>
        <Link
          to='/government/elected-officials'
          className='text-kapwa-text-brand hover:text-kapwa-text-brand-bold flex items-center gap-1 text-[11px] font-bold tracking-widest uppercase transition-colors'
        >
          <ChevronLeft aria-hidden='true' className='h-3.5 w-3.5' />
          {t('electedOfficials.committees.backToOfficials')}
        </Link>
      </div>

      {!isPublished ? (
        /*
          Withheld assignments are a fact about this portal, not about the
          council. Say which of the two reasons applies rather than render an
          empty grid that reads as a council with no committees.
        */
        <NotVerified
          label={t('electedOfficials.committees.withheld')}
          detail={t(
            council?.committees_status === 'conflicting_sources'
              ? 'electedOfficials.committees.withheldConflict'
              : 'electedOfficials.committees.withheldUncorroborated'
          )}
        />
      ) : filteredCommittees.length === 0 ? (
        <EmptyState
          icon={BookOpenIcon}
          title={t('electedOfficials.committees.noMatches', {
            query: searchTerm,
          })}
          message=''
        />
      ) : (
        <div className='grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {filteredCommittees.map(committee => (
            <Card
              key={committee.committee}
              hover
              className='border-kapwa-border-weak flex h-full flex-col shadow-xs'
            >
              <CardContent className='flex h-full flex-col space-y-4 p-4'>
                {/* Top Row: Icon & Title */}
                <div className='flex items-start gap-3'>
                  <div className='bg-kapwa-bg-accent-orange-weak text-kapwa-text-accent-orange border-kapwa-border-weak shrink-0 rounded-lg border p-2 shadow-sm'>
                    <BookOpenIcon aria-hidden='true' className='h-5 w-5' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <h3 className='text-kapwa-text-strong text-base leading-tight font-bold'>
                      {committee.committee}
                    </h3>
                    <p className='text-kapwa-text-disabled mt-0.5 text-[10px] font-bold tracking-widest uppercase'>
                      {t('electedOfficials.committees.standingCommittee')}
                    </p>
                  </div>
                </div>

                {/* Chairperson Highlight Box */}
                <div className='border-kapwa-border-weak bg-kapwa-bg-surface-raised/50 flex items-center gap-2 rounded-xl border px-3 py-2.5'>
                  <div className='border-kapwa-border-weak bg-kapwa-bg-surface text-kapwa-text-disabled shrink-0 rounded-full border p-1 shadow-sm'>
                    <User2 aria-hidden='true' className='h-3.5 w-3.5' />
                  </div>
                  <div className='min-w-0'>
                    <p className='text-kapwa-text-disabled mb-0.5 text-[9px] font-bold tracking-tighter uppercase'>
                      {t('electedOfficials.committees.chairperson')}
                    </p>
                    <p className='text-kapwa-text-strong truncate text-xs leading-tight font-bold'>
                      {committee.chairperson}
                    </p>
                  </div>
                </div>

                {/* Member List */}
                {committee.members.length > 0 && (
                  <div className='border-kapwa-border-weak border-t pt-2'>
                    <div className='mb-2.5 flex items-center gap-1.5'>
                      <UsersIcon
                        aria-hidden='true'
                        className='text-kapwa-text-accent-orange h-3 w-3'
                      />
                      <p className='text-kapwa-text-disabled text-[9px] font-bold tracking-widest uppercase'>
                        {t('electedOfficials.committees.members', {
                          count: committee.members.length,
                        })}
                      </p>
                    </div>
                    <div className='space-y-1.5'>
                      {committee.members.map(member => (
                        <div
                          key={member.name}
                          className='flex items-center justify-between gap-2'
                        >
                          <p className='text-kapwa-text-support truncate text-[11px] font-medium'>
                            {member.name}
                          </p>
                          {member.role && (
                            <span className='text-kapwa-text-disabled bg-kapwa-bg-surface-raised shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase'>
                              {member.role}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary footer and citations, once there is something to cite. */}
      {isPublished && filteredCommittees.length > 0 && (
        <>
          <p className='text-kapwa-text-disabled text-center text-xs'>
            {t('electedOfficials.committees.showing', {
              shown: filteredCommittees.length,
              total: committees.length,
            })}
          </p>
          <SourceNote sources={committeeSources} />
        </>
      )}
    </>
  );
}
