## About Better Dagupan

Better Dagupan is an independent, community-led project. It is **not** the
official website of the City Government of Dagupan, and it is not affiliated
with or endorsed by any government agency. The official city website is
[dagupan.gov.ph](https://www.dagupan.gov.ph).

## Inspiration
The inspiration for Better Dagupan came from recognizing that the City of Dagupan deserved a modern, accessible portal that residents could actually rely on. Official government websites are often difficult to navigate on mobile, slow to update, and lack accessibility features. We wanted to build something community-driven and open-source — a portal that puts Dagupeños first.

The project builds on [BetterLB](https://github.com/BetterLosBanos/betterlb), the Los Baños portal by BetterLosBanos, which is itself a fork of [BetterGov.ph](https://bettergov.ph). The architecture, design system integration, and much of the supporting tooling are theirs, and that attribution stands.

## What it does
Better Dagupan is being built as a community portal for the City of Dagupan, offering:
- A modern, user-friendly interface for accessing city government services
- A public services directory with requirements, fees, and step-by-step processes
- A legislative portal with ordinances, resolutions, and executive orders from the Sangguniang Panlungsod
- A transparency dashboard covering financial statements, procurement, and infrastructure projects
- A government directory of city offices, barangays, elected officials, and emergency hotlines
- Statistics on population, city income, and competitiveness
- Multilingual support (English and Filipino)
- Mobile-responsive design for access on any device

## Current status
The portal was adapted from a template that shipped Los Baños' own government
records. Those records were removed rather than relabelled, because presenting
one city's departments, officials, barangays, budgets, and statistics as
another's would be worse than showing nothing. Sections were then refilled one
dataset at a time, each from primary government sources:

- **Barangays** — the 31 barangays of the City of Dagupan, from the Philippine
  Statistics Authority's PSGC, with codes, urban/rural classification, and 2024
  census population.
- **City offices** — 34 offices from the City Government of Dagupan's own
  pages. Office heads are named only where two independent official pages
  agree; 11 are withheld until a dated, authoritative roster is found.
- **Elected officials** — the City Mayor, the Vice Mayor, and the 12 members of
  the Sangguniang Panlungsod, each named by at least two independent source
  families. Committee assignments are withheld because the sources conflict.
- **Emergency hotlines** — 10 city entries with 25 numbers, each stated by two
  independent city lists.
- **Population** — PSA census counts for 2010, 2015, 2020, and 2024.
- **City finances** — Statements of Receipts and Expenditures and annual
  regular income from the Bureau of Local Government Finance.
- **Competitiveness** — DTI's Cities and Municipalities Competitiveness Index
  scores, 2014–2024.
- **History** — seven legal milestones from 1947 to 1973, each from the
  official text in the Supreme Court E-Library.
- **Services** — 10 business permit and clearance services from the city's
  Citizen's Charter. The city site was unreachable when they were read, so they
  come from archived copies of its pages and will be re-checked against the
  live pages.

Each record cites its source, and the pages show the agency, a link to the
document, and the date it was last verified. Where a fact could not be
verified, the page says so instead of leaving a blank. Procurement and
infrastructure come live from the PhilGEPS and DPWH data in BetterGov.ph's
shared search index, alongside the bid notices the city posts on its own site.

Legislation is the main gap. Until the legislative pipeline is re-keyed for
Dagupan, the legislative portal lists the ordinances the Sangguniang
Panlungsod posts on its own website and links back to them.

Further records follow `docs/civic-data-verification.md`. Readers can report a
wrong fact from any source note, through the portal's Report an error page.

The portal is not deployed yet and has no production domain.

## How we built it
The platform is built using modern web technologies:
- React 19 for the frontend framework
- TypeScript (strict mode) for type safety and better development experience
- Tailwind CSS v4 for responsive and maintainable styling
- The `@bettergov/kapwa` design system for semantic, accessible design tokens
- Radix UI for accessible component primitives
- Lucide React for consistent iconography
- React Router for client-side routing
- Vite for fast development and optimized builds
- Cloudflare Pages and D1 for deployment and legislative data storage
- BetterGov.ph's shared Meilisearch instance for procurement and infrastructure data, and Fuse.js for fuzzy search
- Node scripts for the legislative source pipeline, and Python scripts for service data

## Challenges we ran into
- Separating reusable template infrastructure from the previous LGU's civic records, which were not always labelled as such
- Reconciling official sources that disagree — the city publishes several department rosters at once, and they do not always name the same office heads
- Keeping the dates on a source distinct: when it was published, what date its content describes, and when it was last checked
- Implementing a responsive design that works across all device sizes
- Ensuring accessibility for residents with different abilities
- Managing multilingual support while keeping English and Filipino in step
- Keeping data accurate and traceable through community contribution workflows

## What we learned
- Inherited data is the hardest part of forking a civic portal: a search for the previous LGU's name does not find records that never mention it
- A field left empty and marked "not verified yet" is more honest than one filled from memory or from a single unconfirmed page
- Strategies for managing multilingual content effectively
- Approaches to building accessible local government portals
- How to design community contribution workflows that non-developers can participate in
- The importance of open data and transparency in local governance

## What's next for Better Dagupan
- Re-checking the Citizen's Charter services against the live city pages, and adding more services
- Adding audit reports and other financial transparency data
- Re-keying the legislative pipeline to the Sangguniang Panlungsod
- Growing the volunteer community of data auditors and translators
- Assigning a production domain and deploying the portal
