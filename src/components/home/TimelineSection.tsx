import { useState } from 'react';

import { Button } from '@bettergov/kapwa/button';
import {
  ChevronDown,
  Gavel,
  Landmark,
  LucideIcon,
  MapPin,
  Scroll,
  Users,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { NotVerified } from '@/components/civic/NotVerified';
import { SourceNote } from '@/components/civic/SourceNote';
import { Card, CardContent } from '@/components/ui/Card';

import { NotYetAvailable } from '@/components/ui/NotYetAvailable';

import { formatHistoryDate, historyDateYear } from '@/lib/historyDates';
import { config } from '@/lib/lguConfig';

import highlightsRaw from '@/data/about/highlights.json';
import historyRaw from '@/data/about/history.json';

import type { HistoryHighlight, HistoryMilestone } from '@/types/aboutTypes';

const highlightsData = highlightsRaw as HistoryHighlight[];
const historyData = historyRaw as HistoryMilestone[];

const ICON_MAP: Record<string, LucideIcon> = {
  Scroll,
  MapPin,
  Users,
  Gavel,
  Landmark,
};

const COLLAPSE_LIMIT = 5;

/**
 * The city's legal and civic milestones, each cited to the official text it
 * rests on (docs/civic-data-verification.md). The entries begin with the 1947
 * charter because that is where official texts were found; the section says
 * so with NotVerified rather than implying the city has no earlier history.
 */
export default function TimelineSection() {
  const { t, i18n } = useTranslation('common');
  const [showAll, setShowAll] = useState(false);
  const values = { lgu: config.lgu.name };

  const visibleHistory = showAll
    ? historyData
    : historyData.slice(0, COLLAPSE_LIMIT);

  // A bare heading over an empty timeline reads as broken rather than honest,
  // so say plainly that no verified history has been added yet.
  if (historyData.length === 0 && highlightsData.length === 0) {
    return (
      <section className='border-kapwa-border-weak border-t bg-kapwa-bg-surface-raised py-12'>
        <div className='container mx-auto px-4'>
          <div className='mb-4 text-center'>
            <h2 className='text-kapwa-text-strong text-2xl font-bold md:text-3xl'>
              {t('history.title', values)}
            </h2>
          </div>
          <NotYetAvailable />
        </div>
      </section>
    );
  }

  return (
    <section className='border-kapwa-border-weak border-t py-12 bg-kapwa-bg-surface-raised'>
      <div className='container px-4 mx-auto'>
        <div className='mx-auto mb-10 max-w-2xl text-center'>
          <h2 className='text-2xl font-bold md:text-3xl text-kapwa-text-strong'>
            {t('history.title', values)}
          </h2>
          <p className='mt-2 text-sm text-kapwa-text-support'>
            {t('history.intro')}
          </p>
        </div>

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]'>
          {/* --- Timeline --- */}
          <div className='relative'>
            <div
              aria-hidden='true'
              className='border-l-2 border-kapwa-border-brand absolute top-2 bottom-0 left-4 w-0.5'
            />
            <ol className='space-y-6' aria-label={t('history.timelineLabel')}>
              {visibleHistory.map(event => (
                <li
                  key={event.slug}
                  data-testid='history-milestone'
                  className='relative pl-12'
                >
                  {/* Dot marker */}
                  <div
                    aria-hidden='true'
                    className='flex absolute left-0 top-3 justify-center items-center w-8 h-8'
                  >
                    <div className='w-3 h-3 rounded-full border-2 shadow-sm border-kapwa-border-brand bg-kapwa-bg-surface' />
                  </div>

                  <Card className='shadow-sm border-kapwa-border-weak'>
                    <CardContent className='p-4 sm:p-5'>
                      <div className='flex flex-col gap-3 items-start sm:flex-row sm:gap-4'>
                        <span
                          aria-hidden='true'
                          className='inline-flex justify-center items-center px-3 py-1 text-xs font-bold rounded-lg shadow-sm bg-kapwa-bg-brand-default text-kapwa-text-inverse shrink-0'
                        >
                          {historyDateYear(event.date)}
                        </span>
                        <div className='min-w-0'>
                          <h3 className='text-base font-bold leading-tight text-kapwa-text-strong'>
                            {event.title}
                          </h3>
                          {/*
                            The full date as precisely as the source states
                            it, in a <time> element so assistive technology
                            and machines read the stored value.
                          */}
                          <p className='mt-1 text-xs font-semibold text-kapwa-text-support'>
                            <time dateTime={event.date}>
                              {formatHistoryDate(event.date, i18n.language)}
                            </time>
                            {event.instrument && (
                              <>
                                {' · '}
                                <span>{event.instrument}</span>
                              </>
                            )}
                          </p>
                          <p className='mt-2 text-xs leading-relaxed text-kapwa-text-support sm:text-sm'>
                            {event.description}
                          </p>
                        </div>
                      </div>
                      <SourceNote className='mt-4' sources={event.sources} />
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ol>

            {(showAll || historyData.length <= COLLAPSE_LIMIT) && (
              <div className='mt-6 pl-12'>
                <NotVerified
                  label={t('history.earlierNotVerified')}
                  detail={t('history.earlierNotVerifiedHint')}
                />
              </div>
            )}

            {historyData.length > COLLAPSE_LIMIT && (
              <div className='flex justify-center mt-8'>
                <Button
                  variant='primary'
                  onClick={() => setShowAll(!showAll)}
                  aria-expanded={showAll}
                  className='bg-kapwa-bg-surface text-kapwa-text-brand hover:bg-kapwa-bg-surface-brand'
                  rightIcon={
                    <ChevronDown
                      aria-hidden='true'
                      className={`h-4 w-4 transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`}
                    />
                  }
                >
                  {showAll
                    ? t('history.showLess')
                    : t('history.showMore', {
                        count: historyData.length - COLLAPSE_LIMIT,
                      })}
                </Button>
              </div>
            )}
          </div>

          {/* --- Highlights --- */}
          {highlightsData.length > 0 && (
            <aside aria-labelledby='history-highlights-heading'>
              <h3
                id='history-highlights-heading'
                className='mb-3 text-sm font-bold tracking-wide uppercase text-kapwa-text-support'
              >
                {t('history.highlightsTitle')}
              </h3>
              <ul className='space-y-3'>
                {highlightsData.map(item => {
                  const Icon = ICON_MAP[item.icon] ?? Landmark;
                  return (
                    <li key={item.slug} data-testid='history-highlight'>
                      <Card className='shadow-sm bg-kapwa-bg-surface border-kapwa-border-weak'>
                        <CardContent className='p-5'>
                          <div className='flex gap-3 items-center mb-3'>
                            <div className='flex justify-center items-center w-10 h-10 rounded-xl shadow-sm bg-kapwa-bg-brand-default text-kapwa-text-inverse shrink-0'>
                              <Icon aria-hidden='true' className='w-5 h-5' />
                            </div>
                            <h4 className='text-sm font-bold leading-tight text-kapwa-text-strong'>
                              {item.title}
                            </h4>
                          </div>
                          <p className='text-xs leading-relaxed text-kapwa-text-support'>
                            {item.description}
                          </p>
                          <SourceNote className='mt-3' sources={item.sources} />
                        </CardContent>
                      </Card>
                    </li>
                  );
                })}
              </ul>
            </aside>
          )}
        </div>
      </div>
    </section>
  );
}
