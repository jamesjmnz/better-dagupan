import lguConfig from '../../config/lgu.config.json';

export interface LGUConfig {
  lgu: {
    name: string;
    fullName: string;
    province: string;
    districtEngineeringOffice?: string;
    region: string;
    /** Region name that pairs with `region` (e.g. "Ilocos Region") */
    regionCode: string;
    type: 'municipality' | 'city' | 'province';
    officialWebsite: string;
    provinceWebsite: string;
  };
  portal: {
    name: string;
    domain: string;
    baseUrl: string;
    description: string;
    brandColor: string;
    footerBrandName: string;
    logoWhitePath: string;
    navbarLogoPath: string;
    defaultOgImagePath: string;
    faviconPath: string;
    faviconSvgPath: string;
    appleTouchIconPath: string;
    githubUrl: string;
    discordUrl: string;
    facebookUrl: string;
    contactEmail: string;
  };
  location: {
    coordinates: { lat: number; lon: number };
    weather: { defaultCity: string };
  };
  transparency: {
    procurement: {
      /** Exact PhilGEPS entity names, current name first. */
      organizationNames: string[];
      /** The LGU's own posted bid and award notices (WordPress REST API). */
      cityNotices?: {
        api: string;
        postType: string;
        typeTaxonomy: string;
        pageUrl: string;
      };
      externalDashboard: string;
    };
    infrastructure: {
      searchString: string;
      exactMatchTargets: string[];
    };
  };
  features: {
    openLGU: boolean;
    transparency: boolean;
    statistics: boolean;
    /**
     * Offer Pangasinan in the language switcher. Keep this off until the
     * locale has human-reviewed translations; see src/i18n/README.md.
     */
    pangasinan: boolean;
  };
}

export const config = lguConfig as LGUConfig;
export default config;
