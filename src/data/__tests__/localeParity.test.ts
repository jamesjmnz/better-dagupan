import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

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
