import { describe, expect, it } from 'vitest';

import lguConfig from '../../../config/lgu.config.json';
import legislative from '../../../src/data/directory/legislative.json';
import {
  buildClassificationsUrl,
  buildOrdinancesUrl,
  mapClassifications,
  mapOrdinance,
  parseOrdinancesQuery,
} from '../council-ordinances';

const config = {
  api: 'https://council.example.gov.ph/wp-json/wp/v2/',
  postType: 'ordinance',
  taxonomy: 'classification',
  pageUrl: 'https://council.example.gov.ph/ordinance/',
};

describe('council ordinances', () => {
  it('clamps the query string', () => {
    expect(
      parseOrdinancesQuery(new URLSearchParams('page=0&classification=x'))
    ).toEqual({ page: 1, search: '', classification: null });

    const query = parseOrdinancesQuery(
      new URLSearchParams(
        `page=4&classification=11&search=${'y'.repeat(250)}&type=9`
      )
    );
    expect(query.page).toBe(4);
    expect(query.classification).toBe(11);
    expect(query.search).toHaveLength(100);
  });

  it('builds the ordinances URL from config', () => {
    const url = new URL(
      buildOrdinancesUrl(config, {
        page: 2,
        search: 'tricycle',
        classification: 14,
      })
    );
    expect(url.origin + url.pathname).toBe(
      'https://council.example.gov.ph/wp-json/wp/v2/ordinance'
    );
    expect(url.searchParams.get('page')).toBe('2');
    expect(url.searchParams.get('per_page')).toBe('20');
    expect(url.searchParams.get('search')).toBe('tricycle');
    expect(url.searchParams.get('classification')).toBe('14');
    expect(url.searchParams.get('_fields')).toBe(
      'id,date,link,title,classification'
    );
  });

  it('leaves the taxonomy out when none is configured', () => {
    const untagged = { ...config, taxonomy: undefined };
    const url = new URL(
      buildOrdinancesUrl(untagged, { page: 1, search: '', classification: 3 })
    );
    expect(url.searchParams.get('_fields')).toBe('id,date,link,title');
    expect(url.searchParams.has('classification')).toBe(false);
    expect(url.searchParams.has('search')).toBe(false);
    expect(buildClassificationsUrl(untagged)).toBeNull();
    expect(buildClassificationsUrl(config)).toBe(
      'https://council.example.gov.ph/wp-json/wp/v2/classification?per_page=50&_fields=id%2Cname%2Ccount'
    );
  });

  it('decodes classification names and drops unused ones', () => {
    expect(
      mapClassifications([
        { id: 10, name: 'Agriculture &amp; Fisheries', count: 0 },
        { id: 14, name: 'Communication &amp; Public Information', count: 23 },
        { id: 'bad', name: 'Not a term' },
      ])
    ).toEqual([
      { id: 14, name: 'Communication & Public Information', count: 23 },
    ]);
    expect(mapClassifications({ code: 'rest_no_route' })).toEqual([]);
    expect(mapClassifications(null)).toEqual([]);
  });

  it('maps an ordinance without rewriting its link or inventing fields', () => {
    const ordinance = mapOrdinance(
      {
        id: 2226,
        date: '2026-01-17T20:06:12',
        link: 'https://council.example.gov.ph/ordinance/an-ordinance/',
        title: {
          rendered:
            'AN ORDINANCE &#8220;SAFE INTERNET SPACES&#8221; &amp; MORE',
        },
        classification: [14, 99],
      },
      'classification',
      new Map([[14, 'Communication & Public Information']])
    );
    expect(ordinance).toEqual({
      id: 2226,
      postedAt: '2026-01-17T20:06:12',
      title: 'AN ORDINANCE “SAFE INTERNET SPACES” & MORE',
      link: 'https://council.example.gov.ph/ordinance/an-ordinance/',
      classifications: ['Communication & Public Information'],
    });
  });

  it('handles an ordinance with no classification', () => {
    const ordinance = mapOrdinance(
      {
        id: 1,
        date: '2021-06-03T07:16:33',
        link: 'https://council.example.gov.ph/ordinance/one/',
        title: { rendered: 'Granting incentives' },
        classification: [],
      },
      'classification',
      new Map()
    );
    expect(ordinance.classifications).toEqual([]);
    expect(ordinance).not.toHaveProperty('number');
    expect(ordinance).not.toHaveProperty('enactedAt');
  });

  it("points the feed at the council's own website", () => {
    const feed = lguConfig.openlgu.councilFeed;
    const council = legislative.find(body => body.branch === 'Legislative');
    const councilHost = new URL(council!.website!).hostname;
    expect(new URL(feed.api).hostname).toBe(councilHost);
    expect(new URL(feed.pageUrl).hostname).toBe(councilHost);
  });
});
