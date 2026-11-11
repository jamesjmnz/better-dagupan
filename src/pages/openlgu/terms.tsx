import { useMemo } from 'react';

import { Link, useOutletContext } from 'react-router-dom';

import { Calendar, ChevronRight, FileText, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { IndexPageLayout } from '@/components/layout/IndexPageLayout';
import type { BreadcrumbItem } from '@/types/components';
import { Badge } from '@/components/ui/Badge';
import { Card, CardGrid } from '@/components/ui/Card';

import type { DocumentItem, Person, Session, Term } from '@/lib/openlgu';
import { lguLabels } from '@/lib/lguLabels';

interface LegislationContext {
  terms: Term[];
  persons: Person[];
  sessions: Session[];
  documents: DocumentItem[];
}

export default function TermsIndex() {
  const { t } = useTranslation('openlgu');
  const { terms, persons, sessions, documents } =
    useOutletContext<LegislationContext>();

  const termsWithStats = useMemo(() => {
    return terms
      .map(term => {
        const termSessions = sessions.filter(s => s.term_id === term.id);
        const termDocuments = documents.filter(d => {
          if (d.term_id === term.id) return true;
          if (!d.session_id) return false;
          const session = sessions.find(s => s.id === d.session_id);
          return session?.term_id === term.id;
        });

        const executiveMembers = persons.filter(p =>
          p.memberships.some(
            m => m.term_id === term.id && m.chamber === 'executive'
          )
        );

        const legislativeMembers = persons.filter(p =>
          p.memberships.some(
            m => m.term_id === term.id && m.chamber === 'sangguniang-bayan'
          )
        );

        const ordCount = termDocuments.filter(
          d => d.type === 'ordinance'
        ).length;
        const resCount = termDocuments.filter(
          d => d.type === 'resolution'
        ).length;
        const eoCount = termDocuments.filter(
          d => d.type === 'executive_order'
        ).length;

        return {
          ...term,
          sessionCount: termSessions.length,
          documentCount: termDocuments.length,
          executiveCount: executiveMembers.length,
          legislativeCount: legislativeMembers.length,
          ordCount,
          resCount,
          eoCount,
        };
      })
      .sort((a, b) => b.term_number - a.term_number);
  }, [terms, persons, sessions, documents]);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: t('common.home'), href: '/' },
    { label: t('common.openlgu'), href: '/openlgu' },
    { label: t('common.terms'), href: '/openlgu/terms' },
  ];

  return (
    <IndexPageLayout
      title={t('terms.title')}
      description={t('terms.description', { body: lguLabels.body })}
      breadcrumbs={breadcrumbs}
      resultsCount={termsWithStats.length}
      resultsLabel={t('terms.resultsLabel')}
      emptyState={{
        title: t('terms.emptyTitle'),
        message: t('terms.emptyMessage'),
      }}
    >
      <CardGrid columns={3}>
        {termsWithStats.map(term => (
          <Link
            key={term.id}
            to={`/openlgu/term/${term.id}`}
            className='group block'
          >
            <Card
              hover={false}
              className='h-full hover:border-kapwa-border-brand hover:shadow-md'
            >
              <header className='mb-4 flex items-start justify-between'>
                <div>
                  <Badge variant='primary' dot className='mb-2'>
                    {t('common.termBadge', { nth: term.ordinal })}
                  </Badge>
                  <h3 className='group-hover:text-kapwa-text-brand text-kapwa-text-strong text-xl font-bold transition-colors'>
                    {term.name}
                  </h3>
                  <p className='text-kapwa-text-support mt-1 text-sm'>
                    {term.year_range}
                  </p>
                </div>
                <ChevronRight className='group-hover:text-kapwa-text-brand text-kapwa-text-support h-5 w-5 transition-colors' />
              </header>

              <div className='text-kapwa-text-support mb-4 flex items-center gap-2 text-xs'>
                <Calendar className='h-3.5 w-3.5' />
                <span>
                  {term.start_date} — {term.end_date}
                </span>
              </div>

              <div className='border-kapwa-border-weak grid grid-cols-2 gap-3 border-t pt-4'>
                <div className='text-center'>
                  <div className='flex items-center justify-center gap-1'>
                    <Users className='text-kapwa-text-brand h-4 w-4' />
                    <span className='text-kapwa-text-strong text-lg font-bold'>
                      {term.legislativeCount}
                    </span>
                  </div>
                  <p className='text-kapwa-text-support mt-1 text-[10px] font-bold tracking-widest uppercase'>
                    {t('terms.councilors')}
                  </p>
                </div>
                <div className='text-center'>
                  <div className='flex items-center justify-center gap-1'>
                    <FileText className='text-kapwa-text-accent-orange h-4 w-4' />
                    <span className='text-kapwa-text-strong text-lg font-bold'>
                      {term.documentCount}
                    </span>
                  </div>
                  <p className='text-kapwa-text-support mt-1 text-[10px] font-bold tracking-widest uppercase'>
                    {t('terms.documents')}
                  </p>
                </div>
              </div>

              {(term.ordCount > 0 || term.resCount > 0 || term.eoCount > 0) && (
                <div className='mt-3 flex flex-wrap gap-2'>
                  {term.ordCount > 0 && (
                    <span className='bg-kapwa-bg-surface text-kapwa-text-brand rounded-full px-2 py-1 text-[10px] font-bold'>
                      {t('terms.ordShort', { count: term.ordCount })}
                    </span>
                  )}
                  {term.resCount > 0 && (
                    <span className='bg-kapwa-bg-accent-orange-weak text-kapwa-orange-800 rounded-full px-2 py-1 text-[10px] font-bold'>
                      {t('terms.resShort', { count: term.resCount })}
                    </span>
                  )}
                  {term.eoCount > 0 && (
                    <span className='bg-kapwa-yellow-50 text-kapwa-yellow-700 rounded-full px-2 py-1 text-[10px] font-bold'>
                      {t('terms.eoShort', { count: term.eoCount })}
                    </span>
                  )}
                </div>
              )}
            </Card>
          </Link>
        ))}
      </CardGrid>
    </IndexPageLayout>
  );
}
