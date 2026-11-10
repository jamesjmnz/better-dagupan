import { FC, useState } from 'react';

import { Link } from 'react-router-dom';

import { ButtonLink } from '@/components/ui/ButtonLink';
import {
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  GlobeIcon,
  HeartHandshakeIcon,
  MailIcon,
  MessageCircleIcon,
  UsersIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { config } from '@/lib/lguConfig';
import { SEO } from '@/components/layout/SEO';

const ContactUs: FC = () => {
  const { t } = useTranslation('pages');
  const contactMethods = [
    {
      icon: <MailIcon className='h-8 w-8' />,
      title: t('contact.methods.email.title'),
      description: t('contact.methods.email.description'),
      contact: config.portal.contactEmail,
      action: `mailto:${config.portal.contactEmail}`,
      color: 'bg-kapwa-bg-brand-weak text-kapwa-text-brand',
    },
    {
      icon: <MessageCircleIcon className='h-8 w-8' />,
      title: t('contact.methods.discord.title'),
      description: t('contact.methods.discord.description'),
      contact: t('contact.methods.discord.contact'),
      action: config.portal.discordUrl,
      color: 'bg-kapwa-bg-brand-weak text-kapwa-text-brand',
    },
    {
      icon: <UsersIcon className='h-8 w-8' />,
      title: t('contact.methods.volunteer.title'),
      description: t('contact.methods.volunteer.description'),
      contact: t('contact.methods.volunteer.contact'),
      action: '/join-us',
      color: 'bg-kapwa-bg-brand-weak text-kapwa-text-brand',
    },
    {
      icon: <GlobeIcon className='h-8 w-8' />,
      title: t('contact.methods.issues.title'),
      description: t('contact.methods.issues.description'),
      contact: t('contact.methods.issues.contact'),
      action: `${config.portal.githubUrl}/issues`,
      color: 'bg-kapwa-bg-brand-weak text-kapwa-text-brand',
    },
  ];

  const faqs = [
    {
      question: t('contact.faqs.volunteer.question'),
      answer: t('contact.faqs.volunteer.answer'),
      link: { text: t('contact.faqs.volunteer.link'), href: '/join-us' },
    },
    {
      question: t('contact.faqs.affiliation.question'),
      answer: t('contact.faqs.affiliation.answer'),
    },
    {
      question: t('contact.faqs.bugs.question'),
      answer: t('contact.faqs.bugs.answer'),
      link: {
        text: t('contact.faqs.bugs.link'),
        href: `${config.portal.githubUrl}/issues`,
      },
    },
    {
      question: t('contact.faqs.reuse.question'),
      answer: t('contact.faqs.reuse.answer'),
    },
    {
      question: t('contact.faqs.data.question'),
      answer: t('contact.faqs.data.answer'),
    },
  ];

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className='bg-kapwa-bg-surface-raised min-h-screen'>
      <SEO
        title={t('contact.seoTitle')}
        description={t('contact.seoDescription')}
        keywords={['contact', 'volunteer', 'feedback', 'support']}
      />

      <div className='container mx-auto px-4 py-8 md:py-12'>
        {/* Header Section */}
        <div className='bg-kapwa-bg-surface border-kapwa-border-weak mt-4 rounded-lg border p-6 shadow-xs md:p-8 md:py-16'>
          <div className='mx-auto max-w-4xl text-center'>
            <div className='mb-6 flex justify-center'>
              <div className='bg-kapwa-bg-info-weak rounded-full p-4'>
                <HeartHandshakeIcon className='text-kapwa-text-info h-12 w-12' />
              </div>
            </div>
            <h1 className='text-kapwa-text-strong kapwa-heading-xl font-extrabold'>
              {t('contact.title')}
            </h1>
            <p className='text-kapwa-text-support mx-auto mb-8 max-w-3xl text-lg md:text-xl'>
              {t('contact.intro')}
            </p>
          </div>
        </div>

        {/* Contact Methods Grid */}
        <div className='mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
          {contactMethods
            .filter(method => Boolean(method.action))
            .map((method, index) => (
              <div
                key={index}
                className='bg-kapwa-bg-surface border-kapwa-border-weak rounded-lg border p-6 shadow-xs transition-shadow hover:shadow-md'
              >
                <div className={`${method.color} mb-4 w-fit rounded-lg p-3`}>
                  {method.icon}
                </div>
                <h3 className='text-kapwa-text-strong mb-2 text-lg font-semibold'>
                  {method.title}
                </h3>
                <p className='text-kapwa-text-support mb-4 text-sm'>
                  {method.description}
                </p>
                <ButtonLink
                  href={method.action}
                  variant='link'
                  size='sm'
                  rightIcon={<ArrowRightIcon className='h-4 w-4' />}
                  target={
                    method.action.startsWith('http') ? '_blank' : undefined
                  }
                  rel={
                    method.action.startsWith('http')
                      ? 'noopener noreferrer'
                      : undefined
                  }
                >
                  {method.contact}
                </ButtonLink>
              </div>
            ))}
        </div>

        {/* FAQ Section */}
        <div className='bg-kapwa-bg-surface mt-8 rounded-lg border p-6 shadow-xs md:p-8'>
          <div className='mx-auto max-w-4xl'>
            <div className='mb-8 text-center'>
              <h2 className='text-kapwa-text-strong mb-4 kapwa-heading-lg font-bold'>
                {t('contact.faqTitle')}
              </h2>
              <p className='text-kapwa-text-support'>{t('contact.faqIntro')}</p>
            </div>

            <div className='space-y-4'>
              {faqs.map((faq, index) => (
                <div key={index} className='rounded-lg border'>
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className='flex w-full items-center justify-between p-4 text-left'
                  >
                    <h3 className='text-kapwa-text-support flex-1 font-semibold'>
                      {faq.question}
                    </h3>
                    {openFaq === index ? (
                      <ChevronUpIcon className='text-kapwa-text-disabled h-5 w-5' />
                    ) : (
                      <ChevronDownIcon className='text-kapwa-text-disabled h-5 w-5' />
                    )}
                  </button>
                  {openFaq === index && (
                    <div className='text-kapwa-text-support p-4 pt-0 text-sm leading-relaxed'>
                      <p>
                        {faq.answer}
                        {faq.link && (
                          <>
                            {' '}
                            <Link
                              to={faq.link.href}
                              className='text-kapwa-text-info font-medium hover:text-kapwa-text-link-hover'
                              target={
                                faq.link.href.startsWith('http')
                                  ? '_blank'
                                  : '_self'
                              }
                              rel={
                                faq.link.href.startsWith('http')
                                  ? 'noopener noreferrer'
                                  : undefined
                              }
                            >
                              {faq.link.text}
                            </Link>
                            .
                          </>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className='from-kapwa-brand-600 to-kapwa-purple-600 bg-linear-to-r mt-8 rounded-lg p-8 text-center'>
          <h3 className='text-kapwa-text-inverse mb-4 kapwa-heading-md font-bold'>
            {t('shared.readyTitle')}
          </h3>
          <p className='text-kapwa-text-inverse/80 mx-auto mb-6 max-w-2xl'>
            {t('contact.ctaBody')}
          </p>
          <Link
            to='/join-us'
            className='bg-kapwa-bg-surface text-kapwa-text-info hover:bg-kapwa-bg-surface-raised inline-flex items-center rounded-lg px-6 py-3 font-semibold transition-colors'
          >
            {t('contact.ctaButton')}
            <ArrowRightIcon className='ml-2 h-5 w-5' />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
