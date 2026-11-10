import { config, type LGUConfig } from '../lib/lguConfig';
import { LanguageType } from '../types';

export interface LanguageInfo {
  code: LanguageType;
  name: string;
  nativeName: string;
}

export const LANGUAGES: Record<LanguageType, LanguageInfo> = {
  en: { code: 'en', name: 'English', nativeName: 'English' },
  fil: { code: 'fil', name: 'Tagalog', nativeName: 'Filipino/Tagalog' },
  pag: { code: 'pag', name: 'Pangasinan', nativeName: 'Pangasinan' },
};

export const DEFAULT_LANGUAGE: LanguageType = 'en';

/**
 * Languages a reader can choose.
 *
 * Pangasinan is scaffolded but not translated: its locale files stay empty
 * until a human translator supplies reviewed strings, and every missing key
 * falls back to English. It is offered only once `features.pangasinan` is
 * switched on in config/lgu.config.json.
 */
export function getEnabledLanguages(
  features: Pick<LGUConfig['features'], 'pangasinan'> = config.features
): LanguageInfo[] {
  return Object.values(LANGUAGES).filter(
    language => language.code !== 'pag' || features.pangasinan
  );
}
