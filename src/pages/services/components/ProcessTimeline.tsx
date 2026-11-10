import { ClipboardList, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DetailSection } from '@/components/layout/PageLayouts';
import { ClientStep } from '@/types/citizens-charter';

interface ProcessTimelineProps {
  steps: ClientStep[];
}

export function ProcessTimeline({ steps }: ProcessTimelineProps) {
  const { t } = useTranslation('services');

  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    <DetailSection title={t('timeline.title')} icon={ClipboardList}>
      <div className='space-y-6' data-testid='process-timeline'>
        {steps.map((step, idx) => (
          <div key={idx} className='group'>
            <div className='flex gap-4'>
              <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-kapwa-border-brand bg-kapwa-bg-surface text-sm font-bold text-kapwa-text-brand'>
                {idx + 1}
              </div>
              <div className='flex-1'>
                <div className='flex items-start justify-between gap-4'>
                  <p className='text-kapwa-text-support text-sm leading-relaxed flex-1'>
                    {step.action}
                  </p>
                  {step.url && (
                    <a
                      href={step.url}
                      target='_blank'
                      rel='noreferrer'
                      className='text-kapwa-text-brand hover:text-kapwa-text-accent-orange flex shrink-0 items-center gap-1 text-xs font-bold transition-colors'
                    >
                      {t('timeline.visitPortal')}
                      <ExternalLink className='h-3 w-3' />
                    </a>
                  )}
                </div>

                {/* Sub-steps with letter labels */}
                {step.sub_steps && step.sub_steps.length > 0 && (
                  <div className='mt-3 ml-4 space-y-2'>
                    {step.sub_steps.map((subStep, subIdx) => (
                      <div
                        key={subIdx}
                        className='border-l-2 border-kapwa-border-weak pl-4'
                      >
                        <div className='flex items-start gap-2'>
                          <span className='text-kapwa-text-brand bg-kapwa-bg-brand-weak/20 flex h-5 min-w-5 shrink-0 items-center px-1 justify-center rounded text-xs font-bold'>
                            {subStep.letter}
                          </span>
                          <p className='text-kapwa-text-support text-xs leading-relaxed flex-1'>
                            {subStep.action}
                          </p>
                        </div>

                        {/* Detail items with roman numerals */}
                        {subStep.details && subStep.details.length > 0 && (
                          <div className='mt-2 ml-7 space-y-1'>
                            {subStep.details.map((detail, detailIdx) => (
                              <div
                                key={detailIdx}
                                className='flex items-start gap-2'
                              >
                                <span className='text-kapwa-text-disabled text-xs font-medium'>
                                  {detailIdx + 1 === 1
                                    ? 'i.'
                                    : detailIdx + 1 === 2
                                      ? 'ii.'
                                      : detailIdx + 1 === 3
                                        ? 'iii.'
                                        : detailIdx + 1 === 4
                                          ? 'iv.'
                                          : detailIdx + 1 === 5
                                            ? 'v.'
                                            : `${detailIdx + 1}.`}
                                </span>
                                <p className='text-kapwa-text-support text-xs'>
                                  {detail}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/*
                  What the office does at this step, with the fee and time
                  the charter prints beside each action. A blank cell stays
                  blank rather than being filled from a neighbouring row.
                */}
                {step.agency_actions && step.agency_actions.length > 0 && (
                  <div className='mt-3 ml-4 space-y-2'>
                    <p className='text-kapwa-text-disabled text-[10px] font-bold uppercase tracking-wider'>
                      {t('timeline.agencyActions')}
                    </p>
                    <ul className='space-y-2'>
                      {step.agency_actions.map((agency, agencyIdx) => (
                        <li
                          key={agencyIdx}
                          className='border-l-2 border-kapwa-border-weak pl-4'
                        >
                          <p className='text-kapwa-text-support whitespace-pre-line text-xs leading-relaxed'>
                            {agency.number && (
                              <span className='text-kapwa-text-brand mr-1 font-bold'>
                                {agency.number}
                              </span>
                            )}
                            {agency.action}
                          </p>
                          {(agency.fees || agency.processing_time) && (
                            <p className='mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[11px]'>
                              {agency.fees && (
                                <span>
                                  <span className='text-kapwa-text-disabled font-bold uppercase tracking-wider'>
                                    {t('timeline.fees')}
                                  </span>{' '}
                                  <span className='text-kapwa-text-strong whitespace-pre-line'>
                                    {agency.fees}
                                  </span>
                                </span>
                              )}
                              {agency.processing_time && (
                                <span>
                                  <span className='text-kapwa-text-disabled font-bold uppercase tracking-wider'>
                                    {t('timeline.time')}
                                  </span>{' '}
                                  <span className='text-kapwa-text-strong whitespace-pre-line'>
                                    {agency.processing_time}
                                  </span>
                                </span>
                              )}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Processing time for this step */}
                {step.processing_time && (
                  <div className='mt-2 ml-4 flex items-center gap-2'>
                    <span className='text-kapwa-text-disabled text-[10px] font-bold uppercase tracking-wider'>
                      {t('timeline.time')}
                    </span>
                    <span className='text-kapwa-text-support text-xs'>
                      {step.processing_time}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/*
        The charter's person-responsible column names individual staff on an
        undated page. They are left out, and the reader is told so, rather
        than the column silently disappearing.
      */}
      <p className='text-kapwa-text-support mt-6 text-[11px] leading-relaxed'>
        {t('timeline.staffWithheld')}
      </p>
    </DetailSection>
  );
}
