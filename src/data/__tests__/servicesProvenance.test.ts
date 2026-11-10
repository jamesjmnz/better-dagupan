import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { describe, expect, it } from 'vitest';

import { getCivicSource, hasCivicSource } from '@/lib/civicSources';

import citizensCharterRaw from '@/data/citizens-charter/citizens-charter.json';
import mergedServicesRaw from '@/data/citizens-charter/merged-services.json';
import departmentsRaw from '@/data/directory/departments.json';
import communityServicesRaw from '@/data/services/services.json';

import type { CitizensCharterData } from '@/types/citizens-charter';
import type { Department } from '@/types/directoryTypes';
import type { Service } from '@/types/servicesTypes';

/**
 * The services directory is the first dataset Better Dagupan publishes that
 * tells a reader what to do rather than who holds an office: bring these
 * documents, pay at this counter, expect this long. A wrong requirement sends
 * someone home from city hall, so every published field is the city's own
 * wording from its Citizen's Charter pages, and these tests pin that down.
 *
 * The charter is self-published by the city and is the authority on its own
 * procedures, so there is no independent second family to corroborate it
 * against. The check comes from inside the document instead: every page that
 * prints a total processing time must have step times that add up to it, and
 * the one page whose steps do not is published without a total.
 *
 * See docs/civic-data-verification.md, "Worked example: the Citizen's
 * Charter services".
 */
const charter = (citizensCharterRaw as CitizensCharterData).services;
const merged = mergedServicesRaw as Service[];
const community = communityServicesRaw as Service[];
const departments = departmentsRaw as Department[];

const loadSchema = (path: string) =>
  JSON.parse(readFileSync(join(process.cwd(), path), 'utf8'));

const compile = (path: string) => {
  const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
  addFormats(ajv);
  return ajv.compile(loadSchema(path));
};

/** The ten services the city's Citizen's Charter index links to. */
const EXPECTED_SERVICES = [
  'Applying for a New Business Permit',
  'Applying for Renewal of Business Permit',
  'Applying for Amendment to Existing Business Permit',
  'Retiring a Business Operation',
  'Securing Certification of Business Record',
  'Issuance of Certified Copy of Business Permit',
  'Securing Mayor’s Clearance',
  'Issuance of Tricycle Operator’s Permit',
  'Securing Mayor’s Permit for the Following Activities or Undertakings',
  'Issuance of Community Tax Certificate',
];

/**
 * The only single amounts the charter prints. Every other service refers the
 * reader to a table of taxes, fees and charges that is not on the page, and
 * is published with no fee rather than with a guessed one.
 */
const EXPECTED_FEES: Record<string, string> = {
  'Securing Certification of Business Record': 'Php 200.00',
  'Issuance of Certified Copy of Business Permit': 'Php 100.00',
  'Securing Mayor’s Clearance': 'Php 50.00',
};

/**
 * The renewal page prints "TOTAL PROCESSING TIME: 30 minutes", but its own
 * fourteen step times add up to 27. One of the two is wrong and the page does
 * not say which, so no total is published for it.
 */
const CONFLICTING_TOTALS: Record<string, { printed: string; steps: number }> = {
  'Applying for Renewal of Business Permit': {
    printed: '30 minutes',
    steps: 27,
  },
};

/**
 * A sample of the staff the charter names in its person-responsible column.
 * The column is not transcribed; these must never appear.
 */
const WITHHELD_STAFF = [
  'Lynthzy',
  'Tablada',
  'Tersol',
  'Ngilay',
  'Catabay',
  'Iasmine',
  'Belen T. Fernandez',
  'Hon.',
  'personnel on duty',
];

const INHERITED =
  /los ba(ñ|n)os|losbanos\.gov\.ph|sangguniang bayan|betterlb|municipality of|laguna|\(049\)/i;

/** "1 hour and 16 minutes" -> 76. */
const minutesIn = (text: string | null | undefined): number =>
  [...(text ?? '').matchAll(/(\d+)\s*(hour|minute)/g)].reduce(
    (sum, [, n, unit]) => sum + Number(n) * (unit === 'hour' ? 60 : 1),
    0
  );

const stepMinutes = (service: (typeof charter)[number]): number =>
  service.client_steps
    .flatMap(step => step.agency_actions ?? [])
    .reduce((sum, action) => sum + minutesIn(action.processing_time), 0);

describe('Citizen’s Charter services', () => {
  it('validates the transcribed charter against its schema', () => {
    const validate = compile(
      'src/data/citizens-charter/schema/citizens-charter.schema.json'
    );
    const valid = validate(citizensCharterRaw);

    expect(validate.errors ?? []).toEqual([]);
    expect(valid).toBe(true);
  });

  it('validates the merged and community services against the services schema', () => {
    for (const records of [merged, community]) {
      const validate = compile('src/data/schema/services.schema.json');
      const valid = validate(records);

      expect(validate.errors ?? []).toEqual([]);
      expect(valid).toBe(true);
    }
  });

  it('publishes exactly the services the charter index lists', () => {
    expect(charter.map(s => s.service_name).sort()).toEqual(
      [...EXPECTED_SERVICES].sort()
    );
  });

  it('gives every service a unique name and slug', () => {
    expect(new Set(charter.map(s => s.service_name)).size).toBe(charter.length);
    expect(new Set(merged.map(s => s.slug)).size).toBe(merged.length);
  });

  it('cites one charter page per service, published by the city', () => {
    const cited = charter.flatMap(s => s.sources);

    // One page per service, and no page backing two services.
    expect(new Set(cited).size).toBe(charter.length);

    for (const service of charter) {
      expect(service.sources, service.service_name).toHaveLength(1);
      const [id] = service.sources;
      expect(hasCivicSource(id), id).toBe(true);

      const source = getCivicSource(id);
      expect(source.agency).toBe('City Government of Dagupan');
      // The city's charter page, or, while the city's server could not be
      // read, an Internet Archive capture of it (see the worked example).
      expect(source.url).toMatch(
        /^https:\/\/(web\.archive\.org\/web\/\d{14}\/)?https:\/\/www\.dagupan\.gov\.ph\/residents\/[a-z0-9-]+\/$/
      );
      // The page title is the service name as published.
      expect(source.title).toBe(service.service_name);
      expect(source.derives_from ?? null).toBeNull();
      expect(source.coverage ?? null).toBeNull();
    }
  });

  it('links every service to an office in the directory', () => {
    const slugs = new Set(departments.map(d => d.slug));

    for (const service of merged) {
      const officeSlugs = Array.isArray(service.officeSlug)
        ? service.officeSlug
        : [service.officeSlug];

      expect(officeSlugs.length, service.slug).toBeGreaterThan(0);
      for (const slug of officeSlugs) {
        expect(slugs.has(slug), `${service.slug}: ${slug}`).toBe(true);
      }
    }
  });

  it('carries every charter record into the merged services unchanged', () => {
    const charterMerged = merged.filter(s => s.source === 'citizens-charter');

    expect(charterMerged).toHaveLength(charter.length);
    for (const record of charter) {
      const service = charterMerged.find(
        s => s.service === record.service_name
      );

      expect(service, record.service_name).toBeDefined();
      expect(service?.sources).toEqual(record.sources);
      expect(service?.officeDivision).toBe(record.office_division);
      expect(service?.classification ?? null).toBe(record.classification);
      expect(service?.whoMayAvail ?? null).toBe(record.who_may_avail);
      expect(service?.detailedRequirements ?? []).toEqual(record.requirements);
      expect(service?.clientSteps ?? []).toEqual(record.client_steps);
      expect(service?.fees ?? null).toEqual(record.fees);
      expect(service?.processingTime ?? null).toBe(record.processing_time);
      expect(service?.needsVerification).toBe(false);
    }
  });

  it('numbers the client steps in order', () => {
    for (const service of charter) {
      expect(
        service.client_steps.map(s => s.step),
        service.service_name
      ).toEqual(service.client_steps.map((_, i) => i + 1));
    }
  });

  it('adds up the step times to every published total', () => {
    // The parts-sum-to-the-whole check: the charter's one internal means of
    // catching a transcription slip, on either side of the page or this file.
    for (const service of charter) {
      if (service.processing_time === null) continue;

      expect(service.processing_time_status).toBe('stated');
      expect(stepMinutes(service), service.service_name).toBe(
        minutesIn(service.processing_time)
      );
    }
  });

  it('withholds a total that the page’s own steps contradict', () => {
    const conflicting = charter.filter(
      s => s.processing_time_status === 'conflicting'
    );

    expect(conflicting.map(s => s.service_name).sort()).toEqual(
      Object.keys(CONFLICTING_TOTALS).sort()
    );
    for (const service of conflicting) {
      const { printed, steps } = CONFLICTING_TOTALS[service.service_name];

      expect(service.processing_time).toBeNull();
      expect(stepMinutes(service)).toBe(steps);
      expect(minutesIn(printed)).not.toBe(steps);
      expect(JSON.stringify(service)).not.toContain(printed);
    }
  });

  it('publishes a fee only where the charter prints a single amount', () => {
    for (const service of charter) {
      const cells = service.client_steps
        .flatMap(step => step.agency_actions ?? [])
        .map(action => action.fees)
        .filter((fee): fee is string => fee !== null && fee !== 'None');

      const expected = EXPECTED_FEES[service.service_name];
      if (expected) {
        expect(service.fees?.amount, service.service_name).toBe(expected);
        // The amount is the one printed in the fee column, nothing derived.
        expect(cells).toEqual([expected]);
      } else {
        expect(service.fees, service.service_name).toBeNull();
        expect(
          cells.some(cell => /Table of Taxes/i.test(cell)),
          service.service_name
        ).toBe(true);
      }
    }
  });

  it('marks unstated details as unset rather than blank', () => {
    for (const service of charter) {
      for (const req of service.requirements) {
        expect(req.where_to_secure, req.requirement).not.toBe('');
      }
      for (const action of service.client_steps.flatMap(
        step => step.agency_actions ?? []
      )) {
        expect(action.fees, action.action).not.toBe('');
        expect(action.processing_time, action.action).not.toBe('');
      }
    }
  });

  it('does not republish the staff named in the charter', () => {
    const serialised = JSON.stringify([charter, merged]);

    for (const name of WITHHELD_STAFF) {
      expect(serialised).not.toContain(name);
    }
    expect(serialised).not.toMatch(/person_?responsible/i);
  });

  it('mentions no inherited LGU', () => {
    expect(JSON.stringify([charter, merged, community])).not.toMatch(INHERITED);
  });
});
