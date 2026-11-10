import { FC } from 'react';

import { AlertCircleIcon, ChevronRightIcon, PhoneIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { NotVerified } from '@/components/civic/NotVerified';
import { SourceNote } from '@/components/civic/SourceNote';

import { config } from '@/lib/lguConfig';
import { lguLabels } from '@/lib/lguLabels';
import { toTelUri } from '@/lib/utils';

import cityHotlinesRaw from '@/data/directory/hotlines.json';
import hotlinesData from '@/data/philippines_hotlines.json';

import type { CityHotline } from '@/types/directoryTypes';

interface Hotline {
  name: string;
  category: string;
  numbers: string[];
  description?: string;
}

interface CriticalHotlinesWidgetProps {
  /** How many national hotlines to show beneath the city's own. */
  maxItems?: number;
}

const cityHotlines = cityHotlinesRaw as CityHotline[];

/** Every civic source the city group cites, in first-seen order. */
const citySources = [...new Set(cityHotlines.flatMap(h => h.sources))];

/** National numbers such as "117 (Emergency Hotline)" carry a trailing note. */
const nationalTelHref = (number: string) =>
  `tel:${number.replace(/\(.*?\)\s*$/, '').replace(/\D/g, '')}`;

const NumberLink: FC<{ name: string; number: string; href: string }> = ({
  name,
  number,
  href,
}) => {
  const { t } = useTranslation('common');

  return (
    <a
      href={href}
      aria-label={t('hotlines.call', { name, number })}
      className='text-kapwa-text-brand hover:text-kapwa-text-brand-bold flex items-center gap-1 text-sm hover:underline'
    >
      <PhoneIcon aria-hidden='true' className='h-3 w-3 shrink-0' />
      <span className='tabular-nums'>{number}</span>
    </a>
  );
};

/**
 * Emergency numbers: the city government's own list first, then the national
 * hotlines that work from anywhere in the country.
 *
 * The city group shows only numbers that two independent official lists
 * agree on, cites those lists, and says that numbers the city publishes in a
 * single list are held back, so a missing helpline reads as "not yet
 * verified" rather than "does not exist".
 */
const CriticalHotlinesWidget: FC<CriticalHotlinesWidgetProps> = ({
  maxItems = 4,
}) => {
  const { t } = useTranslation('common');

  const nationalHotlines = (hotlinesData.criticalHotlines as Hotline[]).slice(
    0,
    maxItems
  );

  const directoryUrl = `https://hotlines.bettergov.ph/?city=${encodeURIComponent(config.lgu.name)}&province=${encodeURIComponent(config.lgu.province)}`;

  return (
    <section
      aria-labelledby='hotlines-title'
      className='border-kapwa-border-weak bg-kapwa-bg-surface overflow-hidden rounded-lg border shadow-md'
    >
      <div className='bg-kapwa-bg-danger-default flex items-center justify-between gap-2 px-4 py-3'>
        <div className='flex items-center'>
          <AlertCircleIcon
            aria-hidden='true'
            className='text-kapwa-text-inverse mr-2 h-5 w-5'
          />
          <h2 id='hotlines-title' className='text-kapwa-text-inverse font-bold'>
            {t('hotlines.title')}
          </h2>
        </div>
      </div>

      <div className='space-y-6 p-4'>
        <div>
          <h3 className='text-kapwa-text-strong mb-3 text-sm font-bold tracking-wide uppercase'>
            {t('hotlines.cityGroup', { lgu: lguLabels.fullName })}
          </h3>

          {cityHotlines.length > 0 ? (
            <ul className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {cityHotlines.map(hotline => (
                <li key={hotline.slug} className='flex flex-col'>
                  <span className='text-kapwa-text-strong font-medium'>
                    {hotline.name}
                  </span>
                  <span className='text-kapwa-text-support text-xs'>
                    {hotline.full_name
                      ? `${hotline.full_name} · ${t(`hotlines.categories.${hotline.category}`)}`
                      : t(`hotlines.categories.${hotline.category}`)}
                  </span>
                  <div className='mt-1 space-y-1'>
                    {hotline.numbers.map(number => (
                      <NumberLink
                        key={number}
                        name={hotline.name}
                        number={number}
                        href={toTelUri(number) ?? `tel:${number}`}
                      />
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <NotVerified label={t('hotlines.cityNotVerified')} />
          )}

          <NotVerified
            className='mt-4'
            label={t('hotlines.cityWithheld')}
            detail={t('hotlines.cityWithheldHint')}
          />

          <SourceNote className='mt-4' sources={citySources} />
        </div>

        <div className='border-kapwa-border-weak border-t pt-4'>
          <h3 className='text-kapwa-text-strong mb-3 text-sm font-bold tracking-wide uppercase'>
            {t('hotlines.nationalGroup')}
          </h3>
          <ul className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            {nationalHotlines.map(hotline => (
              <li key={hotline.name} className='flex flex-col'>
                <span className='text-kapwa-text-strong font-medium'>
                  {hotline.name}
                </span>
                <div className='mt-1 space-y-1'>
                  {hotline.numbers.map(number => (
                    <NumberLink
                      key={number}
                      name={hotline.name}
                      number={number}
                      href={nationalTelHref(number)}
                    />
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className='border-kapwa-border-weak border-t pt-3 text-center'>
          <a
            href={directoryUrl}
            target='_blank'
            rel='noreferrer'
            className='text-kapwa-text-brand hover:text-kapwa-text-brand-bold inline-flex items-center text-sm font-medium'
          >
            {t('hotlines.viewAll')}
            <ChevronRightIcon aria-hidden='true' className='ml-1 h-4 w-4' />
          </a>
        </div>
      </div>
    </section>
  );
};

export default CriticalHotlinesWidget;
