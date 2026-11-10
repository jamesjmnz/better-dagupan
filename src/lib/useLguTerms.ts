import { useTranslation } from 'react-i18next';

import { config } from './lguConfig';
import { lguLabels } from './lguLabels';

/**
 * LGU names and type-aware terms for interpolating into translated copy.
 *
 * `lguLabels` holds the English terminology. Words such as "City" or
 * "Municipal" change form and position in Filipino ("Kita ng Lungsod"), so
 * those come from the `ui` namespace, keyed by `config.lgu.type` through
 * i18next context. Proper nouns (the LGU name, the Sanggunian) are passed
 * through as configured.
 */
export function useLguTerms() {
  const { t } = useTranslation('ui');
  const context = config.lgu.type;
  const name = config.lgu.name;

  return {
    /** "Dagupan" */
    lgu: name,
    /** "Pangasinan" */
    province: config.lgu.province,
    /** "Better Dagupan" */
    portal: config.portal.name,
    /** "Sangguniang Panlungsod" */
    body: lguLabels.body,
    /** "City of Dagupan" / "Lungsod ng Dagupan" */
    fullName: t('lgu.fullName', { context, name }),
    /** "City" / "Lungsod" */
    adjective: t('lgu.adjective', { context }),
    /** "city" / "lungsod" */
    adjectiveLower: t('lgu.adjectiveLower', { context }),
    /** "Mayor" / "Alkalde" */
    head: t('lgu.head', { context }),
  };
}
