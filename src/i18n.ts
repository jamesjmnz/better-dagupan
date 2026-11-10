import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

import { getEnabledLanguages } from './i18n/languages';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // Any key missing from a locale renders in English. Pangasinan relies on
    // this: its files hold only human-translated strings, so an untranslated
    // key shows the English text rather than a raw key or a guess.
    fallbackLng: 'en',
    // Only languages the portal offers. Pangasinan is left out until
    // features.pangasinan is enabled, so a stored or detected `pag` falls back
    // to English instead of loading a locale the switcher does not show.
    supportedLngs: getEnabledLanguages().map(language => language.code),
    debug: false,
    defaultNS: 'common',
    ns: ['common', 'visa', 'about', 'about-philippines', 'ui'],

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
