import { FC } from 'react';

import { ButtonLink } from '@/components/ui/ButtonLink';
import {
  ArrowRightIcon,
  BuildingIcon,
  CodeIcon,
  GlobeIcon,
  HeartIcon,
  LightbulbIcon,
  MessageCircleIcon,
  RocketIcon,
  ServerIcon,
  StarIcon,
  TargetIcon,
  UsersIcon,
  ZapIcon,
} from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';

import { config } from '@/lib/lguConfig';
import { SEO } from '@/components/layout/SEO';

const JoinUs: FC = () => {
  const { t } = useTranslation('pages');

  return (
    <div className='min-h-screen bg-linear-to-br from-kapwa-blue-50 via-white to-kapwa-purple-50'>
      <SEO
        title={t('joinUs.seoTitle')}
        description={t('joinUs.seoDescription')}
      />

      {/* Hero Section */}
      <section className='from-kapwa-brand-600 text-kapwa-text-inverse relative overflow-hidden bg-linear-to-r via-kapwa-blue-700 to-kapwa-purple-700'>
        <div className='bg-kapwa-bg-surface-bold absolute inset-0 opacity-10'></div>
        <div className='relative z-10 container mx-auto px-4 py-16 md:py-24'>
          <div className='mx-auto max-w-4xl text-center'>
            <div className='mb-6 flex justify-center'>
              <div className='bg-kapwa-bg-surface/20 rounded-full p-4 backdrop-blur-sm'>
                <UsersIcon className='text-kapwa-text-inverse h-12 w-12' />
              </div>
            </div>
            <h1 className='text-kapwa-text-strong kapwa-heading-xl font-extrabold leading-tight'>
              <Trans
                t={t}
                i18nKey='joinUs.heroTitle'
                components={{
                  highlight: <span className='text-kapwa-text-accent-yellow' />,
                }}
              />
            </h1>
            <p className='mb-8 kapwa-body leading-relaxed text-kapwa-text-inverse/80'>
              <Trans
                t={t}
                i18nKey='joinUs.heroBody'
                values={{ portal: config.portal.name }}
                components={{ strong: <strong /> }}
              />
            </p>
            <div className='flex flex-col justify-center gap-4 sm:flex-row'>
              {config.portal.discordUrl && (
                <ButtonLink
                  href={config.portal.discordUrl}
                  target='_blank'
                  rel='noreferrer'
                  variant='secondary'
                  size='lg'
                  leftIcon={<MessageCircleIcon className='h-5 w-5' />}
                  className='text-kapwa-text-strong transform rounded-lg bg-kapwa-bg-accent-yellow-weak px-8 py-4 shadow-lg transition-all hover:scale-105'
                >
                  {t('joinUs.joinDiscord')}
                </ButtonLink>
              )}
              <ButtonLink
                href='#mission'
                variant='outline'
                size='lg'
                rightIcon={<ArrowRightIcon className='h-5 w-5' />}
                className='hover:text-kapwa-text-brand text-kapwa-text-inverse hover:bg-kapwa-bg-surface rounded-lg border-2 border-white px-8 py-4'
              >
                {t('joinUs.learnMore')}
              </ButtonLink>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className='absolute top-20 left-10 opacity-20'>
          <CodeIcon className='text-kapwa-text-inverse h-24 w-24' />
        </div>
        <div className='absolute right-10 bottom-20 opacity-20'>
          <RocketIcon className='text-kapwa-text-inverse h-32 w-32' />
        </div>
      </section>

      {/* Mission Section */}
      <section id='mission' className='bg-kapwa-bg-surface py-16 md:py-20'>
        <div className='container mx-auto px-4'>
          <div className='mb-12 text-center'>
            <div className='bg-kapwa-bg-brand-weak mb-4 inline-flex items-center justify-center rounded-full p-3'>
              <TargetIcon className='text-kapwa-text-brand h-8 w-8' />
            </div>
            <h2 className='text-kapwa-text-strong mb-4 kapwa-heading-lg font-bold'>
              {t('joinUs.missionTitle')}
            </h2>
            <p className='text-kapwa-text-support mx-auto max-w-3xl text-xl'>
              {t('joinUs.missionLead')}
            </p>
          </div>

          <div className='mx-auto max-w-4xl'>
            <div className='from-kapwa-brand-50 mb-8 rounded-2xl bg-linear-to-r to-kapwa-blue-50 p-8 md:p-12'>
              <p className='text-kapwa-text-support mb-6 text-lg leading-relaxed'>
                <Trans
                  t={t}
                  i18nKey='shared.civictechBefore'
                  components={{ strong: <strong /> }}
                />
                <span className='bg-kapwa-bg-brand-default text-kapwa-text-inverse mx-2 inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold'>
                  <ZapIcon className='mr-1 h-4 w-4' />
                  #civictech
                </span>
                {t('shared.civictechAfter')}
              </p>
              <p className='text-kapwa-text-support text-lg leading-relaxed'>
                <Trans
                  t={t}
                  i18nKey='joinUs.goal'
                  components={{ strong: <strong /> }}
                />
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Provide Section */}
      <section className='bg-kapwa-bg-surface py-16 md:py-20'>
        <div className='container mx-auto px-4'>
          <div className='mb-12 text-center'>
            <h2 className='text-kapwa-text-strong mb-4 kapwa-heading-lg font-bold'>
              {t('shared.provideTitle')}
            </h2>
            <p className='text-kapwa-text-support text-xl'>
              {t('joinUs.provideIntro')}
            </p>
          </div>

          <div className='mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {[
              { icon: ServerIcon, key: 'infrastructure' },
              { icon: UsersIcon, key: 'hackathons' },
              { icon: GlobeIcon, key: 'data' },
              { icon: HeartIcon, key: 'team' },
              { icon: StarIcon, key: 'mentorship' },
              { icon: BuildingIcon, key: 'office' },
            ].map((item, index) => (
              <div
                key={index}
                className='bg-kapwa-bg-surface transform rounded-xl p-6 shadow-xs transition-all hover:-translate-y-1 hover:shadow-md'
              >
                <div className='bg-kapwa-bg-brand-weak mb-4 flex h-12 w-12 items-center justify-center rounded-lg'>
                  <item.icon className='text-kapwa-text-brand h-6 w-6' />
                </div>
                <h3 className='text-kapwa-text-strong mb-2 text-lg font-semibold'>
                  {t(`shared.provide.${item.key}.title`)}
                </h3>
                <p className='text-kapwa-text-support'>
                  {t(`shared.provide.${item.key}.desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Personal Message Section */}
      <section className='text-kapwa-text-inverse relative overflow-hidden bg-linear-to-r from-kapwa-red-900 via-kapwa-gray-900 to-kapwa-purple-900 py-16 md:py-20'>
        <div className='bg-kapwa-bg-surface-bold/30 absolute inset-0'></div>
        <div className='relative z-10 container mx-auto px-4'>
          <div className='mx-auto max-w-5xl text-center'>
            <div className='mb-8 flex justify-center'>
              <div className='rounded-full bg-linear-to-r from-kapwa-yellow-400 to-kapwa-orange-400 p-6 shadow-2xl'>
                <ZapIcon className='text-kapwa-text-strong h-12 w-12' />
              </div>
            </div>
            <h2 className='mb-12 bg-linear-to-r from-kapwa-yellow-300 via-kapwa-orange-300 to-kapwa-red-300 bg-clip-text text-4xl font-black text-transparent md:text-6xl'>
              {t('joinUs.doneWaiting')}
            </h2>
            <div className='rounded-3xl border border-white/20 bg-linear-to-r from-white/20 to-white/10 p-10 shadow-2xl backdrop-blur-lg md:p-16'>
              <blockquote className='space-y-8 text-center kapwa-heading-lg leading-relaxed font-bold'>
                <p className='kapwa-heading-xl font-black tracking-wider text-kapwa-text-accent-yellow uppercase'>
                  {t('joinUs.angry')}
                </p>
                <p className='text-kapwa-text-inverse text-xl md:text-2xl'>
                  <Trans
                    t={t}
                    i18nKey='joinUs.contribute'
                    components={{
                      accent: (
                        <strong className='text-kapwa-text-accent-yellow' />
                      ),
                    }}
                  />
                </p>
                <p className='text-kapwa-text-inverse text-xl md:text-2xl'>
                  <Trans
                    t={t}
                    i18nKey='joinUs.amazing'
                    components={{
                      highlight: (
                        <span className='bg-linear-to-r from-kapwa-yellow-300 to-kapwa-orange-300 bg-clip-text text-2xl font-black text-transparent md:text-3xl' />
                      ),
                    }}
                  />
                </p>
                <p className='text-xl font-black text-kapwa-text-accent-orange uppercase md:text-2xl'>
                  {t('joinUs.grassroots')}
                </p>
                <p className='text-kapwa-text-inverse text-lg md:text-xl'>
                  <Trans
                    t={t}
                    i18nKey='joinUs.committed'
                    components={{ strong: <strong /> }}
                  />
                </p>
                <p className='text-kapwa-text-inverse text-lg md:text-xl'>
                  <Trans
                    t={t}
                    i18nKey='joinUs.relentless'
                    components={{
                      accent: (
                        <strong className='text-kapwa-text-accent-yellow' />
                      ),
                      strong: <strong />,
                    }}
                  />
                </p>
              </blockquote>
              <div className='mt-12 border-t-2 border-kapwa-border-accent-yellow pt-8'>
                <p className='text-xl font-black tracking-wide text-kapwa-text-accent-yellow uppercase md:text-2xl'>
                  {t('shared.lookingFor')}
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className='absolute top-10 left-10 opacity-10'>
          <RocketIcon className='h-32 w-32 rotate-45 transform text-yellow-400' />
        </div>
        <div className='absolute right-10 bottom-10 opacity-10'>
          <CodeIcon className='h-40 w-40 -rotate-12 transform text-kapwa-orange-400' />
        </div>
      </section>

      {/* Call to Action Section */}
      <section className='from-kapwa-brand-600 bg-linear-to-r to-kapwa-blue-600 py-16 md:py-20'>
        <div className='container mx-auto px-4 text-center'>
          <div className='mx-auto max-w-3xl'>
            <h2 className='text-kapwa-text-inverse mb-6 kapwa-heading-lg font-bold'>
              {t('shared.readyTitle')}
            </h2>
            <p className='mb-8 text-xl text-kapwa-text-inverse/80'>
              {t('joinUs.ctaBody')}
            </p>

            <div className='flex flex-col items-center justify-center gap-6 sm:flex-row'>
              {config.portal.discordUrl && (
                <ButtonLink
                  href={config.portal.discordUrl}
                  target='_blank'
                  rel='noreferrer'
                  variant='secondary'
                  size='lg'
                  leftIcon={<MessageCircleIcon className='h-6 w-6' />}
                  className='text-kapwa-text-strong transform rounded-lg bg-kapwa-bg-accent-yellow-weak px-8 py-4 text-lg shadow-lg transition-all hover:scale-105'
                >
                  {t('joinUs.joinDiscordCommunity')}
                </ButtonLink>
              )}

              <div className='text-kapwa-text-inverse font-medium'>
                {t('shared.or')}
              </div>

              <ButtonLink
                href='/ideas'
                target='_blank'
                rel='noreferrer'
                variant='outline'
                size='lg'
                leftIcon={<LightbulbIcon className='h-5 w-5' />}
                className='hover:text-kapwa-text-brand text-kapwa-text-inverse hover:bg-kapwa-bg-surface rounded-lg border-2 border-white px-8 py-4'
              >
                {t('joinUs.exploreIdeas')}
              </ButtonLink>
            </div>

            <div className='mt-8 border-t border-white/20 pt-6'>
              <p className='text-sm text-kapwa-text-inverse/80'>
                {t('joinUs.footerLine')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default JoinUs;
