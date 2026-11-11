/**
 * The public routes the portal serves, mirroring src/App.tsx.
 *
 * This module is shared by the browser bundle, the unit tests, and
 * scripts/generate-sitemap-xml.ts, which runs under Node. Keep it free of
 * `@/` imports and of anything that reads config at import time: callers pass
 * the config in.
 *
 * Admin routes and development-only routes are deliberately absent. A unit
 * test (src/lib/__tests__/siteRoutes.test.ts) compares this list with the
 * routes declared in App.tsx, so a new public page fails the suite until it
 * is listed here and given SEO metadata.
 */

/** A config switch a route depends on. */
export type RouteGate = 'statistics' | 'transparency' | 'openLGU' | 'discord';

export interface SiteRoute {
  path: string;
  /** Only served while this switch is on. */
  gate?: RouteGate;
  /**
   * False for routes that only redirect elsewhere. They still render the
   * shell, so they keep SEO metadata, but a sitemap lists final URLs only.
   */
  indexable?: boolean;
}

export const PUBLIC_ROUTES: readonly SiteRoute[] = [
  { path: '/' },
  { path: '/about' },
  { path: '/contact' },
  { path: '/accessibility' },
  { path: '/search' },
  { path: '/ideas' },
  { path: '/join-us' },
  { path: '/terms-of-service' },
  { path: '/sitemap' },
  { path: '/report-an-error' },
  { path: '/discord', gate: 'discord' },
  { path: '/data/weather' },
  { path: '/data/forex' },
  { path: '/services' },
  { path: '/government', indexable: false },
  { path: '/government/elected-officials' },
  { path: '/government/elected-officials/committees' },
  { path: '/government/departments' },
  { path: '/government/barangays' },
  { path: '/statistics', gate: 'statistics' },
  { path: '/statistics/population', gate: 'statistics' },
  { path: '/statistics/municipal-income', gate: 'statistics' },
  { path: '/statistics/competitiveness', gate: 'statistics' },
  { path: '/openlgu', gate: 'openLGU' },
  { path: '/openlgu/officials', gate: 'openLGU' },
  { path: '/openlgu/terms', gate: 'openLGU' },
  { path: '/transparency', gate: 'transparency' },
  { path: '/transparency/financial', gate: 'transparency' },
  { path: '/transparency/procurement', gate: 'transparency' },
  { path: '/transparency/infrastructure', gate: 'transparency' },
  { path: '/contribute' },
];

/** The slice of config/lgu.config.json the route gates read. */
export interface RouteGateConfig {
  features: { statistics: boolean; transparency: boolean; openLGU: boolean };
  portal: { discordUrl: string };
}

export function isRouteEnabled(
  route: SiteRoute,
  config: RouteGateConfig
): boolean {
  switch (route.gate) {
    case undefined:
      return true;
    case 'discord':
      return Boolean(config.portal.discordUrl);
    default:
      return config.features[route.gate];
  }
}

/** Records that have a detail page of their own. */
export interface DetailRecords {
  departments: ReadonlyArray<{ slug?: string }>;
  barangays: ReadonlyArray<{ slug?: string }>;
  services: ReadonlyArray<{ slug?: string }>;
}

const DETAIL_PREFIXES: Record<keyof DetailRecords, string> = {
  departments: '/government/departments',
  barangays: '/government/barangays',
  services: '/services',
};

/** Paths of the data-driven detail pages, in dataset order. */
export function detailPaths(records: DetailRecords): string[] {
  return (Object.keys(DETAIL_PREFIXES) as Array<keyof DetailRecords>).flatMap(
    kind =>
      records[kind]
        .map(record => record.slug)
        .filter((slug): slug is string => Boolean(slug))
        .map(slug => `${DETAIL_PREFIXES[kind]}/${encodeURIComponent(slug)}`)
  );
}

/** Every path a sitemap should list: indexable static routes, then details. */
export function sitemapPaths(
  config: RouteGateConfig,
  records: DetailRecords
): string[] {
  const statics = PUBLIC_ROUTES.filter(
    route => route.indexable !== false && isRouteEnabled(route, config)
  ).map(route => route.path);
  return [...new Set([...statics, ...detailPaths(records)])];
}

const XML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

const escapeXml = (text: string) =>
  text.replace(/[&<>"']/g, char => XML_ESCAPES[char]);

/**
 * Render a sitemap (sitemaps.org protocol 0.9). Sitemap URLs must be
 * absolute, so an empty or relative base URL is an error rather than a
 * sitemap of bare paths.
 */
export function buildSitemapXml(baseUrl: string, paths: string[]): string {
  if (!/^https?:\/\/[^/]+/.test(baseUrl)) {
    throw new Error(
      `A sitemap needs an absolute base URL; got "${baseUrl}". Set portal.baseUrl in config/lgu.config.json.`
    );
  }
  const base = baseUrl.replace(/\/+$/, '');
  const urls = paths.map(
    path => `  <url>\n    <loc>${escapeXml(`${base}${path}`)}</loc>\n  </url>`
  );
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');
}
