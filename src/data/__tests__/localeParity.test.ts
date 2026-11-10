import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import lguConfig from '../../../config/lgu.config.json';
import { getEnabledLanguages } from '../../i18n/languages';

const NAMESPACES = ['common', 'about'] as const;
const LANGUAGES = ['en', 'fil'] as const;
const INHERITED = /betterlb|los ba(ñ|n)os|losbanos/i;

const load = (lang: string, ns: string) =>
  JSON.parse(
    readFileSync(
      join(process.cwd(), `public/locales/${lang}/${ns}.json`),
      'utf8'
    )
  );

/** Every key path, plus array lengths, so a short translated list is caught. */
const shapeOf = (value: unknown, prefix = ''): string[] => {
  if (Array.isArray(value)) {
    return [
      `${prefix}[]=${value.length}`,
      ...value.flatMap((item, i) => shapeOf(item, `${prefix}[${i}]`)),
    ];
  }
  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).flatMap(
      ([k, v]) => [
        `${prefix}${prefix ? '.' : ''}${k}`,
        ...shapeOf(v, `${prefix}${prefix ? '.' : ''}${k}`),
      ]
    );
  }
  return [];
};

/** Every leaf string, keyed by its path. */
const stringsOf = (
  value: unknown,
  prefix = '',
  out: Record<string, string> = {}
): Record<string, string> => {
  if (typeof value === 'string') {
    out[prefix] = value;
  } else if (Array.isArray(value)) {
    value.forEach((item, i) => stringsOf(item, `${prefix}[${i}]`, out));
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      stringsOf(v, `${prefix}${prefix ? '.' : ''}${k}`, out);
    }
  }
  return out;
};

/** The {{placeholders}} a string interpolates, sorted. */
const placeholdersOf = (text: string): string[] =>
  [...text.matchAll(/\{\{\s*([^}]+?)\s*\}\}/g)].map(m => m[1]).sort();

describe('locale files', () => {
  it.each(NAMESPACES)('%s has identical keys in English and Filipino', ns => {
    const en = shapeOf(load('en', ns)).sort();
    const fil = shapeOf(load('fil', ns)).sort();

    expect(fil).toEqual(en);
  });

  it.each(LANGUAGES)('%s carries no inherited portal or LGU name', lang => {
    for (const ns of NAMESPACES) {
      expect(JSON.stringify(load(lang, ns))).not.toMatch(INHERITED);
    }
  });

  it.each(LANGUAGES)('%s states the independent-project disclaimer', lang => {
    const common = load(lang, 'common');

    expect(common.disclaimer.short).toMatch(/\{\{portal\}\}/);
    expect(common.disclaimer.short).toMatch(/\{\{lgu\}\}/);
    // The portal must never present itself as the city government's own site.
    expect(common.disclaimer.short.toLowerCase()).toMatch(
      lang === 'en' ? /not the official website/ : /hindi ito ang opisyal/
    );
    expect(common.disclaimer.noticeTitle).toBeTruthy();
    expect(common.disclaimer.noticeBody).toBeTruthy();
  });

  it.each(LANGUAGES)('%s explains why a section is empty', lang => {
    const common = load(lang, 'common');

    expect(common.emptyState.title).toBeTruthy();
    expect(common.emptyState.body).toMatch(/\{\{lgu\}\}/);
  });

  it('uses city terminology rather than municipality', () => {
    expect(JSON.stringify(load('en', 'common'))).not.toMatch(
      /Sangguniang Bayan|Municipal Departments|Municipality of/i
    );
    expect(JSON.stringify(load('fil', 'common'))).not.toMatch(
      /Sangguniang Bayan|Munisipalidad|Munisipyo/i
    );
  });
});

/**
 * Pangasinan is translated by people, not generated, so its files fill in
 * gradually and every missing key falls back to English. These checks allow a
 * partial translation but nothing that would break the fallback or a page.
 */
describe('Pangasinan locale', () => {
  it.each(NAMESPACES)('%s is a JSON object', ns => {
    const pag = load('pag', ns);

    expect(pag).toBeTypeOf('object');
    expect(Array.isArray(pag)).toBe(false);
    expect(pag).not.toBeNull();
  });

  it.each(NAMESPACES)('%s has no key that English lacks', ns => {
    // Shapes include array lengths, so a translated list must be complete:
    // a present array replaces the English one rather than merging with it.
    const en = new Set(shapeOf(load('en', ns)));
    const stray = shapeOf(load('pag', ns)).filter(key => !en.has(key));

    expect(stray).toEqual([]);
  });

  it.each(NAMESPACES)('%s puts strings only where English has them', ns => {
    const en = stringsOf(load('en', ns));
    const pag = stringsOf(load('pag', ns));

    for (const [key, text] of Object.entries(pag)) {
      expect(en, key).toHaveProperty([key]);
      // An empty string would render blank instead of falling back.
      expect(text.trim(), key).not.toBe('');
    }
  });

  it.each(NAMESPACES)('%s keeps the same placeholders as English', ns => {
    const en = stringsOf(load('en', ns));
    const pag = stringsOf(load('pag', ns));

    for (const [key, text] of Object.entries(pag)) {
      expect(placeholdersOf(text), key).toEqual(placeholdersOf(en[key] ?? ''));
    }
  });

  it('carries no inherited portal or LGU name', () => {
    for (const ns of NAMESPACES) {
      expect(JSON.stringify(load('pag', ns))).not.toMatch(INHERITED);
    }
  });

  it('is switched off by default', () => {
    expect(lguConfig.features.pangasinan).toBe(false);
    expect(
      readFileSync(join(process.cwd(), 'scripts/setup-lgu.cjs'), 'utf8')
    ).toMatch(/pangasinan:\s*false/);
  });

  it('is offered in the switcher only when the flag is on', () => {
    const codes = (pangasinan: boolean) =>
      getEnabledLanguages({ pangasinan }).map(language => language.code);

    expect(codes(false)).toEqual(['en', 'fil']);
    expect(codes(true)).toEqual(['en', 'fil', 'pag']);
  });
});
