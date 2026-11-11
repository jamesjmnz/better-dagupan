#!/usr/bin/env node
/**
 * Write sitemap.xml for the production build.
 *
 * Lists the public routes from src/lib/siteRoutes.ts plus one detail page per
 * published department, barangay, and service, all made absolute with
 * portal.baseUrl. Runs after `vite build` and writes into dist/ (or the
 * directory given as the first argument), so the file is never committed.
 *
 * Run: npm run generate:sitemap-xml [-- <outDir>]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildSitemapXml,
  type DetailRecords,
  type RouteGateConfig,
  sitemapPaths,
} from '../src/lib/siteRoutes';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const readJson = <T>(relative: string): T =>
  JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8')) as T;

const config = readJson<RouteGateConfig & { portal: { baseUrl: string } }>(
  'config/lgu.config.json'
);

const records: DetailRecords = {
  departments: readJson('src/data/directory/departments.json'),
  barangays: readJson('src/data/directory/barangays.json'),
  // The merged file is what the services pages read (src/lib/services.ts).
  services: readJson('src/data/citizens-charter/merged-services.json'),
};

const outDir = path.resolve(root, process.argv[2] ?? 'dist');

if (!config.portal.baseUrl) {
  // A fork without a domain yet: skip rather than publish relative URLs.
  console.warn('portal.baseUrl is empty; sitemap.xml not written.');
  process.exit(0);
}

const paths = sitemapPaths(config, records);
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, 'sitemap.xml'),
  buildSitemapXml(config.portal.baseUrl, paths)
);
console.log(
  `sitemap.xml: ${paths.length} URLs written to ${path.relative(root, outDir) || '.'}`
);
