import { config } from './lguConfig';
import { lguLabels } from './lguLabels';

// helpers for interpolation using config

export function formatStandardTitle(
  subject: string,
  portalName?: string
): string {
  return `${subject} | ${portalName || config.portal.name}`;
}

export function formatStandardDescription(
  subject: string,
  portalName?: string,
  lguFullName?: string
): string {
  const name = portalName || config.portal.name;
  const lgu = lguFullName || config.lgu.fullName;
  return `Learn more about ${subject} through ${name}, an independent community portal for public information about the ${lgu}.`;
}

/**
 * Resolve {{token}} placeholders in seo-metadata.json entries.
 * Called at runtime by the SEO component.
 */
export const SEO_TOKENS: Record<string, string> = {
  'portal.name': config.portal.name,
  'portal.domain': config.portal.domain,
  'portal.baseUrl': config.portal.baseUrl,
  'lgu.name': lguLabels.name,
  'lgu.fullName': lguLabels.fullName,
  'lgu.province': lguLabels.province,
  'lgu.type': config.lgu.type,
  'lgu.adjective': lguLabels.adjective,
  /** "Sangguniang Panlungsod" for a city */
  'lgu.body': lguLabels.body,
  /** "Barangays" for a city or municipality */
  'lgu.subdivisions': lguLabels.subdivisions,
};

const TOKEN_RE = /\{\{(\w+(?:\.\w+)*)\}\}/g;

export function resolveSeoTokens(text: string): string {
  return text.replace(TOKEN_RE, (_, key) => SEO_TOKENS[key] ?? key);
}
