import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  buildSitemapXml,
  detailPaths,
  isRouteEnabled,
  PUBLIC_ROUTES,
  type RouteGateConfig,
  sitemapPaths,
} from '../siteRoutes';

const read = (relative: string) =>
  readFileSync(join(process.cwd(), relative), 'utf8');

/**
 * Every `<Route>` path declared in src/App.tsx, resolved against its parents.
 * App.tsx nests routes as plain JSX, so a small tag scanner is enough: it
 * tracks `{...}` depth to skip the `element={<X />}` props.
 */
function appRoutePaths(source: string): string[] {
  const paths: string[] = [];
  const stack: string[] = [''];
  const tag = /<Route\b|<\/Route>/g;
  let match: RegExpExecArray | null;

  while ((match = tag.exec(source))) {
    if (match[0] === '</Route>') {
      stack.pop();
      continue;
    }
    let depth = 0;
    let end = match.index;
    for (; end < source.length; end++) {
      const char = source[end];
      if (char === '{') depth++;
      else if (char === '}') depth--;
      else if (char === '>' && depth === 0) break;
    }
    const opening = source.slice(match.index, end + 1);
    const attributes = opening.replace(/\{[^{}]*(\{[^{}]*\}[^{}]*)*\}/g, '');
    const selfClosing = opening.endsWith('/>');
    const parent = stack[stack.length - 1];
    const segment = /\bpath=['"]([^'"]+)['"]/.exec(attributes)?.[1];

    const full = segment
      ? segment.startsWith('/')
        ? segment
        : `${parent.replace(/\/$/, '')}/${segment}`
      : parent || '/';
    if (segment || /\bindex\b/.test(attributes)) paths.push(full);
    if (!selfClosing) stack.push(full);
    tag.lastIndex = end + 1;
  }
  return [...new Set(paths)];
}

const declared = appRoutePaths(read('src/App.tsx'));

/** Rendered only by `import.meta.env.DEV`; never served in production. */
const DEV_ONLY = ['/government/reference-implementation'];

const staticPublic = declared.filter(
  path =>
    !path.includes('*') &&
    !path.includes(':') &&
    !path.startsWith('/admin') &&
    !DEV_ONLY.includes(path)
);

const gates: RouteGateConfig = {
  features: { statistics: true, transparency: true, openLGU: true },
  portal: { discordUrl: '' },
};

describe('the public route list', () => {
  it('finds the routes in App.tsx', () => {
    // Guards the scanner itself: a parse that silently found nothing would
    // make every comparison below pass.
    expect(staticPublic).toEqual(
      expect.arrayContaining([
        '/',
        '/services',
        '/government/departments',
        '/government/elected-officials/committees',
        '/transparency/infrastructure',
        '/contribute',
      ])
    );
    expect(declared).toContain('/admin');
    expect(declared).toContain('/government/departments/:department');
  });

  it('lists every public, non-parameter route App.tsx declares', () => {
    const listed = PUBLIC_ROUTES.map(route => route.path);

    expect([...listed].sort()).toEqual([...staticPublic].sort());
  });

  it('has no duplicates', () => {
    const listed = PUBLIC_ROUTES.map(route => route.path);

    expect(new Set(listed).size).toBe(listed.length);
  });

  it('builds detail paths only for routes App.tsx serves', () => {
    for (const prefix of [
      '/services/:service',
      '/government/departments/:department',
      '/government/barangays/:barangay',
    ]) {
      expect(declared).toContain(prefix);
    }
  });

  it('honours feature switches and the Discord link', () => {
    const statistics = { path: '/statistics', gate: 'statistics' } as const;
    const discord = { path: '/discord', gate: 'discord' } as const;

    expect(isRouteEnabled(statistics, gates)).toBe(true);
    expect(
      isRouteEnabled(statistics, {
        ...gates,
        features: { ...gates.features, statistics: false },
      })
    ).toBe(false);
    expect(isRouteEnabled(discord, gates)).toBe(false);
    expect(
      isRouteEnabled(discord, {
        ...gates,
        portal: { discordUrl: 'https://discord.gg/x' },
      })
    ).toBe(true);
  });
});

describe('sitemap paths', () => {
  const records = {
    departments: [{ slug: 'city-health-office' }, { slug: '' }],
    barangays: [{ slug: 'bonuan-gueset' }],
    services: [{ slug: 'securing-mayors-clearance' }, {}],
  };

  it('builds one detail path per record with a slug', () => {
    expect(detailPaths(records)).toEqual([
      '/government/departments/city-health-office',
      '/government/barangays/bonuan-gueset',
      '/services/securing-mayors-clearance',
    ]);
  });

  it('encodes slugs', () => {
    expect(
      detailPaths({
        departments: [{ slug: 'a b' }],
        barangays: [],
        services: [],
      })
    ).toEqual(['/government/departments/a%20b']);
  });

  it('leaves out redirects, disabled sections, and gated pages', () => {
    const paths = sitemapPaths(
      { ...gates, features: { ...gates.features, openLGU: false } },
      records
    );

    expect(paths).toContain('/');
    expect(paths).toContain('/statistics');
    expect(paths).not.toContain('/government');
    expect(paths).not.toContain('/discord');
    expect(paths.some(path => path.startsWith('/openlgu'))).toBe(false);
    expect(paths.some(path => path.startsWith('/admin'))).toBe(false);
    expect(paths).toContain('/services/securing-mayors-clearance');
  });

  it('lists every published department, barangay, and service', () => {
    const published = {
      departments: JSON.parse(read('src/data/directory/departments.json')),
      barangays: JSON.parse(read('src/data/directory/barangays.json')),
      services: JSON.parse(
        read('src/data/citizens-charter/merged-services.json')
      ),
    };
    const paths = sitemapPaths(gates, published);

    for (const kind of ['departments', 'barangays', 'services'] as const) {
      expect(published[kind].length).toBeGreaterThan(0);
    }
    expect(paths).toEqual(expect.arrayContaining(detailPaths(published)));
    expect(new Set(paths).size).toBe(paths.length);
  });
});

describe('buildSitemapXml', () => {
  it('writes absolute, escaped URLs in the sitemaps.org namespace', () => {
    const xml = buildSitemapXml('https://example.test/', [
      '/',
      '/services?category=a&b',
    ]);

    expect(xml).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>\n/);
    expect(xml).toContain(
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    );
    expect(xml).toContain('<loc>https://example.test/</loc>');
    expect(xml).toContain(
      '<loc>https://example.test/services?category=a&amp;b</loc>'
    );
    expect(xml.match(/<url>/g)).toHaveLength(2);
  });

  it('refuses an empty or relative base URL', () => {
    expect(() => buildSitemapXml('', ['/'])).toThrow(/absolute base URL/);
    expect(() => buildSitemapXml('/portal', ['/'])).toThrow();
  });
});

describe('robots.txt', () => {
  it('points crawlers at the sitemap on the configured base URL', () => {
    const { portal } = JSON.parse(read('config/lgu.config.json'));

    expect(read('public/robots.txt')).toMatch(
      new RegExp(`^Sitemap: ${portal.baseUrl}/sitemap\\.xml$`, 'm')
    );
  });
});
