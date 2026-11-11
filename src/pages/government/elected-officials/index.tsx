import { Link } from 'react-router-dom';

import { SiFacebook } from '@icons-pack/react-simple-icons';
import {
  ArrowRight,
  BookOpenIcon,
  Briefcase,
  Gavel,
  GlobeIcon,
  Landmark,
  MapPinIcon,
  ShieldCheck,
  UserIcon,
  UsersIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { NotVerified, SourceNote } from '@/components/civic';
import {
  ContactContainer,
  ContactItem,
} from '@/components/data-display/ContactInfo';
import { DetailSection, PageHero } from '@/components/layout/PageLayouts';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';

import { lguLabels } from '@/lib/lguLabels';

import executiveDataRaw from '@/data/directory/executive.json';
import legislativeDataRaw from '@/data/directory/legislative.json';

import type {
  CouncilOfficial,
  ExecutiveOfficial,
  LegislativeChamber,
  OfficialNameStatus,
  PermanentCommittee,
} from '@/types/directoryTypes';

const executiveData = executiveDataRaw as ExecutiveOfficial[];
const legislativeData = legislativeDataRaw as LegislativeChamber[];

/**
 * An LGU has one legislative council, so the chamber is the first record.
 *
 * This used to be looked up by the inherited slug '12th-sangguniang-bayan',
 * which matched nothing here, so the whole council section silently vanished
 * instead of saying that no roster had been published.
 */
/**
 * A plain styled link. These used to be a kapwa <Button> inside a <Link>,
 * which nested one interactive element in another and brought the button's
 * raw gray utility classes into a page that must use semantic tokens only.
 */
const OUTLINE_LINK =
  'border-kapwa-border-weak bg-kapwa-bg-surface text-kapwa-text-strong hover:bg-kapwa-bg-surface-raised focus-visible:ring-kapwa-border-focus inline-flex items-center gap-2 rounded-md border px-3 py-2 text-[10px] font-bold tracking-widest uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none';

const council: LegislativeChamber | null = legislativeData[0] ?? null;

/** The council's presiding officer, recorded once in executive.json. */
const presidingOfficer = council?.presiding_officer
  ? executiveData.find(official => official.slug === council.presiding_officer)
  : undefined;

/**
 * Every citation behind the council section, deduplicated in first-seen
 * order: the chamber's own sources, then each member's.
 */
const councilSources = council
  ? [
      ...new Set([
        ...council.sources,
        ...council.officials.flatMap(member => member.sources),
      ]),
    ]
  : [];

/** The i18n key explaining why a seat's holder is withheld. */
function withheldNameKey(status: OfficialNameStatus): string {
  return status === 'conflicting_sources'
    ? 'electedOfficials.nameNotVerifiedConflict'
    : 'electedOfficials.nameNotVerifiedUncorroborated';
}

// --- Sub-components ---

function ElectedLeaderCard({ leader }: { leader: ExecutiveOfficial }) {
  const { t } = useTranslation('common');
  const isMayor =
    leader.slug.includes('mayor') && !leader.slug.includes('vice');
  const Icon = isMayor ? Landmark : Gavel;

  const card = (
    <Card hover={!!leader.personId} className='group h-full'>
      <CardContent className='flex h-full flex-col items-center space-y-4 py-6 text-center'>
        <div className='relative'>
          <div
            className={`flex h-20 w-20 items-center justify-center rounded-full border-4 shadow-sm ${
              isMayor
                ? 'bg-kapwa-bg-surface border-kapwa-border-brand text-kapwa-text-brand'
                : 'bg-kapwa-bg-surface text-kapwa-text-support border-kapwa-bg-accent-orange-default'
            }`}
          >
            <Icon aria-hidden='true' className='h-10 w-10' />
          </div>
          {isMayor && (
            <div className='bg-kapwa-bg-brand-default text-kapwa-text-inverse border-kapwa-border-inverse absolute -right-1 -bottom-1 rounded-full border-2 p-1.5 shadow-md'>
              <ShieldCheck aria-hidden='true' className='h-3.5 w-3.5' />
            </div>
          )}
        </div>

        <div className='w-full min-w-0 flex-1'>
          <p className='text-kapwa-text-brand mb-1 text-[10px] font-bold tracking-widest uppercase'>
            {leader.office ?? t('electedOfficials.electedOfficial')}
          </p>
          {leader.name ? (
            /*
              Rendered verbatim. toTitleCase() lowercases a whole word before
              recapitalising it, which turned initials such as "DV." and
              suffixes such as "IV" into "Dv." and "Iv".
            */
            <h3 className='text-kapwa-text-strong text-2xl leading-tight font-black'>
              {t('electedOfficials.honorific', { name: leader.name })}
            </h3>
          ) : (
            <NotVerified
              label={t('electedOfficials.nameNotVerified')}
              detail={t(withheldNameKey(leader.name_status))}
              className='text-left'
            />
          )}
          <Badge variant={isMayor ? 'primary' : 'secondary'} className='mt-2'>
            {leader.role}
          </Badge>
          {leader.term ? (
            <p className='text-kapwa-text-support mt-2 text-xs font-medium'>
              {t('electedOfficials.term', { term: leader.term })}
            </p>
          ) : (
            <NotVerified
              label={t('electedOfficials.termNotVerified')}
              detail=''
              className='mt-2 text-left'
            />
          )}
        </div>

        <div className='border-kapwa-border-weak w-full border-t pt-4'>
          {leader.email || leader.phone ? (
            <ContactContainer variant='stack' className='text-left'>
              <ContactItem
                icon={Briefcase}
                label={t('electedOfficials.emailLabel')}
                value={leader.email}
                href={leader.email ? `mailto:${leader.email}` : undefined}
              />
              <ContactItem
                icon={Briefcase}
                label={t('electedOfficials.phoneLabel')}
                value={leader.phone}
              />
            </ContactContainer>
          ) : (
            <NotVerified
              label={t('electedOfficials.contactNotVerified')}
              detail=''
              className='text-left'
            />
          )}
        </div>

        {/* Who names this person in this seat, and when that was checked. */}
        <SourceNote sources={leader.sources} className='w-full text-left' />

        {leader.personId && (
          <div className='border-kapwa-border-weak w-full border-t pt-4'>
            <span className='text-kapwa-text-brand text-sm font-bold'>
              {t('electedOfficials.viewProfile')} →
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return leader.personId ? (
    <Link
      to={`/openlgu/person/${leader.personId}`}
      className='group block h-full'
    >
      {card}
    </Link>
  ) : (
    card
  );
}

function CouncilMemberCard({
  member,
  chairedCommittees,
}: {
  member: CouncilOfficial;
  chairedCommittees: PermanentCommittee[];
}) {
  const { t } = useTranslation('common');
  const seatLabel =
    member.seat === 'ex_officio_liga'
      ? t('electedOfficials.exOfficioLiga')
      : member.seat === 'ex_officio_sk'
        ? t('electedOfficials.exOfficioSk')
        : null;

  const card = (
    <Card
      hover={!!member.personId}
      className={`group flex h-full flex-col shadow-xs ${
        member.personId
          ? 'border-kapwa-border-weak cursor-pointer'
          : 'border-kapwa-border-weak'
      }`}
    >
      <CardContent className='flex h-full flex-col space-y-4 p-4'>
        {/* Row 1: Icon, Role, Name */}
        <div className='flex items-start gap-3'>
          <div className='border-kapwa-border-brand bg-kapwa-bg-surface text-kapwa-text-brand group-hover:bg-kapwa-bg-brand-default group-hover:text-kapwa-text-inverse shrink-0 rounded-lg border p-2 shadow-sm transition-colors'>
            <UserIcon aria-hidden='true' className='h-5 w-5' />
          </div>
          <div className='min-w-0 flex-1'>
            <p className='text-kapwa-text-brand mb-0.5 text-[10px] font-bold tracking-widest uppercase'>
              {member.role}
            </p>
            {member.name ? (
              // Verbatim, for the same reason as the executive cards.
              <h3 className='text-kapwa-text-strong text-base leading-tight font-bold'>
                {member.name}
              </h3>
            ) : (
              <NotVerified
                label={t('electedOfficials.nameNotVerified')}
                detail={t(withheldNameKey(member.name_status))}
              />
            )}
            {seatLabel && (
              <p className='text-kapwa-text-support mt-1 text-[11px] font-medium'>
                {seatLabel}
              </p>
            )}
            {member.term && (
              <p className='text-kapwa-text-support mt-1 text-[11px]'>
                {t('electedOfficials.term', { term: member.term })}
              </p>
            )}
            {member.personId && (
              <p className='text-kapwa-text-brand mt-1 text-[10px] font-medium tracking-wide uppercase'>
                {t('electedOfficials.viewProfile')}
              </p>
            )}
          </div>
        </div>

        {/*
          An ex-officio seat's term follows the office it is held by virtue
          of. No cited source states that term, so say so rather than leave
          the reader to assume it matches the elected members'.
        */}
        {!member.term && (
          <NotVerified
            label={t('electedOfficials.termNotVerified')}
            detail={seatLabel ? t('electedOfficials.exOfficioTermWhy') : ''}
          />
        )}

        {/* Row 2: Committee Chair box */}
        {chairedCommittees.length > 0 ? (
          <div className='border-kapwa-border-weak bg-kapwa-bg-surface-raised/50 flex flex-col gap-2 rounded-xl border p-3'>
            <div className='mb-1 flex items-center gap-2'>
              <BookOpenIcon
                aria-hidden='true'
                className='text-kapwa-text-support h-3 w-3'
              />
              <span className='text-kapwa-text-support text-[10px] font-bold tracking-widest uppercase'>
                {t('electedOfficials.committeeChair')}
              </span>
            </div>
            <ul className='flex flex-col gap-2'>
              {chairedCommittees.map(c => (
                <li
                  key={c.committee}
                  className='border-kapwa-border-weak bg-kapwa-bg-surface flex items-start gap-2 rounded-lg border px-2.5 py-2 shadow-sm'
                >
                  <div className='bg-kapwa-orange-600 mt-0.5 h-8 w-1 shrink-0 rounded-full opacity-80' />
                  <span className='text-kapwa-text-strong text-xs leading-snug font-bold wrap-break-word'>
                    {c.committee}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className='flex-1' />
        )}

        {/* Row 3: Social footer */}
        {member.website && (
          <div className='border-kapwa-border-weak mt-auto flex items-center justify-between border-t pt-3'>
            <span className='text-kapwa-text-support text-[10px] font-medium tracking-wide uppercase'>
              {t('electedOfficials.socialProfile')}
            </span>
            <a
              href={member.website}
              target='_blank'
              rel='noreferrer'
              onClick={e => member.personId && e.stopPropagation()}
              className='hover:border-kapwa-border-brand hover:text-kapwa-text-brand border-kapwa-border-weak bg-kapwa-bg-surface flex items-center gap-2 rounded-lg border px-3 py-1.5 shadow-sm transition-all'
            >
              <span className='text-[10px] font-bold tracking-wider uppercase'>
                {t('electedOfficials.visitPage')}
              </span>
              <SiFacebook aria-hidden='true' className='h-3.5 w-3.5' />
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return member.personId ? (
    <Link to={`/openlgu/person/${member.personId}`} className='group block'>
      {card}
    </Link>
  ) : (
    card
  );
}

// --- Page ---

export default function ElectedOfficialsPage() {
  const { t } = useTranslation('common');

  const electedLeaders = executiveData.filter(o => o.isElected);

  const committees = council?.permanent_committees ?? [];

  const getChairedCommittees = (memberName: string | null) =>
    memberName
      ? committees.filter(
          c => c.chairperson.toLowerCase() === memberName.toLowerCase()
        )
      : [];

  const websiteUrl = council?.website
    ? council.website.startsWith('http')
      ? council.website
      : `https://${council.website}`
    : undefined;

  const electedCount =
    council?.officials.filter(member => member.seat === 'elected').length ?? 0;
  const exOfficioCount = (council?.officials.length ?? 0) - electedCount;

  return (
    <div className='space-y-8'>
      <PageHero
        title={t('government.electedofficialsTitle')}
        description={t('electedOfficials.description', {
          body: lguLabels.body,
          lgu: lguLabels.fullName,
        })}
        breadcrumb={[
          { label: t('navbar.government'), href: '/government' },
          {
            label: t('government.electedofficialsTitle'),
            href: '/government/elected-officials',
          },
        ]}
      />

      {/* ── SECTION 1: EXECUTIVE BRANCH ── */}
      <DetailSection
        title={<h2>{t('electedOfficials.executiveTitle')}</h2>}
        icon={Landmark}
        className='shadow-sm'
      >
        {electedLeaders.length > 0 ? (
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            {electedLeaders.map(leader => (
              <ElectedLeaderCard key={leader.slug} leader={leader} />
            ))}
          </div>
        ) : (
          <NotVerified label={t('electedOfficials.executiveNotVerified')} />
        )}
      </DetailSection>

      {/* ── SECTION 2: LEGISLATIVE BRANCH ── */}
      <DetailSection
        title={<h2>{council?.chamber ?? lguLabels.body}</h2>}
        icon={UsersIcon}
        className='shadow-sm'
      >
        {council ? (
          <>
            {/* Presiding officer, composition and term */}
            <div className='mb-6 space-y-1'>
              {presidingOfficer?.name && (
                <p className='text-kapwa-text-strong text-sm'>
                  <span className='text-kapwa-text-support mr-2 text-[10px] font-bold tracking-widest uppercase'>
                    {t('electedOfficials.presidingOfficer')}
                  </span>
                  {t('electedOfficials.presidingOfficerName', {
                    name: presidingOfficer.name,
                    role: presidingOfficer.role,
                  })}
                </p>
              )}
              <p className='text-kapwa-text-support text-sm'>
                {t('electedOfficials.councilComposition', {
                  elected: electedCount,
                  exOfficio: exOfficioCount,
                })}
                {council.term &&
                  ` ${t('electedOfficials.term', { term: council.term })}`}
              </p>
            </div>

            {/* Chamber contact info */}
            {(council.address || websiteUrl) && (
              <div className='mb-6'>
                <ContactContainer variant='grid' className='md:grid-cols-2'>
                  {council.address && (
                    <ContactItem
                      icon={MapPinIcon}
                      label={t('electedOfficials.officeLocation')}
                      value={council.address}
                    />
                  )}
                  {websiteUrl && (
                    <ContactItem
                      icon={GlobeIcon}
                      label={t('electedOfficials.officialPortal')}
                      value={t('electedOfficials.visitWebsite')}
                      href={websiteUrl}
                      isExternal
                    />
                  )}
                </ContactContainer>
              </div>
            )}

            {/* Council members grid */}
            {council.officials.length > 0 ? (
              <div className='grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3'>
                {council.officials.map(member => (
                  <CouncilMemberCard
                    key={member.slug}
                    member={member}
                    chairedCommittees={getChairedCommittees(member.name)}
                  />
                ))}
              </div>
            ) : (
              <NotVerified
                label={t('electedOfficials.councilNotVerified', {
                  body: council.chamber,
                })}
              />
            )}

            {/* Where the roster came from, and when it was checked. */}
            <SourceNote sources={councilSources} className='mt-6' />

            {/* Link to committees */}
            <div className='border-kapwa-border-weak mt-6 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row'>
              <div className='flex items-center gap-3'>
                <BookOpenIcon
                  aria-hidden='true'
                  className='text-kapwa-text-support h-5 w-5 shrink-0'
                />
                <div>
                  <p className='text-kapwa-text-strong text-sm font-bold'>
                    {t('electedOfficials.committeesTitle')}
                  </p>
                  <p className='text-kapwa-text-support text-xs'>
                    {council.committees_status === 'published'
                      ? t('electedOfficials.committeesCount', {
                          count: committees.length,
                        })
                      : t('electedOfficials.committeesWithheld')}
                  </p>
                </div>
              </div>
              <Link
                to='/government/elected-officials/committees'
                className={OUTLINE_LINK}
              >
                {t('electedOfficials.viewCommittees')}
                <ArrowRight aria-hidden='true' className='h-3 w-3' />
              </Link>
            </div>
          </>
        ) : (
          <NotVerified
            label={t('electedOfficials.councilNotVerified', {
              body: lguLabels.body,
            })}
          />
        )}
      </DetailSection>

      {/* ── SECTION 3: DEPARTMENTS BRIDGE ── */}
      <div className='border-kapwa-border-weak bg-kapwa-bg-surface-raised flex flex-col items-center justify-between gap-4 rounded-2xl border p-6 md:flex-row'>
        <div className='flex items-center gap-4'>
          <Briefcase
            aria-hidden='true'
            className='text-kapwa-text-support h-8 w-8 shrink-0'
          />
          <div>
            <h2 className='text-kapwa-text-strong font-bold'>
              {t('electedOfficials.departmentsBridgeTitle')}
            </h2>
            <p className='text-kapwa-text-support text-sm'>
              {t('electedOfficials.departmentsBridgeBody', {
                adjective: lguLabels.adjective,
              })}
            </p>
          </div>
        </div>
        <Link to='/government/departments' className={OUTLINE_LINK}>
          {t('electedOfficials.goToDepartments')}
          <ArrowRight aria-hidden='true' className='h-3 w-3' />
        </Link>
      </div>
    </div>
  );
}
