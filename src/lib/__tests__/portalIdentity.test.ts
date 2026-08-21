import { describe, expect, it } from 'vitest';

import { config } from '@/lib/lguConfig';
import { lguLabels } from '@/lib/lguLabels';

/** Anything that would put the inherited portal or LGU back on screen. */
const INHERITED = /betterlb|los ba(ñ|n)os|losbanos/i;

describe('Better Dagupan public identity', () => {
  it('names the portal and the LGU', () => {
    expect(config.portal.name).toBe('Better Dagupan');
    expect(config.portal.footerBrandName).toBe('Better Dagupan');
    expect(config.lgu.name).toBe('Dagupan');
    expect(config.lgu.fullName).toBe('City of Dagupan');
    expect(config.lgu.province).toBe('Pangasinan');
  });

  it('uses city terminology, not municipality', () => {
    expect(config.lgu.type).toBe('city');
    expect(lguLabels.adjective).toBe('City');
    expect(lguLabels.body).toBe('Sangguniang Panlungsod');
  });

  it('carries no inherited BetterLB or Los Banos identity', () => {
    expect(JSON.stringify(config)).not.toMatch(INHERITED);
  });

  it('claims no domain or social account it does not own', () => {
    // Deliberately unset until a production domain is assigned. An empty
    // baseUrl keeps SEO canonicals root-relative instead of inventing a host.
    expect(config.portal.domain).toBe('');
    expect(config.portal.baseUrl).toBe('');
    expect(config.portal.discordUrl).toBe('');
    expect(config.portal.facebookUrl).toBe('');
    expect(config.portal.githubUrl).toBe(
      'https://github.com/jamesjmnz/better-dagupan'
    );
  });

  it('points branding at assets that exist in public/', () => {
    for (const path of [
      config.portal.navbarLogoPath,
      config.portal.logoWhitePath,
      config.portal.faviconSvgPath,
    ]) {
      expect(path).toMatch(/^\/logos\/svg\/better-dagupan-/);
    }
    // No OG image while there is no absolute base URL to serve one from.
    expect(config.portal.defaultOgImagePath).toBe('');
  });
});
