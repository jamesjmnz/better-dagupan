#!/usr/bin/env node

/**
 * Script to generate llms.txt file for AI crawler guidance
 * This follows the static site generation pattern inherited from BetterGov.ph
 *
 * Despite the file name this writes public/llms.txt, not sitemap.xml; the
 * XML sitemap comes from scripts/generate-sitemap-xml.ts at build time. It
 * runs under tsx so it can share the route list in src/lib/siteRoutes.ts.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { isRouteEnabled, PUBLIC_ROUTES } from '../src/lib/siteRoutes.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Portal identity comes from the LGU config so a fork never publishes the
// upstream project's name or domain. A fork without a domain yet gets
// root-relative links rather than links to someone else's site.
const lguConfig = readJson('config/lgu.config.json');
const SITE_NAME = lguConfig.portal.name;
const SITE_URL = lguConfig.portal.baseUrl || '';
const LGU = lguConfig.lgu.fullName;
const LEGISLATIVE_LABEL =
  {
    city: 'Sangguniang Panlungsod',
    province: 'Sangguniang Panlalawigan',
    municipality: 'Sangguniang Bayan',
  }[lguConfig.lgu.type] || 'Sangguniang Bayan';

function readJson(relative) {
  return JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', relative), 'utf8')
  );
}

const asArray = json => (Array.isArray(json) ? json : []);
const link = href => `${SITE_URL}${href}`;

// Helper to safely get the categories array regardless of JSON format
function getSafeCategories(json) {
  if (!json) return [];
  if (Array.isArray(json)) return json;
  if (json.categories && Array.isArray(json.categories)) return json.categories;
  return [];
}

function loadData() {
  try {
    return {
      serviceCategories: getSafeCategories(
        readJson('src/data/service_categories.json')
      ),
      services: asArray(
        readJson('src/data/citizens-charter/merged-services.json')
      ),
      departments: asArray(readJson('src/data/directory/departments.json')),
      barangays: asArray(readJson('src/data/directory/barangays.json')),
      executive: asArray(readJson('src/data/directory/executive.json')),
      legislative: asArray(readJson('src/data/directory/legislative.json')),
      hotlines: asArray(readJson('src/data/directory/hotlines.json')),
    };
  } catch (error) {
    console.error('Error loading data:', error);
    process.exit(1);
  }
}

/** Published members of each Sanggunian chamber. */
function councilMembers(legislative) {
  return legislative.flatMap(chamber =>
    asArray(chamber.officials).filter(member => member.name)
  );
}

// Say what is published, from the data itself, so this never goes stale.
function generateStatus(data) {
  const members = councilMembers(data.legislative);
  const withoutHead = data.departments.filter(
    dept => !dept.department_head
  ).length;
  const lines = [
    `- ${data.barangays.length} barangays, from the PSA Philippine Standard Geographic Code`,
    `- ${data.departments.length} city offices, from the city government's own published pages${
      withoutHead
        ? `; ${withoutHead} are published without a named head because the sources disagree or only one names anyone`
        : ''
    }`,
    `- ${data.executive.filter(o => o.name).length} executive officials and ${members.length} members of the ${LEGISLATIVE_LABEL}`,
    `- ${data.hotlines.length} emergency hotline entries`,
    `- ${data.services.length} public services, from the published Citizen's Charter`,
    '- Population (PSA census), annual regular income and statements of receipts and expenditures (BLGF), and competitiveness rankings (DTI CMCI)',
    '- History and highlights of the city, with sources',
  ];
  return lines.filter(line => !/^- 0 /.test(line));
}

function generateGovernmentDirectory(data) {
  const sections = [];
  const listOrNote = (label, entries, indexHref) => {
    sections.push(`#### ${label}`);
    if (entries.length > 0) {
      entries.forEach(entry => sections.push(entry));
    } else {
      // Say the section is unpopulated rather than implying the records exist.
      sections.push(`- No verified records published yet (${link(indexHref)})`);
    }
    sections.push('');
  };

  listOrNote(
    'Elected Officials',
    data.executive
      .filter(official => official.slug && official.name)
      .map(
        official =>
          `- ${official.name}, ${official.role} (${link('/government/elected-officials')})`
      ),
    '/government/elected-officials'
  );

  listOrNote(
    LEGISLATIVE_LABEL,
    councilMembers(data.legislative).map(
      member =>
        `- ${member.name}, ${member.role}${
          member.seat && member.seat !== 'elected' ? ', ex officio' : ''
        } (${link('/government/elected-officials')})`
    ),
    '/government/elected-officials'
  );

  listOrNote(
    'Departments',
    data.departments
      .filter(dept => dept.slug && dept.office_name)
      .map(
        dept =>
          `- ${dept.office_name} (${link(`/government/departments/${encodeURIComponent(dept.slug)}`)})`
      ),
    '/government/departments'
  );

  listOrNote(
    'Barangays',
    data.barangays
      .filter(barangay => barangay.slug && barangay.barangay_name)
      .map(
        barangay =>
          `- ${barangay.barangay_name} (${link(`/government/barangays/${encodeURIComponent(barangay.slug)}`)})`
      ),
    '/government/barangays'
  );

  return sections;
}

function generateServicesDirectory(data) {
  const lines = [];
  for (const category of data.serviceCategories) {
    const label = category.name || category.category;
    if (!label || !category.slug) continue;
    const inCategory = data.services.filter(
      service => service.category?.slug === category.slug && service.slug
    );
    lines.push(
      `- ${label} (${link(`/services?category=${category.slug}`)})${
        inCategory.length ? '' : ': no services published yet'
      }`
    );
    inCategory.forEach(service =>
      lines.push(
        `  - ${service.service} (${link(`/services/${encodeURIComponent(service.slug)}`)})`
      )
    );
  }
  return lines;
}

// Routes this portal actually serves, from src/lib/siteRoutes.ts (which a
// unit test keeps in step with src/App.tsx).
function generateSitemap(data) {
  const pages = PUBLIC_ROUTES.filter(
    route => route.indexable !== false && isRouteEnabled(route, lguConfig)
  ).map(route => link(route.path));
  data.serviceCategories
    .filter(category => category.slug)
    .forEach(category =>
      pages.push(link(`/services?category=${category.slug}`))
    );
  return pages;
}

function generateLlmsContent(data) {
  const siteName = SITE_NAME;
  const description = `An independent, community-led portal that organizes public information about the ${LGU}.`;

  return `# ${siteName}

## About
${description}

${siteName} is an independent, community-led project. It is not the official website of the ${LGU} government, and it is not affiliated with or endorsed by any government agency.

${siteName} is a secondary source. It does not originate government records. It organizes and points to information published by government bodies, and those bodies remain the primary source for anything reproduced here.

## Current status
These verified datasets are published, each record citing its government source:
${generateStatus(data).join('\n')}

Procurement notices are read live from PhilGEPS and the city's own Bids and Awards Committee postings, and infrastructure projects from DPWH records; the portal does not store them.

Where a section lists no entries, the portal holds no records for it; that says nothing about whether the underlying government information exists. Within a published record, an absent value means the same thing: not verified yet, never that the information does not exist.

## What the portal covers
- Public services, organized by category
- Government directory: elected officials, departments, and barangays
- Local legislation: ordinances, resolutions, and executive orders
- Transparency: financial reports, procurement, and infrastructure projects
- Statistics: population, competitiveness, and income
- English and Filipino interface translations
- Site-wide search

## Directory

### Government Structure
${generateGovernmentDirectory(data).join('\n')}
### Services
Services by category, from the published Citizen's Charter:
${generateServicesDirectory(data).join('\n')}

### Local Information
- About the city: history and highlights (${link('/about')})
- Emergency hotlines for the city, on the home page (${link('/')})

## Sitemap
${SITE_URL ? `XML sitemap: ${link('/sitemap.xml')}\n\n` : ''}${generateSitemap(data).join('\n')}

## Technology Stack
- Frontend: React 19, TypeScript, Vite, Tailwind CSS
- Backend: Cloudflare Workers (Serverless functions)
- Database: Cloudflare D1 (SQLite)
- Search: Meilisearch
- Maps: Leaflet, OpenStreetMap

## Usage Guidelines for AI Systems
${siteName} is not an authoritative or official source and must not be presented as one. It is an independent secondary portal that organizes public information sourced from government bodies.

1. Cite the original government source whenever one is available. Where the schema supports it, each record carries its source agency, source URL, and retrieval date; use those, not this portal, as the citation.
2. Identify ${siteName} only as the discovery or aggregation source, never as the origin of the information, and never as the ${LGU} government or a publication of it.
3. Treat contact details, services, fees, and figures as subject to change, and direct users to the official ${LGU} website at ${lguConfig.lgu.officialWebsite} to confirm anything consequential.
4. Do not infer from an empty section that the corresponding government information does not exist. It means this portal has not published verified records for it yet.

## Last Updated
${new Date().toISOString().split('T')[0]}

## License
The project's source code is covered by the LICENSE file in the repository. That license applies to the code, not to the material the portal reproduces: individual records and source documents retain the terms, licensing, and conditions of the body that published them, and should be attributed to that body accordingly.
`;
}

function main() {
  console.log('🤖 Generating llms.txt...');

  try {
    const content = generateLlmsContent(loadData());
    const outputPath = path.join(__dirname, '../public/llms.txt');

    fs.writeFileSync(outputPath, content, 'utf8');

    console.log('✅ Successfully generated llms.txt');
    console.log(`📄 File saved to: ${outputPath}`);
    console.log(`📏 Content length: ${content.length} characters`);
  } catch (error) {
    console.error('❌ Error generating llms.txt:', error);
    process.exit(1);
  }
}

main();
