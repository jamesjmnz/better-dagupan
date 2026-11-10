import { config } from '../lib/lguConfig';
import { lguLabels } from '../lib/lguLabels';
import { NavigationItem } from '../types';
import serviceCategories from './service_categories.json';

interface Category {
  name: string;
  slug: string;
}

export const mainNavigation: NavigationItem[] = [
  {
    label: 'Services',
    href: '/services',
    children: (serviceCategories.categories as Category[]).map(category => ({
      label: category.name,
      href: `/services?category=${category.slug}`,
    })),
  },
  {
    label: 'Government',
    href: '/government',
    children: [
      {
        label: 'Elected Officials',
        labelKey: 'navigation:menu.electedOfficials',
        href: '/government/elected-officials',
      },
      {
        label: 'Departments',
        labelKey: 'navigation:menu.departments',
        href: '/government/departments',
      },
      {
        label: 'Barangays',
        labelKey: 'navigation:menu.barangays',
        href: '/government/barangays',
      },
    ],
  },
  {
    label: 'Statistics',
    href: '/statistics',
    children: [
      {
        label: 'Demographics',
        labelKey: 'navigation:menu.demographics',
        href: '/statistics',
      },
      {
        label: 'Competitiveness',
        labelKey: 'navigation:menu.competitiveness',
        href: '/statistics/competitiveness',
      },
      {
        label: `${lguLabels.adjective} Income`,
        labelKey: 'navigation:menu.income',
        href: '/statistics/municipal-income',
      },
    ],
    ...(config.features.statistics ? {} : { hidden: true }),
  },
  {
    label: 'OpenLGU',
    href: '/openlgu',
    children: [
      {
        label: 'Ordinances',
        labelKey: 'navigation:menu.ordinances',
        href: '/openlgu?type=ordinance',
      },
      {
        label: 'Resolutions',
        labelKey: 'navigation:menu.resolutions',
        href: '/openlgu?type=resolution',
      },
      {
        label: 'Executive Orders',
        labelKey: 'navigation:menu.executiveOrders',
        href: '/openlgu?type=executive_order',
      },
    ],
    ...(config.features.openLGU ? {} : { hidden: true }),
  },
  {
    label: 'Transparency',
    href: '/transparency',
    children: [
      {
        label: 'Financial Reports',
        labelKey: 'navigation:menu.financialReports',
        href: '/transparency/financial',
      },
      {
        label: 'Procurement',
        labelKey: 'navigation:menu.procurement',
        href: '/transparency/procurement',
      },
      {
        label: 'DPWH Projects',
        labelKey: 'navigation:menu.dpwhProjects',
        href: '/transparency/infrastructure',
      },
    ],
    ...(config.features.transparency ? {} : { hidden: true }),
  },
].filter(item => !(item as NavigationItem & { hidden?: boolean }).hidden);

export const footerNavigation = {
  // Brand Section (Matches the Solano/Bacolod mission-style text)
  brand: {
    title: config.portal.name,
    description: `An open-source civic tech initiative making government information and ${lguLabels.adjective.toLowerCase()} services accessible for the people of ${config.lgu.name}.`,
    cost: `Cost to the People of ${config.lgu.name} = ₱0`,
  },

  mainSections: [
    {
      title: 'Local Services',
      titleKey: 'navigation:footer.sections.localServices',
      links: [
        {
          label: 'All Services',
          labelKey: 'navigation:footer.links.allServices',
          href: '/services',
        },
        {
          label: 'Business, Trade & Investment',
          labelKey: 'navigation:footer.links.business',
          href: '/services?category=business-trade-investment',
        },
        {
          label: 'Health & Wellness',
          labelKey: 'navigation:footer.links.health',
          href: '/services?category=health-wellness',
        },
        {
          label: 'Social Services',
          labelKey: 'navigation:footer.links.social',
          href: '/services?category=social-services-assistance',
        },
        {
          label: 'Agriculture & Economic Development',
          labelKey: 'navigation:footer.links.agriculture',
          href: '/services?category=agriculture-economic-development',
        },
      ],
    },
    {
      title: 'Local Government',
      titleKey: 'navigation:footer.sections.localGovernment',
      links: [
        {
          label: 'Elected Officials',
          labelKey: 'navigation:footer.links.electedOfficials',
          href: '/government/elected-officials',
        },
        {
          label: 'Departments',
          labelKey: 'navigation:footer.links.departments',
          href: '/government/departments',
        },
        {
          label: 'Barangay Directory',
          labelKey: 'navigation:footer.links.barangayDirectory',
          href: '/government/barangays',
        },
        {
          label: 'OpenLGU Portal',
          labelKey: 'navigation:footer.links.openlgu',
          href: '/openlgu',
        },
        {
          label: 'Transparency',
          labelKey: 'navigation:footer.links.transparency',
          href: '/transparency/financial',
        },
      ],
    },
    {
      title: 'BetterGov Network',
      titleKey: 'navigation:footer.sections.network',
      links: [
        {
          label: 'Transparency Portal',
          labelKey: 'navigation:footer.links.transparencyPortal',
          href: 'https://transparency.bettergov.ph',
          target: '_blank',
        },
        {
          label: 'Open Data Portal',
          labelKey: 'navigation:footer.links.openData',
          href: 'https://data.bettergov.ph',
          target: '_blank',
        },
        {
          label: 'Petitions PH',
          labelKey: 'navigation:footer.links.petitions',
          href: 'https://petition.ph',
          target: '_blank',
        },
        {
          label: 'SALN Tracker',
          labelKey: 'navigation:footer.links.saln',
          href: 'https://saln.bettergov.ph',
          target: '_blank',
        },
        {
          label: 'Budget Tracker',
          labelKey: 'navigation:footer.links.budget',
          href: 'https://budget.bettergov.ph',
          target: '_blank',
        },
        {
          label: 'Philgeps Tracker',
          labelKey: 'navigation:footer.links.philgeps',
          href: 'https://philgeps.bettergov.ph',
          target: '_blank',
        },
      ],
    },
    {
      title: 'Resources',
      titleKey: 'navigation:footer.sections.resources',
      links: [
        {
          label: `${config.lgu.name} Gov.ph`,
          labelKey: 'navigation:footer.links.lguSite',
          href: config.lgu.officialWebsite,
          target: '_blank',
        },
        // {
        //   label: 'Official Gazette',
        //   href: 'https://www.officialgazette.gov.ph',
        //   target: '_blank',
        // },
        {
          label: 'Freedom of Information',
          labelKey: 'navigation:footer.links.foi',
          href: 'https://www.foi.gov.ph',
          target: '_blank',
        },
        {
          label: `Province of ${config.lgu.province}`,
          labelKey: 'navigation:footer.links.province',
          href: config.lgu.provinceWebsite,
          target: '_blank',
        },
        {
          label: 'Report an Error',
          labelKey: 'navigation:footer.links.reportError',
          href: '/report-an-error',
        },
        // { label: 'Privacy Policy', href: '/privacy' },
        // { label: 'Accessibility', href: '/accessibility' },
      ],
    },
  ],
  // Networks the portal has not set up yet are left blank in lgu.config.json;
  // drop them here so the footer never renders a link that goes nowhere.
  socialLinks: [
    {
      label: 'Facebook',
      href: config.portal.facebookUrl,
      target: '_blank',
    },
    {
      label: 'Discord',
      href: config.portal.discordUrl,
      target: '_blank',
    },
    {
      label: 'GitHub',
      href: config.portal.githubUrl,
      target: '_blank',
    },
  ].filter(link => Boolean(link.href)),
};
