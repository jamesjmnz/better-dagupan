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

## Worked example: the elected officials (November 2026)

An office exists whoever runs it. A name on the elected-officials page is a
different kind of claim: that this person holds this seat **now**. That is the
claim a reader is most likely to repeat, so it carries the strictest rule in the
portal.

### Four source families

| Family | Sources | Dated? |
|---|---|---|
| City officials pages | `/officials/city-mayor/`, `/officials/vice-mayor/` on dagupan.gov.ph, and the council site's `/vice-mayor/` | No. CMS stamps from 2023–2024, before the 2025 election |
| Council site | sp.dagupan.gov.ph `/councilor/` roster; "A New Era Begins: Welcoming Dagupan's 2025 Sangguniang Panlungsod" | Roster no; article 2025-08-18 |
| City news | The 2025 election report; articles of 28 January, 26 August and 8 October 2026 | Yes |
| COMELEC | 2025 results data for the City of Dagupan (region code 5518000) | Describes 2025-05-12 |

Two placements need explaining.

- The council site's vice-mayor page is published by a different body, but its
  profile text is the city page's, word for word. Two copies of one text are one
  statement, so it is counted in the **city officials pages** family.
- The city's news articles are separate, dated editorial acts, but they come
  from one newsroom, so they are counted as **one** family, not four.

### The name rule, and why nicknames do not count

A person is published in a seat only when two families name them there,
matched on surname **and** a given name, as for department heads.

Philippine election sources make this harder than it looks. COMELEC lists
candidates under their **ballot names**, and the city's election report follows
the campaign: "TAMAYO, ATTY JOEY", "SEEN, JIGS", "Dada Reyna". A nickname is not
a given name, so those mentions are **not counted**, however obvious the match
looks. Only five people appear in COMELEC under a given name the other sources
also use (Belen Fernandez, Bryan Kua, Michael Fernandez, Karlos Reyna, Marvin
Fabia), and COMELEC is cited for those five only.

The rule is encoded, not just described. `NAMED_AS` in
`electedOfficialsProvenance.test.ts` records every name exactly as each cited
source prints it. A record may cite a source only if its rendering is recorded
there and agrees with the published name; the test fails on a nickname, on a
shared surname alone (two Reynas and three Fernandezes sit in this government),
and on a citation with no recorded evidence behind it.

### What was published

| Seat | Name | Families agreeing |
|---|---|---|
| City Mayor | Belen T. Fernandez | City officials pages, city news (2025, 2026), COMELEC |
| City Vice Mayor, presiding officer | Dean Bryan L. Kua | City officials pages, council site, city news, COMELEC |
| Councilor (×10, elected) | Canto, Cayabyab, Fabia, M. B. Fernandez, Paras, K. L. E. Reyna IV, M. L. F. M. Reyna, Samson Jr., Seen, Tamayo | Council site (roster and 2025 article), city news (26 August 2026); COMELEC and the election report as well for Fabia, Fernandez and Reyna IV |
| Councilor, ex officio (Liga ng mga Barangay President) | Marcelino D. Fernandez | Council site, city news |
| Councilor, ex officio (SK Federation President) | Bradley Claude C. Benavides | Council site, city news |

**Spelling.** Names follow the council's own roster for its members and the
city's own profile page for the executive. Where a city article spells a name
differently ("Marvin V. Fabia" for "Marvin DV. Fabia", "Maria" for "Ma.", an
added middle initial "U." for Paras), the other spelling is kept in
`name_variants` against that source. Names are stored without honorifics and
rendered verbatim: `toTitleCase()` turned "DV." into "Dv." and "IV" into "Iv".

**Term.** "2025–2028" is recorded for the mayor, the vice mayor and the ten
elected members. No source prints that range. It follows from the 12 May 2025
election, which COMELEC and the city establish, and the three-year term of local
elective office; the council's 2025 article is what ties each member's full name
to that election. The test requires every stated term to cite one of those
sources.

**The vice mayor is recorded once.** The chamber's `presiding_officer` is the
slug of his `executive.json` seat, rather than a second copy of him in the
council roster that could drift from the first.

### What was withheld, and why

| Withheld | Why |
|---|---|
| All committee chairs and memberships (`committees_status: conflicting_sources`) | Only the council's member profiles list them, for five of twelve members, and they conflict: two profiles each claim the chair of the Committee on Health and Sanitation, and one claims the Committee on Environmental and Natural Resources, which a dated city article gives to a third councilor. One profile also dates its holder's service "2013 – Present" though the city reported her as a first-time councilor in 2025. |
| Terms of the two ex-officio seats | They follow the Liga and SK federation terms, which no cited source states. Borrowing the elected members' term would be inference. |
| Every phone number, email address and personal website | No source states one for an official. The office numbers are published on the department pages, against the office. |
| Biographies, photographs, office hours | Not needed to establish who holds a seat. The vice-mayor profile text, the only biography for him, describes him as a serving barangay captain and Liga president, which no longer fits his seat. |

The schema keeps `name_status` for every seat, so a seat whose holder the
sources disagree about can be published with its name withheld, exactly as an
office is published without its head. In this edition every seat is
corroborated, so the state is unused, but the interface already renders it.

### Assignments that rest on one family

The council's roster lists all twelve as "Councilor" and says only that two of
its seats come "from the ranks of barangay chairmen and the Sangguniang
Kabataan". **Which** two members hold those seats is stated by the city news
family alone, in two dated articles that name "Liga ng Barangay President Kap.
Marcelino Fernandez" and "Sangguniang Kabataan Federation President Bradley
Benavides". Their membership of the council is corroborated by two families;
the seat assignment is not, and is recorded here rather than presented as
stronger than it is.

### Noted, not asserted

City articles of August 2025 and August–September 2026 refer to "Acting Mayor"
Dean Bryan Kua. An acting mayor serves while the mayor is temporarily away, and
the city's other articles from the same days, and from October 2026, again
describe Belen Fernandez as Mayor. **No change in the seat is inferred.**

The ex-officio seats change hands with the barangay and SK federation cycle,
independently of the council term. The most recent source naming the current
holders is dated **8 October 2026**. Re-verify both seats after the next
barangay and Sangguniang Kabataan elections.

The councilor published as "Karlos Liberato E. Reyna IV" is the "Karlos Reyna"
in the office-directory note above. That remains suggestive about the stale
tourism-office roster, and remains unasserted there.

## Worked example: census population (November 2026)

The barangay index had one dated source and the office directory had several
undated ones that disagreed. The census series is the easy case in one sense —
every figure comes from the agency that counts — and the hard case in another:
one agency cannot corroborate itself independently, so the check has to come
from arithmetic and from separately issued publications agreeing.

### Sources

| Census | Reference date | Dagupan | Stated by |
|---|---|---|---|
| 2010 CPH | 2010-05-01 | 163,676 | 2024 POPCEN Table B; Pangasinan QuickStat (Oct 2024) |
| 2015 POPCEN | 2015-08-01 | 171,271 | 2015 Region I barangay table; PSA release 2016-064; Table B; QuickStat |
| 2020 CPH | 2020-05-01 | 174,302 | 2020 Region I barangay table; PSA press release 2021-316; Table B; QuickStat |
| 2024 POPCEN | 2024-07-01 | 174,777 | Table B; 2024 Region I Table C; the PSGC page |

All are PSA publications, released between 2016 and 2025 by the central office
and the Pangasinan provincial office. Each census count is published only
when **at least two** of them state it, and one of the two is always the
2024 Table B — the only document found that gives all four counts side by side.
The tests assert both.

Every source carries the census reference date as `data_as_of`, and its
release date as `published` where one is stated. The QuickStat is titled
"October 2024" but states no release date, so its `published` is null.

### Parts sum to the whole, every year

The PSA publishes barangay tables for 2015, 2020 and 2024. For each of the three,
the 31 barangay figures add up **exactly** to the city total in the same table,
and that total matches every other publication for that year. This is asserted
per year in `populationProvenance.test.ts`.

The 2024 barangay figures are **not** stored in `population.json`. They already
live in `directory/barangays.json`, where they cite the PSGC; the population
page joins them in by slug at runtime (`src/lib/populationStatistics.ts`). A
second copy would be a second thing to keep in step. The 2024 Region I Table C
agrees with all 31 PSGC figures and names, and is cited on the 2024 city count.

### Names across censuses

The 2015 and 2020 tables write three barangays with a parenthetical the current
PSGC omits: "Barangay I (T. Bugallon)", "Barangay II (Nueva)" and
"Barangay IV (Zamora)". They were matched to the PSGC names with the
parenthetical removed; the PSGC remains the naming authority, so only its names
are displayed. All other names match exactly across the three censuses.

### Growth rates are read, not computed

Table B publishes annual population growth rates. Three consecutive ones are
published here: 2010–2015 0.87, 2015–2020 0.37, 2020–2024 0.07 percent. The
fourth in the table, 2015–2024, overlaps the others and is left out. Nothing is
derived locally, but the test recomputes each rate from the counts with the
PSA's geometric formula, `r = (Pₜ/P₀)^(1/t) − 1` with `t` in months between
reference dates over 12, and requires agreement to two decimal places. All
three agree, which also confirms the reference dates.

### Withheld and noted

- **2010 barangay counts**: no 2010 barangay table was retrieved, so the barangay
  chart starts at 2015 and the page says so with `NotVerified`.
- **2000 and earlier**: a 2000 figure appears in non-government sources only;
  no PSA document stating it was retrieved.
- **The 2010 CPH release itself** was not located. 2010 rests on Table B and
  the QuickStat, which agree.
- **Land area and density**: no document from the land-area authority (the
  Land Management Bureau, DENR) was retrieved, so neither is published.
- **Not cited**: the PSA Region I release of 06 June 2016 repeats 171,271 for
  Dagupan but gives the regional total as 5,025,128 against 5,026,128 everywhere
  else, and Core Indicators table 1.55 agrees on all three Dagupan counts but
  shows `#REF!` spreadsheet errors in its national row. Both agree on every
  Dagupan figure; they are left out because cleaner sources state the same
  numbers.
- **Proclamations** No. 1179 (2021) and No. 973 (2025) declare the 2020 and 2024
  counts official, but the copies read state only the national total; their
  per-city annexes were not reproduced, so they are recorded in source notes
  rather than cited for Dagupan's figure.

## Note on retrieval

The city pages were read directly from their HTML rather than through a
summariser, because the reconciliation turns on exact digits and spellings.

`psa.gov.ph` returns HTTP 403 to plain command-line fetchers. The PSGC page was
read in an ordinary browser, where it serves normally. Nothing was bypassed and
no credentials were used; both sources are public government pages. The
census spreadsheets and releases were downloaded the same way and read cell by
cell rather than from a summary. If you automate any of this, respect the
publisher's terms and rate limits.

For the elected officials, both city sites were also read through their public
WordPress REST endpoints (`/wp-json/wp/v2/pages`, `/posts`, and the council
site's `/councilor` type), which return the same content as the pages with its
CMS dates. The COMELEC results website is a JavaScript application; its figures
were read from the public data file the application itself loads. Only
read-only GET requests were made, to public URLs, with no form submitted.
