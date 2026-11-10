import { describe, expect, it } from 'vitest';

import lguConfig from '../../../config/lgu.config.json';
import {
  buildNoticesUrl,
  buildTypesUrl,
  decodeEntities,
  mapNotice,
  parseQuery,
} from '../city-notices';

const config = {
  api: 'https://www.example.gov.ph/wp-json/wp/v2/',
  postType: 'bac',
  typeTaxonomy: 'bac-type',
};

describe('city procurement notices', () => {
  it('decodes WordPress title entities and strips markup', () => {
    expect(
      decodeEntities('REPAIR &#8211; BARANGAY II &amp; III <b>CITY</b>')
    ).toBe('REPAIR – BARANGAY II & III CITY');
    expect(decodeEntities('A&nbsp;&nbsp; B &#x2019;s')).toBe('A B ’s');
  });

  it('clamps the query string', () => {
    expect(parseQuery(new URLSearchParams('page=-4&type=abc'))).toEqual({
      page: 1,
      search: '',
      type: null,
    });
    const long = 'x'.repeat(300);
    const q = parseQuery(new URLSearchParams(`page=3&type=92&search=${long}`));
    expect(q.page).toBe(3);
    expect(q.type).toBe(92);
    expect(q.search).toHaveLength(100);
  });

  it('builds the upstream URLs from config', () => {
    const url = new URL(
      buildNoticesUrl(config, { page: 2, search: 'market', type: 92 })
    );
    expect(url.origin + url.pathname).toBe(
      'https://www.example.gov.ph/wp-json/wp/v2/bac'
    );
    expect(url.searchParams.get('page')).toBe('2');
    expect(url.searchParams.get('per_page')).toBe('20');
    expect(url.searchParams.get('search')).toBe('market');
    expect(url.searchParams.get('bac-type')).toBe('92');
    expect(buildTypesUrl(config)).toContain('/wp-json/wp/v2/bac-type?');
  });

  it('maps a notice without rewriting its link', () => {
    const notice = mapNotice(
      {
        id: 7,
        date: '2026-10-28T06:57:42',
        link: 'https://www.example.gov.ph/bac/some-notice/',
        title: { rendered: 'SUPPLY &amp; DELIVERY' },
        'bac-type': [92],
      },
      'bac-type',
      new Map([[92, 'Competitive Bidding']])
    );
    expect(notice).toEqual({
      id: 7,
      date: '2026-10-28T06:57:42',
      title: 'SUPPLY & DELIVERY',
      link: 'https://www.example.gov.ph/bac/some-notice/',
      type: 'Competitive Bidding',
    });
  });

  it('points the feed at the city government site', () => {
    const feed = lguConfig.transparency.procurement.cityNotices;
    expect(new URL(feed.api).hostname).toBe(
      new URL(lguConfig.lgu.officialWebsite).hostname
    );
  });
});
