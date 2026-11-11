import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { afterEach } from 'vitest';

// Components read their copy through i18next. Load the English locale files
// that ship, synchronously, so a rendered component shows the real sentence
// instead of its translation key.
const localeDir = join(process.cwd(), 'public/locales/en');
const en = Object.fromEntries(
  readdirSync(localeDir)
    .filter(file => file.endsWith('.json'))
    .map(file => [
      file.replace(/\.json$/, ''),
      JSON.parse(readFileSync(join(localeDir, file), 'utf8')),
    ])
);

await i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: Object.keys(en),
  resources: { en },
  initAsync: false,
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});
