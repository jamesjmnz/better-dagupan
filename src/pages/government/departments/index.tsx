import { useState } from 'react';

import { Link } from 'react-router-dom';

import { ArrowRight, Building2Icon, Globe, Phone, User2 } from 'lucide-react';

import { NotVerified, SourceNote } from '@/components/civic';
import { PageHero } from '@/components/layout/PageLayouts';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import SearchInput from '@/components/ui/SearchInput';

import { lguLabels } from '@/lib/lguLabels';
import { officeIcons } from '@/lib/officeIcons';
import { toTelUri } from '@/lib/utils';

import departmentsDataRaw from '@/data/directory/departments.json';

import type { Department } from '@/types/directoryTypes';

const departmentsData = departmentsDataRaw as Department[];

/** Every citation behind the index, deduplicated, in first-seen order. */
const indexSources = [
  ...new Set(departmentsData.flatMap(department => department.sources)),
];

/**
 * Matches the published office name and any other name the city uses for the
 * same office, so a reader searching "City Engineering Office" still finds the
 * record published as "City Engineer's Office".
 */
function matchesSearch(department: Department, search: string): boolean {
  const needle = search.trim().toLowerCase();
  if (!needle) return true;

  return [
    department.office_name,
    ...department.name_variants.map(variant => variant.name),
  ]
    .join(' ')
    .toLowerCase()
    .includes(needle);
}

export default function DepartmentsIndex() {
  const [search, setSearch] = useState('');

  const filtered = departmentsData
    .filter(department => matchesSearch(department, search))
    .sort((a, b) => a.office_name.localeCompare(b.office_name));

  return (
    <>
      <PageHero
        title={`${lguLabels.adjective} Departments`}
        description={`${departmentsData.length} offices of the ${lguLabels.fullName}, as published by the city government.`}
      >
        <SearchInput
          value={search}
          onChangeValue={setSearch}
          placeholder='Search by office name (e.g. City Treasury)…'
          className='md:w-72'
        />
      </PageHero>

      {/* Where every office on this page came from, and when it was checked. */}
      <SourceNote sources={indexSources} className='mb-6' />

      {filtered.length === 0 ? (
        <EmptyState title='No office name matches that search.' message='' />
      ) : (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {filtered.map(dept => {
            const Icon = officeIcons[dept.slug] || Building2Icon;
            const phone = dept.trunkline[0];

            return (
              <Link
                key={dept.slug}
                to={dept.slug}
                className='group block h-full'
                aria-label={`View details for ${dept.office_name}`}
              >
                <Card
                  hover
                  className='border-kapwa-border-weak flex h-full flex-col shadow-xs'
                >
                  <CardContent className='flex h-full flex-col space-y-4 p-4'>
                    {/* Top Row: Icon and Title */}
                    <div className='flex items-start gap-3'>
                      <div className='bg-kapwa-bg-surface text-kapwa-text-brand border-kapwa-border-brand group-hover:bg-kapwa-bg-brand-default group-hover:text-kapwa-text-inverse shrink-0 rounded-lg border p-2 shadow-sm transition-colors'>
                        <Icon className='h-5 w-5' />
                      </div>
                      <div className='min-w-0 flex-1'>
                        {/*
                          Rendered verbatim. The city already cases these names
                          for display, and formatGovName()/toTitleCase()
                          lowercase a whole word before recapitalising it, which
                          mangles the acronyms these names carry.
                        */}
                        <h3 className='group-hover:text-kapwa-text-brand text-kapwa-text-strong text-sm leading-tight font-bold transition-colors md:text-base'>
                          {dept.office_name}
                        </h3>
                      </div>
                      <ArrowRight className='group-hover:text-kapwa-text-link text-kapwa-text-support mt-1 h-4 w-4 transition-all' />
                    </div>

                    {/* Middle Row: Leadership */}
                    {dept.department_head ? (
                      <div className='border-kapwa-border-weak bg-kapwa-bg-surface-raised/50 flex items-center gap-2 rounded-xl border px-3 py-2'>
                        <div className='border-kapwa-border-weak bg-kapwa-bg-surface text-kapwa-text-disabled shrink-0 rounded-full border p-1 shadow-sm'>
                          <User2 className='h-3.5 w-3.5' />
                        </div>
                        <div className='min-w-0'>
                          <p className='text-kapwa-text-disabled mb-0.5 text-[9px] leading-none font-bold tracking-tighter uppercase'>
                            Department Head
                          </p>
                          <p className='text-kapwa-text-support truncate text-xs leading-tight font-bold'>
                            {dept.department_head.name}
                          </p>
                        </div>
                      </div>
                    ) : (
                      /*
                        Previously an aria-hidden spacer, which told the reader
                        nothing. A withheld head is a fact about this portal,
                        not about the office, so it is stated.
                      */
                      <NotVerified label='Head not published' detail='' />
                    )}

                    {/* Bottom Row: Contact & Website */}
                    <div className='border-kapwa-border-weak mt-auto flex items-center justify-between gap-4 border-t pt-3'>
                      {phone ? (
                        <a
                          href={toTelUri(phone) || '#'}
                          className='text-kapwa-text-disabled hover:text-kapwa-text-brand flex items-center gap-1.5 text-[11px] font-medium transition-colors'
                        >
                          <Phone className='text-kapwa-text-brand h-3 w-3' />
                          <span>{phone}</span>
                        </a>
                      ) : (
                        /*
                          Not "No contact": that would tell a reader the office
                          has no phone number, which is not something we know.
                        */
                        <div className='text-kapwa-text-support text-[10px] italic'>
                          No verified contact number
                        </div>
                      )}

                      <div className='flex items-center gap-2'>
                        {dept.website && (
                          <div
                            className='bg-kapwa-bg-surface text-kapwa-text-brand rounded-md p-1.5'
                            title='Website Available'
                          >
                            <Globe className='h-3.5 w-3.5' />
                          </div>
                        )}
                        <span className='text-kapwa-text-brand text-[10px] font-black tracking-tighter uppercase opacity-0 transition-opacity group-hover:opacity-100'>
                          View Profile
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
