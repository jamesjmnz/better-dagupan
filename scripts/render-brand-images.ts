#!/usr/bin/env node
/**
 * Render the portal's raster brand assets from its SVG logos, and write the
 * web app manifest that points at them.
 *
 * Outputs (committed; re-run after changing the logo or portal identity):
 *   public/logos/png/<slug>-og.png                  1200x630 Open Graph card
 *   public/logos/png/<slug>-apple-touch-icon.png    180x180, full bleed
 *   public/logos/png/<slug>-icon-192.png            192x192
 *   public/logos/png/<slug>-icon-512.png            512x512
 *   public/logos/png/<slug>-icon-maskable-512.png   512x512, safe-zone padded
 *   public/manifest.webmanifest
 *
 * <slug> comes from portal.navbarLogoPath (`/logos/svg/<slug>-icon.svg`), and
 * every word on the card comes from config/lgu.config.json. Rendering uses the
 * Chromium that Playwright already installs for the e2e suite.
 *
 * Run: npx tsx scripts/render-brand-images.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');

interface PortalConfig {
  lgu: { name: string; fullName: string; province: string };
  portal: {
    name: string;
    domain: string;
    description: string;
    brandColor: string;
    navbarLogoPath: string;
    logoWhitePath: string;
  };
}

const config = JSON.parse(
  fs.readFileSync(path.join(root, 'config/lgu.config.json'), 'utf8')
) as PortalConfig;
const { lgu, portal } = config;

const slug = /\/([^/]+)-icon\.svg$/.exec(portal.navbarLogoPath)?.[1];
if (!slug) {
  throw new Error(
    `Cannot derive an asset name from portal.navbarLogoPath "${portal.navbarLogoPath}".`
  );
}

const readSvg = (publicPath: string) =>
  fs.readFileSync(path.join(publicDir, publicPath), 'utf8');
const logo = readSvg(portal.navbarLogoPath);
const logoWhite = readSvg(portal.logoWhitePath);

const escapeHtml = (text: string) =>
  text.replace(
    /[&<>"]/g,
    char =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char] ?? char
  );

const page = (width: number, height: number, body: string, css = '') => `
<!doctype html>
<html><head><meta charset="utf-8" />
<style>
  * { box-sizing: border-box; margin: 0; }
  html, body { width: ${width}px; height: ${height}px; overflow: hidden; }
  body {
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  svg { display: block; width: 100%; height: 100%; }
  ${css}
</style></head><body>${body}</body></html>`;

/** An icon on a solid brand square, so no corner is left transparent. */
const solidIcon = (size: number, scale: number) =>
  page(
    size,
    size,
    `<div class="tile"><div class="mark">${logo}</div></div>`,
    `.tile { width: 100%; height: 100%; background: ${portal.brandColor};
       display: flex; align-items: center; justify-content: center; }
     .mark { width: ${scale * 100}%; height: ${scale * 100}%; }`
  );

const transparentIcon = (size: number) => page(size, size, logo);

const ogCard = page(
  1200,
  630,
  `<main>
     <div class="brand">
       <div class="mark">${logoWhite}</div>
       <span>${escapeHtml(portal.domain)}</span>
     </div>
     <div class="copy">
       <h1>${escapeHtml(portal.name)}</h1>
       <p>Public information about the ${escapeHtml(lgu.fullName)}, ${escapeHtml(lgu.province)}</p>
     </div>
     <footer>Independent, community-led project &middot; Not an official government website</footer>
   </main>`,
  `main {
     width: 100%; height: 100%; padding: 72px 80px;
     display: flex; flex-direction: column; justify-content: space-between;
     color: #ffffff;
     background:
       radial-gradient(circle at 100% 0%, rgba(255,255,255,0.16), transparent 55%),
       ${portal.brandColor};
   }
   .brand { display: flex; align-items: center; gap: 24px;
     font-size: 30px; font-weight: 600; opacity: 0.92; }
   .brand .mark { width: 96px; height: 96px; flex: none; }
   h1 { font-size: 104px; font-weight: 800; letter-spacing: -3px; line-height: 1; }
   p { margin-top: 24px; font-size: 40px; font-weight: 500; line-height: 1.25;
     max-width: 960px; opacity: 0.95; }
   footer { font-size: 26px; font-weight: 500; opacity: 0.85;
     padding-top: 28px; border-top: 2px solid rgba(255,255,255,0.35); }`
);

const pngDir = path.join(publicDir, 'logos/png');
const outputs: Array<{ file: string; size: [number, number]; html: string }> = [
  { file: `${slug}-og.png`, size: [1200, 630], html: ogCard },
  {
    file: `${slug}-apple-touch-icon.png`,
    size: [180, 180],
    // iOS rounds the corners itself and fills transparency with black.
    html: solidIcon(180, 1),
  },
  {
    file: `${slug}-icon-192.png`,
    size: [192, 192],
    html: transparentIcon(192),
  },
  {
    file: `${slug}-icon-512.png`,
    size: [512, 512],
    html: transparentIcon(512),
  },
  {
    file: `${slug}-icon-maskable-512.png`,
    size: [512, 512],
    // Keep the mark inside the 80% safe zone that launchers may crop to.
    html: solidIcon(512, 0.72),
  },
];

const browser = await chromium.launch();
try {
  fs.mkdirSync(pngDir, { recursive: true });
  for (const { file, size, html } of outputs) {
    const [width, height] = size;
    const tab = await browser.newPage({
      viewport: { width, height },
      deviceScaleFactor: 1,
    });
    await tab.setContent(html, { waitUntil: 'load' });
    await tab.evaluate(() => document.fonts.ready);
    await tab.screenshot({
      path: path.join(pngDir, file),
      omitBackground: true,
      clip: { x: 0, y: 0, width, height },
    });
    await tab.close();
    console.log(`public/logos/png/${file} (${width}x${height})`);
  }
} finally {
  await browser.close();
}

const manifest = {
  name: portal.name,
  short_name: portal.name,
  description: `${portal.description} An independent community project, not an official government website.`,
  start_url: '/',
  scope: '/',
  display: 'standalone',
  background_color: '#ffffff',
  theme_color: portal.brandColor,
  lang: 'en',
  icons: [
    { src: portal.navbarLogoPath, sizes: 'any', type: 'image/svg+xml' },
    {
      src: `/logos/png/${slug}-icon-192.png`,
      sizes: '192x192',
      type: 'image/png',
    },
    {
      src: `/logos/png/${slug}-icon-512.png`,
      sizes: '512x512',
      type: 'image/png',
    },
    {
      src: `/logos/png/${slug}-icon-maskable-512.png`,
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable',
    },
  ],
};
fs.writeFileSync(
  path.join(publicDir, 'manifest.webmanifest'),
  `${JSON.stringify(manifest, null, 2)}\n`
);
console.log('public/manifest.webmanifest');
