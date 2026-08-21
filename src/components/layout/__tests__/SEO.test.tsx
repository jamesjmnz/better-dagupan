import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { render, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

/**
 * No production domain is assigned yet, so config.portal.baseUrl is empty.
 * Anything that needs an absolute URL has to be withheld rather than emitted
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

describe('config defers metadata that needs assets it does not have', () => {
  it('leaves the Apple touch icon unset rather than pointing at an SVG', () => {
    // iOS ignores SVG touch icons; a real PNG lands with the deployment.
    expect(lguConfig.portal.appleTouchIconPath).toBe('');
  });

  it('does not reference an Apple touch icon in index.html', () => {
    const html = readFileSync(join(process.cwd(), 'index.html'), 'utf8');

    expect(html).not.toMatch(/apple-touch-icon/);
    // The SVG favicon is well supported and stays.
    expect(html).toMatch(/rel="icon"[\s\S]*better-dagupan-icon\.svg/);
  });
});
