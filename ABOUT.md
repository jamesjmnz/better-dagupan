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
- A transparency dashboard covering financial data, procurement bids, and infrastructure projects
- A government directory with contact information for city departments and officials
- Multilingual support (English and Filipino)
- Mobile-responsive design for access on any device

## Current status
The interface exists; the Dagupan civic data does not yet.

The portal was adapted from a template that shipped Los Baños' own government
records. Those records have been removed rather than relabelled, because
presenting one city's departments, officials, barangays, budgets, and statistics
as another's would be worse than showing nothing.

Every affected section now renders an honest empty state saying that verified
Dagupan information has not been added yet. Records will be sourced from primary
government sources — the City Government of Dagupan, the Philippine Statistics
Authority, the Commission on Audit, DBM, DILG, PhilGEPS, and the Official
Gazette — and verified before publication, with each dataset recording its
source and retrieval date.

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
- Meilisearch with Fuse.js for fast, fuzzy search
- Python pipeline for processing legislative PDFs

## Challenges we ran into
- Separating reusable template infrastructure from the previous LGU's civic records, which were not always labelled as such
- Sourcing, cleaning, and structuring legislative documents from official PDFs
- Organizing a large number of city services into a navigable directory
- Implementing a responsive design that works across all device sizes
- Ensuring accessibility for residents with different abilities
- Managing multilingual support while keeping English and Filipino in step
- Keeping data accurate and traceable through community contribution workflows

## What we learned
- Inherited data is the hardest part of forking a civic portal: a search for the previous LGU's name does not find records that never mention it
- Techniques for extracting and structuring data from government PDFs at scale
- Strategies for managing multilingual content effectively
- Approaches to building accessible local government portals
- How to design community contribution workflows that non-developers can participate in
- The importance of open data and transparency in local governance

## What's next for Better Dagupan
- Sourcing and verifying Dagupan's department, barangay, and elected-official directories
- Building out the public services directory and citizens charter
- Adding transparency data (budget execution, procurement, project tracking)
- Growing the volunteer community of data auditors and translators
- Assigning a production domain and deploying the portal
