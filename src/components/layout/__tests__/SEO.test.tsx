import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { render, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

/**
 * A fork can run before it has a domain, with config.portal.baseUrl empty.
 * Anything that needs an absolute URL then has to be withheld rather than emitted
 * against an empty base, which would produce a bare path that crawlers cannot
 * resolve and that reads as a canonical for whatever host served the page.
 */
const configPath = join(process.cwd(), 'config/lgu.config.json');
const lguConfig = JSON.parse(readFileSync(configPath, 'utf8'));

const renderSEO = async (overrides: Record<string, unknown> = {}) => {
  vi.resetModules();
  vi.doMock('@/lib/lguConfig', () => {
    const config = {
      ...lguConfig,
      portal: { ...lguConfig.portal, ...overrides },
    };
    return { config, default: config };
  });

  const { SEO } = await import('../SEO');
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/services']}>
        <SEO />
      </MemoryRouter>
    </HelmetProvider>
  );

  await waitFor(() => expect(document.title).toBeTruthy());
};

const head = (selector: string) => document.head.querySelector(selector);

describe('SEO with no production domain', () => {
  it('emits no canonical link', async () => {
    await renderSEO({ baseUrl: '' });

    expect(head('link[rel="canonical"]')).toBeNull();
  });

  it('emits no og:url', async () => {
    await renderSEO({ baseUrl: '' });

    expect(head('meta[property="og:url"]')).toBeNull();
  });

  it('emits no image assembled from an empty base URL', async () => {
    await renderSEO({ baseUrl: '', defaultOgImagePath: '/logos/some.png' });

    expect(head('meta[property="og:image"]')).toBeNull();
    expect(head('meta[name="twitter:image"]')).toBeNull();
    // Without an image, a large-image card would render blank.
    expect(head('meta[name="twitter:card"]')?.getAttribute('content')).toBe(
      'summary'
    );
  });

  it('still emits the title and description, which need no domain', async () => {
    await renderSEO({ baseUrl: '' });

    expect(document.title).toContain(lguConfig.portal.name);
    expect(
      head('meta[name="description"]')?.getAttribute('content')
    ).toBeTruthy();
  });
});

describe('SEO once a production domain is configured', () => {
  const baseUrl = 'https://example.test';

  it('emits an absolute canonical and og:url', async () => {
    await renderSEO({ baseUrl });

    expect(head('link[rel="canonical"]')?.getAttribute('href')).toBe(
      `${baseUrl}/services`
    );
    expect(head('meta[property="og:url"]')?.getAttribute('content')).toBe(
      `${baseUrl}/services`
    );
  });

  it('emits an absolute image only when an image path is set', async () => {
    await renderSEO({ baseUrl, defaultOgImagePath: '/logos/og.png' });

    expect(head('meta[property="og:image"]')?.getAttribute('content')).toBe(
      `${baseUrl}/logos/og.png`
    );
    expect(head('meta[name="twitter:card"]')?.getAttribute('content')).toBe(
      'summary_large_image'
    );
  });

  it('withholds the image when no path is configured', async () => {
    await renderSEO({ baseUrl, defaultOgImagePath: '' });

    expect(head('meta[property="og:image"]')).toBeNull();
  });
});

describe('the default share image', () => {
  it('carries its size and alt text', async () => {
    await renderSEO({ baseUrl: 'https://example.test' });

    expect(
      head('meta[property="og:image:width"]')?.getAttribute('content')
    ).toBe('1200');
    expect(
      head('meta[property="og:image:height"]')?.getAttribute('content')
    ).toBe('630');
    expect(
      head('meta[property="og:image:alt"]')?.getAttribute('content')
    ).toContain(lguConfig.lgu.fullName);
  });

  it('does not claim that size for an image it did not render', async () => {
    vi.resetModules();
    vi.doMock('@/lib/lguConfig', () => {
      const config = {
        ...lguConfig,
        portal: { ...lguConfig.portal, baseUrl: 'https://example.test' },
      };
      return { config, default: config };
    });
    const { SEO } = await import('../SEO');
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/services']}>
          <SEO ogImage='/elsewhere.png' />
        </MemoryRouter>
      </HelmetProvider>
    );

    await waitFor(() =>
      expect(head('meta[property="og:image"]')?.getAttribute('content')).toBe(
        'https://example.test/elsewhere.png'
      )
    );
    expect(head('meta[property="og:image:width"]')).toBeNull();
  });
});

/** Width and height from a PNG's IHDR chunk. */
const pngSize = (publicPath: string) => {
  const png = readFileSync(join(process.cwd(), 'public', publicPath));
  return [png.readUInt32BE(16), png.readUInt32BE(20)];
};

const indexHtml = readFileSync(join(process.cwd(), 'index.html'), 'utf8');

/** The content of a meta tag in index.html, found by one attribute. */
const htmlMeta = (attribute: string) => {
  const tag = indexHtml
    .match(/<meta\b[^>]*>/g)
    ?.find(candidate => candidate.includes(attribute));
  return tag ? /content="([^"]*)"/.exec(tag)?.[1] : undefined;
};

describe('brand assets in config and index.html', () => {
  const { portal } = lguConfig;

  it('ships a 1200x630 share image and names it before the app loads', () => {
    expect(pngSize(portal.defaultOgImagePath)).toEqual([1200, 630]);

    const absolute = `${portal.baseUrl}${portal.defaultOgImagePath}`;
    expect(htmlMeta('property="og:image"')).toBe(absolute);
    expect(htmlMeta('name="twitter:image"')).toBe(absolute);
    expect(htmlMeta('name="twitter:card"')).toBe('summary_large_image');
  });

  it('hands the static share tags to Helmet so none is duplicated', () => {
    const tags = (indexHtml.match(/<meta\b[^>]*>/g) ?? []).filter(tag =>
      /(property="og:|name="twitter:|name="description")/.test(tag)
    );

    expect(tags.length).toBeGreaterThan(0);
    for (const tag of tags) expect(tag).toContain('data-rh="true"');
  });

  it('ships a 180x180 PNG Apple touch icon and links it', () => {
    expect(portal.appleTouchIconPath).toMatch(/\.png$/);
    expect(pngSize(portal.appleTouchIconPath)).toEqual([180, 180]);
    expect(indexHtml).toMatch(
      new RegExp(
        `rel="apple-touch-icon"[^>]*href="${portal.appleTouchIconPath}"`
      )
    );
    // The SVG favicon is well supported and stays.
    expect(indexHtml).toMatch(/rel="icon"[\s\S]*better-dagupan-icon\.svg/);
  });

  it('links a web app manifest that matches the config', () => {
    type Icon = { src: string; sizes: string; type: string; purpose?: string };
    const manifest = JSON.parse(
      readFileSync(join(process.cwd(), 'public/manifest.webmanifest'), 'utf8')
    ) as {
      name: string;
      theme_color: string;
      start_url: string;
      icons: Icon[];
    };

    expect(indexHtml).toContain('rel="manifest" href="/manifest.webmanifest"');
    expect(manifest.name).toBe(portal.name);
    expect(manifest.start_url).toBe('/');
    expect(manifest.theme_color).toBe(portal.brandColor);
    expect(htmlMeta('name="theme-color"')).toBe(portal.brandColor);

    const pngs = manifest.icons.filter(icon => icon.type === 'image/png');
    expect(pngs.map(icon => icon.sizes)).toEqual(
      expect.arrayContaining(['192x192', '512x512'])
    );
    for (const icon of pngs) {
      expect(pngSize(icon.src).join('x')).toBe(icon.sizes);
    }
    expect(manifest.icons.some(icon => icon.purpose === 'maskable')).toBe(true);
  });
});
