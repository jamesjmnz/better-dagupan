import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';

import { config } from '@/lib/lguConfig';
import { resolveSeoTokens, SEO_TOKENS } from '@/lib/seoTemplates';
import { PUBLIC_ROUTES } from '@/lib/siteRoutes';

import seoMetadata from '@/data/seo-metadata.json';
import serviceCategories from '@/data/service_categories.json';

/**
 * src/data/seo-metadata.json gives each route its page title and description
 * before the page itself loads. The template shipped the national portal's
 * routes (/flood-control-projects, /government/constitutional/...), so no
 * Better Dagupan page matched and every one fell back to the generic title.
 * These tests hold the file to the routes this portal serves.
 */
type Fields = { title?: string; description?: string; subject?: string };

const metadata = seoMetadata as Record<string, Fields | Record<string, Fields>>;

const schema = JSON.parse(
  readFileSync(
    join(process.cwd(), 'src/data/schema/seo-metadata.schema.json'),
    'utf8'
  )
);

/** Every title/description string in the file, with where it came from. */
const strings = Object.entries(metadata).flatMap(([route, entry]) =>
  Object.entries(entry).flatMap(([key, value]) =>
    typeof value === 'string'
      ? [{ at: `${route} ${key}`, text: value }]
      : Object.entries(value).map(([field, text]) => ({
          at: `${route} ${key}.${field}`,
          text: text as string,
        }))
  )
);

describe('SEO metadata', () => {
  it('matches its schema', () => {
    const validate = new Ajv({ allErrors: true }).compile(schema);

    expect(validate(seoMetadata), JSON.stringify(validate.errors)).toBe(true);
  });

  it('has an entry for every public route', () => {
    const missing = PUBLIC_ROUTES.map(route => route.path).filter(
      path => !(path in metadata)
    );

    expect(missing).toEqual([]);
  });

  it('has no entry for a route the portal does not serve', () => {
    const served = new Set(PUBLIC_ROUTES.map(route => route.path));

    expect(Object.keys(metadata).filter(path => !served.has(path))).toEqual([]);
  });

  it('gives each route a title and a description', () => {
    for (const [route, entry] of Object.entries(metadata)) {
      const fields = ('_default' in entry ? entry._default : entry) as Fields;

      expect(fields.title, route).toBeTruthy();
      expect(fields.description, route).toBeTruthy();
    }
  });

  it('keys service query entries by real category slugs', () => {
    const slugs = serviceCategories.categories.map(c => `category=${c.slug}`);
    const queries = Object.keys(metadata['/services']).filter(
      key => key !== '_default'
    );

    expect(queries.sort()).toEqual(slugs.sort());
  });

  it('uses only tokens the resolver knows', () => {
    for (const { at, text } of strings) {
      for (const [, token] of text.matchAll(/\{\{([\w.]+)\}\}/g)) {
        expect(SEO_TOKENS, at).toHaveProperty([token]);
      }
      expect(resolveSeoTokens(text), at).not.toMatch(/\{\{|\}\}/);
    }
  });

  it("names this portal and LGU, not the template's", () => {
    const resolved = strings.map(({ text }) => resolveSeoTokens(text));

    expect(resolveSeoTokens((metadata['/'] as Fields).title ?? '')).toContain(
      config.lgu.fullName
    );
    for (const text of resolved) {
      expect(text).not.toMatch(
        /los ba(ñ|n)os|betterlb|bettergov|in (the )?philippines\b/i
      );
    }
  });

  it('keeps descriptions within what search results display', () => {
    for (const { at, text } of strings.filter(s => /description/.test(s.at))) {
      expect(resolveSeoTokens(text).length, at).toBeLessThanOrEqual(200);
    }
  });
});
