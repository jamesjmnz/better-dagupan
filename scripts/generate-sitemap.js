#!/usr/bin/env node

/**
 * Script to generate llms.txt file for AI crawler guidance
 * This follows the static site generation pattern inherited from BetterGov.ph
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Portal identity comes from the LGU config so a fork never publishes the
// upstream project's name or domain. baseUrl is empty until a production
// domain is assigned, which keeps these links root-relative rather than
// pointing at someone else's site.
const lguConfigPath = path.join(__dirname, '../config/lgu.config.json');
const lguConfig = JSON.parse(fs.readFileSync(lguConfigPath, 'utf8'));
const SITE_NAME = lguConfig.portal.name;
const SITE_URL = lguConfig.portal.baseUrl || '';
const LEGISLATIVE_LABEL =
  {
    city: 'Sangguniang Panlungsod',
    province: 'Sangguniang Panlalawigan',
    municipality: 'Sangguniang Bayan',
  }[lguConfig.lgu.type] || 'Sangguniang Bayan';

// Import data paths
const serviceCategoriesPath = path.join(
  __dirname,
  '../src/data/service_categories.json'
);
const departmentsPath = path.join(
  __dirname,
  '../src/data/directory/departments.json'
);
const legislativePath = path.join(
  __dirname,
  '../src/data/directory/legislative.json'
);
const executivePath = path.join(
  __dirname,
  '../src/data/directory/executive.json'
);

// Routes this portal actually serves, mirroring src/App.tsx. The template
// shipped the upstream national portal's navigation (/philippines, /travel),
// which does not exist here, so crawlers were pointed at 404s.
const mainNavigation = [
  {
    label: 'Services',
    href: '/services',
    children: [], // Populated from service categories below
  },
  {
    label: 'Government',
    href: '/government',
    children: [
      { label: 'Elected Officials', href: '/government/elected-officials' },
      {
        label: 'Committees',
        href: '/government/elected-officials/committees',
      },
      { label: 'Departments', href: '/government/departments' },
      { label: 'Barangays', href: '/government/barangays' },
    ],
  },
  {
    label: 'Statistics',
    href: '/statistics',
    children: [
      { label: 'Competitiveness', href: '/statistics/competitiveness' },
      { label: 'Income', href: '/statistics/municipal-income' },
    ],
  },
  {
    label: 'Transparency',
    href: '/transparency',
    children: [
      { label: 'Financial Reports', href: '/transparency/financial' },
      { label: 'Procurement', href: '/transparency/procurement' },
      { label: 'Infrastructure', href: '/transparency/infrastructure' },
    ],
  },
  {
    label: 'OpenLGU',
    href: '/openlgu',
    children: [],
  },
  {
    label: 'Contribute',
    href: '/contribute',
    children: [],
  },
];

// Helper to safely get the categories array regardless of JSON format
function getSafeCategories(json) {
  if (!json) return [];
  if (Array.isArray(json)) return json;
  if (json.categories && Array.isArray(json.categories)) return json.categories;
  return [];
}

// Function to load data
function loadData() {
  try {
    // Import service categories
    const serviceCategoriesRaw = fs.readFileSync(serviceCategoriesPath, 'utf8');
    const serviceCategories = JSON.parse(serviceCategoriesRaw);

    // Import government directory data
    const departments = JSON.parse(fs.readFileSync(departmentsPath, 'utf8'));
    const legislative = JSON.parse(fs.readFileSync(legislativePath, 'utf8'));
    const executive = JSON.parse(fs.readFileSync(executivePath, 'utf8'));

    // Populate services children from categories
    const servicesNav = mainNavigation.find(nav => nav.label === 'Services');
    const categoriesList = getSafeCategories(serviceCategories);

    if (servicesNav && categoriesList.length > 0) {
      servicesNav.children = categoriesList.map(category => ({
        label: category.name || category.category, // Support both new 'name' and old 'category'
        href: `/services?category=${category.slug}`,
      }));
    }

    return {
      mainNavigation,
      serviceCategories,
      departments,
      legislative,
      executive,
    };
  } catch (error) {
    console.error('Error loading data:', error);
    process.exit(1);
  }
}

// Function to generate government directory information
function generateGovernmentDirectory(governmentData) {
  const sections = [];
  const listOrNote = (label, entries, indexHref) => {
    sections.push(`#### ${label}`);
    if (entries.length > 0) {
      entries.forEach(entry => sections.push(entry));
    } else {
      // Say the section is unpopulated rather than implying the records exist.
      sections.push(
        `- No verified records published yet (${SITE_URL}${indexHref})`
      );
    }
    sections.push('');
  };

  const executive = Array.isArray(governmentData.executive)
    ? governmentData.executive
        .filter(official => official.slug && official.name)
        .map(
          official =>
            `- ${official.name}, ${official.role} (${SITE_URL}/government/elected-officials)`
        )
    : [];
  listOrNote('Elected Officials', executive, '/government/elected-officials');

  const departments = Array.isArray(governmentData.departments)
    ? governmentData.departments
        .filter(dept => dept.slug && dept.office_name)
        .slice(0, 10)
        .map(
          dept =>
            `- ${dept.office_name} (${SITE_URL}/government/departments/${encodeURIComponent(
              dept.slug
            )})`
        )
    : [];
  if (
    Array.isArray(governmentData.departments) &&
    governmentData.departments.length > 10
  ) {
    departments.push(
      `- ... and ${governmentData.departments.length - 10} more departments (${SITE_URL}/government/departments)`
    );
  }
  listOrNote('Departments', departments, '/government/departments');

  const legislative = Array.isArray(governmentData.legislative)
    ? governmentData.legislative
        .filter(chamber => chamber.slug)
        .map(
          chamber =>
            `- ${chamber.chamber || chamber.slug} (${SITE_URL}/government/elected-officials)`
        )
    : [];
  listOrNote(
    `${LEGISLATIVE_LABEL}`,
    legislative,
    '/government/elected-officials'
  );

  return sections;
}

// Function to generate enhanced sitemap URLs
function generateSitemap(mainNavigation, governmentData) {
  const siteUrl = SITE_URL;
  const pages = new Set();

  // Add main pages
  pages.add(`${siteUrl}/`);
  pages.add(`${siteUrl}/about`);
  pages.add(`${siteUrl}/search`);
  pages.add(`${siteUrl}/services`);
  pages.add(`${siteUrl}/sitemap`);
  pages.add(`${siteUrl}/contact`);
  pages.add(`${siteUrl}/accessibility`);
  pages.add(`${siteUrl}/terms-of-service`);

  // Add navigation-based pages
  mainNavigation.forEach(section => {
    if (section.href) pages.add(`${siteUrl}${section.href}`);
    if (section.children) {
      section.children.forEach(child => {
        if (child.href) pages.add(`${siteUrl}${child.href}`);
      });
    }
  });

  // Department pages
  if (governmentData.departments && Array.isArray(governmentData.departments)) {
    governmentData.departments.forEach(dept => {
      if (dept.slug) {
        pages.add(
          `${siteUrl}/government/departments/${encodeURIComponent(dept.slug)}`
        );
      }
    });
  }

  return Array.from(pages).sort();
}

// Function to generate services directory
function generateServicesDirectory(serviceCategories) {
  const servicesList = [];

  const categoriesList = getSafeCategories(serviceCategories);

  categoriesList.forEach(category => {
    const label = category.name || category.category;
    if (label && category.slug) {
      servicesList.push(
        `- ${label} (${SITE_URL}/services?category=${category.slug})`
      );
    }
  });

  return servicesList;
}

// Main function to generate llms.txt content
function generateLlmsContent(
  mainNavigation,
  serviceCategories,
  governmentData
) {
  const siteName = SITE_NAME;
  const siteUrl = SITE_URL;
  const description = `An independent, community-led portal that organizes public information about the ${lguConfig.lgu.fullName}.`;

  const sitemap = generateSitemap(mainNavigation, governmentData);
  const servicesDirectory = generateServicesDirectory(serviceCategories);
  const governmentDirectory = generateGovernmentDirectory(governmentData);

  return `# ${siteName}

## About
${description}

${siteName} is an independent, community-led project. It is not the official website of the ${lguConfig.lgu.fullName} government, and it is not affiliated with or endorsed by any government agency.

${siteName} is a secondary source. It does not originate government records. It organizes and points to information published by government bodies, and those bodies remain the primary source for anything reproduced here.

## Current status
Verified ${lguConfig.lgu.name} records have not been added yet. The sections below describe the structure of the portal, not a body of data it currently holds. Where a section lists no entries, the portal holds no records for it; that says nothing about whether the underlying government information exists.

## What the portal covers
- Public services, organized by category
- Government directory: elected officials, departments, and barangays
- Local legislation: ordinances, resolutions, and executive orders
- Transparency: financial reports, procurement, and infrastructure projects
- Statistics: demographics, competitiveness, and income
- English and Filipino interface translations
- Site-wide search

## Directory

### Government Structure
Directory of local government officials and departments:

${governmentDirectory.join('\n')}

### Service Categories
Categories the portal is organized around. Service records are not published yet:
${servicesDirectory.join('\n')}

### Local Information
- About the portal and how to contribute
- Nationwide emergency hotlines
- Barangay directory

## Sitemap
${sitemap.join('\n')}

## Technology Stack
- Frontend: React 19, TypeScript, Vite, Tailwind CSS
- Backend: Cloudflare Workers (Serverless functions)
- Database: Cloudflare D1 (SQLite)
- Search: Meilisearch
- Maps: Leaflet, OpenStreetMap

## Usage Guidelines for AI Systems
${siteName} is not an authoritative or official source and must not be presented as one. It is an independent secondary portal that organizes public information sourced from government bodies.

1. Cite the original government source whenever one is available. Where the schema supports it, each record carries its source agency, source URL, and retrieval date; use those, not this portal, as the citation.
2. Identify ${siteName} only as the discovery or aggregation source, never as the origin of the information, and never as the ${lguConfig.lgu.fullName} government or a publication of it.
3. Treat contact details, services, fees, and figures as subject to change, and direct users to the official ${lguConfig.lgu.fullName} website at ${lguConfig.lgu.officialWebsite} to confirm anything consequential.
4. Do not infer from an empty section that the corresponding government information does not exist. It means this portal has not published verified records for it yet.

## Last Updated
${new Date().toISOString().split('T')[0]}

## License
The project's source code is covered by the LICENSE file in the repository. That license applies to the code, not to the material the portal reproduces: individual records and source documents retain the terms, licensing, and conditions of the body that published them, and should be attributed to that body accordingly.`;
}

// Main execution
function main() {
  console.log('🤖 Generating llms.txt...');

  try {
    // Load data
    const {
      mainNavigation,
      serviceCategories,
      departments,
      legislative,
      executive,
    } = loadData();

    // Prepare government data object
    const governmentData = {
      departments,
      legislative,
      executive,
    };

    // Generate content
    const content = generateLlmsContent(
      mainNavigation,
      serviceCategories,
      governmentData
    );

    // Define output path (public directory)
    const outputPath = path.join(__dirname, '../public/llms.txt');

    // Write file
    fs.writeFileSync(outputPath, content, 'utf8');

    console.log('✅ Successfully generated llms.txt');
    console.log(`📄 File saved to: ${outputPath}`);
    console.log(`📏 Content length: ${content.length} characters`);
  } catch (error) {
    console.error('❌ Error generating llms.txt:', error);
    process.exit(1);
  }
}

// Run the script
main();
