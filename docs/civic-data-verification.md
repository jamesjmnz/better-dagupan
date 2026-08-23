# Civic-data verification

How a fact gets published on Better Dagupan.

Better Dagupan is not the government. A reader has no reason to take its word
for anything, so every published civic record names the agency that published
it, links the exact document, and says when it was last checked. This document
describes the process and the structures that carry it.

## The rule

A record is published only if a current primary government source states it.
If a field cannot be verified, it is left explicitly unset and recorded as a
TODO. It is never filled with a placeholder, an estimate, or a value carried
over from a template.

`null` and `[]` mean **not verified yet**, never **does not exist**. Every
barangay has a hall, a phone number and elected officials; this portal simply
has no authoritative source for them yet, and the interface has to say that.

## Acceptable sources

In order of preference:

1. Philippine Statistics Authority (PSA), including the PSGC
2. The City Government of Dagupan
3. DILG, COA, DBM, PhilGEPS, the Official Gazette, and other national agencies

Not acceptable as a factual source: Wikipedia, blogs, personal profiles,
crowdsourced directories, and search-result snippets. They may be used to
*locate* a primary source, never to establish a fact.

Cross-check against at least two authoritative sources where possible. Where
sources disagree, document the conflict; publish the disputed value only when
one source is the naming or reporting authority for that field, and attribute
the alternative.

## Recording a source

Citations live in `src/data/sources/civic-sources.json`, validated by
`src/data/sources/schema/civic-sources.schema.json`:

| Field | Meaning |
|---|---|
| `id` | Stable identifier records cite. Never reused for a different document. |
| `agency` | The government body that published it. |
| `title` | The document or page title as published. |
| `url` | The exact URL the data was read from. |
| `published` | The date the publisher **released** this edition, or `null`. |
| `data_as_of` | The **reference date the content describes**, when stated. |
| `coverage` | The **period the content covers**, for documents describing a span. |
| `retrieved` | When it was read. |
| `verified` | When the citing records were last checked against it. |
| `licence` | Reuse terms, when stated. |
| `notes` | What it establishes, and any limits on it. |
| `derives_from` | Id of the authoritative source this one redistributes. |

Records reference sources by id rather than embedding citations, so a document
is described once and re-verifying it updates every record that depends on it.

### Dates are not interchangeable

Three different dates are easy to collapse into one, and doing so misstates the
data. Keep them apart:

- **`published`** — when the publisher released it. The 2Q 2026 PSGC was
  released on **2026-07-13**.
- **`data_as_of`** — what the content describes. That same release states the
  classification **as of 2026-06-30**.
- A **reference date inside the content** — the PSA page separately says
  "There are 31 barangays as of 31 July 2025". That applies to the count only,
  not to the codes or the population figures, so it belongs in `notes`, not in
  either date field.

Never label the `data_as_of` date as the publication date.

### Derivative sources are not corroboration

A source that redistributes another's dataset does not independently confirm it.
DILG's Masterlist of Barangays republishes the PSA PSGC file, so it is
catalogued with `derives_from: "psa-psgc-dagupan-2026q2"` and no record cites
it. The PSA dataset remains authoritative for the names, PSGC codes,
classifications and population.

A record's `sources` must therefore list only authoritative sources: never a
derivative one, and never one with a `coverage` period, which marks it as
historical. Both rules are asserted in `barangayProvenance.test.ts`.

### Historical sources

A document that covers a past period gets a `coverage` value, and anything taken
from it must be labelled with that period wherever it appears — for example
*"Historical city-page spelling (2018–2020): Herrero-Perez"*. Wording like
"also written as" is not acceptable for such content, because it implies the
value may be current when the source gives no evidence of that.

`getCivicSource()` in `src/lib/civicSources.ts` throws on an unknown id. A
record claiming a provenance that does not exist must fail loudly rather than
render a blank source line.

### Naming

These are **civic sources**, not *source records*. `CONTEXT.md` reserves
*source record*, *canonical record* and *field provenance* for the OpenLGU
legislative pipeline, where they mean raw observations reconciled through
staging and promotion in D1. Civic sources are hand-curated citations checked
by a person, with no pipeline behind them. Keep the terms distinct.

## Displaying provenance

- `SourceNote` (`src/components/civic/SourceNote.tsx`) renders the agency, a
  link to the document, and the last verification date.
- `NotVerified` (`src/components/civic/NotVerified.tsx`) marks an unverified
  detail. Its copy is a statement about this portal, not about the subject.

Wording matters more than styling here. "No contact listed" tells a reader the
barangay has no phone number, which is not something we know. "Better Dagupan
has not found an authoritative source for this detail yet" is true.

## Validating a dataset

```bash
node scripts/validate-json-schema.js <schema> <data.json>
npm run test -- --run
CI=true npx playwright test --project=chromium <spec>
```

Every dataset should have a test asserting, at minimum: schema validity, unique
identifiers, no duplicates, a resolvable citation on every record, no invented
personnel or contact details, and no inherited Los Baños content. See
`src/data/__tests__/barangayProvenance.test.ts` for the worked example.

Where a source publishes a total as well as its parts, assert that the parts
sum to the total. That single check caught more transcription classes than any
other assertion in the barangay dataset.

## Worked example: the barangay index (August 2026)

| | Source A | Source B |
|---|---|---|
| Agency | Philippine Statistics Authority | City Government of Dagupan |
| Document | PSGC — Barangays in the City of Dagupan (0105518000) | Barangay Captains |
| URL | https://psa.gov.ph/classification/psgc/barangays/0105518000 | https://www.dagupan.gov.ph/the-city/barangay-captains/ |
| Released (`published`) | 2026-07-13 ("Second Quarter 2026 PSGC Updates") | none stated |
| Content describes (`data_as_of`) | 2026-06-30 | — |
| Period covered (`coverage`) | — | 2018–2020 |
| Other date in the content | "There are 31 barangays as of 31 July 2025" (count only) | — |
| Retrieved | 2026-08-22 | 2026-08-22 |
| Role | Authoritative | Historical; cited only for four spellings |

**Agreement.** Both list the same 31 barangays.

**Verified and published:** official name, PSGC 10-digit and correspondence
codes, urban/rural classification, 2024 POPCEN population. The 31 populations
sum to 174,777, the city total on the same PSA page.

**Conflict.** Four names are spelled differently:

| PSGC (PSA) | City Government |
|---|---|
| Barangay II | Barangay II & III |
| Herrero | Herrero-Perez |
| Mangin | Manguin |
| Pugaro Suit | Pugaro |

The PSA is the naming authority for the PSGC, so its spelling is published as
`barangay_name`. The city page is historical — its table is headed "2018– 2020" —
so its spellings are kept in `name_variants` against that source and rendered as
*"Historical city-page spelling (2018–2020): …"*, with a note that this is not
evidence of the current official name. The search still matches them, so a
resident looking for "Herrero-Perez" is not left with nothing.

The historical source is deliberately **not** in each record's `sources` list.
Listing it there would imply a superseded page backs the published data.

**Intentionally omitted.** Officials, addresses, phone numbers and websites.
The only city-government roster found is headed "2018– 2020", three barangay
election cycles ago; publishing it would present former officials as current
ones. No authoritative source was located for the rest.

**Noted, not asserted.** PSGC code `0105518005` and a "Barangay III" are absent
from the current PSGC; the sequence skips from `…004` to `…006`. The absence is
asserted in the tests exactly as observed. **No reason for it is claimed** — no
document establishing a merger, deletion or renaming was found, so none is
stated. The city page listing "Barangay II & III" as one row is suggestive but
is a historical page and proves nothing about why the code is unused.

## Worked example: the office directory (August 2026)

The barangay index had one authoritative, dated source. The office directory
had the opposite problem, and it is the more common one.

### Three live rosters, none of them dated

| | Roster A | Roster A′ | Roster B |
|---|---|---|---|
| URL | `/directories/` | `/officials/department-heads/` | `/the-city/department-heads/` |
| Offices | 33 city + 6 others | 34 city | 32 city |
| Released (`published`) | none stated | none stated | none stated |
| CMS `article:modified_time` | 2026-07-14 06:16Z | 2026-07-14 05:27Z | 2026-07-14 06:35Z |

All three are live and return HTTP 200. They name a **different person** at
seven offices.

**The timestamps cannot rank them.** Every department page on the site was
re-saved inside the same 70 minutes, and the *newest* stamp belongs to Roster B,
which is also the one whose content looks most superseded. That is a bulk
re-save, not editorial currency. The timestamps are recorded in each source's
`notes` and deliberately **not** used as `published`.

Roster B is **not** given a `coverage` period either. The only evidence that it
is historical is inferential, and a `coverage` value both labels it historical
and bars records from citing it — which would throw away the corroboration it
genuinely provides at the 23 offices where all three agree.

### Corroboration is counted in families, not pages

Rosters A and A′ are near-clones: same table markup, same wording, same
honorifics, differing at two offices. Two of them agreeing is **one editorial
act repeated**, not two independent statements. So sources are grouped into
families, and a head is published only when two *families* name the same
person. That single distinction is why the Public Library head is withheld
despite appearing on two pages.

Names are matched on surname **and** an overlapping given name. A shared
surname alone is not agreement: "Angelinda M. Ngilay" and "Helen Ngilay" are
not established to be the same person.

### What was published

**23 heads**, each named identically by both families, with the position as
published and its own `sources` list — the head is a separate claim from the
office and carries its own citation.

**Contacts**, but only where **two of the four pages** state the value. The
pages are demonstrably unreliable in detail: one transposes the City Nutrition
Office number as `636-9483` for `636-9843`, and another lists the City Planning
Office's own `615-1416` under the Office of Senior Citizens Affairs. The rule
drops both without anyone having to spot them. It also drops 16 other
single-page values, which is why the General Services Office is published with
no contact at all rather than with an uncorroborated one.

### What was withheld, and why the office stayed

| Withheld | Count | `department_head_status` |
|---|---|---|
| Sources name different people | 7 | `conflicting_sources` |
| Only one family names anyone | 4 | `uncorroborated` |

In all 11 cases **the office is still published**. Withholding a name is a fact
about this portal, not about the office, and `department_head_status` exists so
the interface can say *which* of the two reasons applies rather than rendering
one vague blank. A reader looking for the City Health Office finds it, finds its
four corroborated numbers, and finds out why no head is named.

`null` would have said only "no head". That is not what we know.

### Intentionally omitted

Office hours: published for city hall as a whole and for the Mayor's Office
only, so applying them per office would be inference. Addresses for 33 of the
34 offices: the city publishes one that two pages corroborate. Websites: none
published anywhere.

PNP, BFP, the Philippine Red Cross, DECORP, PAMANA and the 14-row emergency
hotline table are excluded as not city government, and asserted absent by name
in `departmentProvenance.test.ts`.

### Noted, not asserted

Roster B names an "Engr. Karlos Reyna IV" as City Tourism Office head, while a
dated city article lists a "Karlos Reyna" among the councillors elected in May
2025. That is *suggestive* that Roster B is stale, and it is why the entry is
not treated as corroborating. **No claim is made that they are the same person**,
and no document establishing it was found.

## Note on retrieval

The city pages were read directly from their HTML rather than through a
summariser, because the reconciliation turns on exact digits and spellings.

`psa.gov.ph` returns HTTP 403 to plain command-line fetchers. The PSGC page was
read in an ordinary browser, where it serves normally. Nothing was bypassed and
no credentials were used; both sources are public government pages. If you
automate any of this, respect the publisher's terms and rate limits.
