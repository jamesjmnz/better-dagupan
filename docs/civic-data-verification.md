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

## Worked example: city emergency hotlines (November 2026)

A wrong digit here sends someone in an emergency to the wrong place, so the
office-directory rule is tightened rather than relaxed.

### One list on two pages

The city publishes a 14-row emergency list twice: as the second table on
`/directories/` (headed "Office | Mobile Number/s | Landline") and as
"Emergency Services" on `/contact-us/`. The entries, numbers and order are the
same. Under the office directory's contact rule — two of four *pages* — every
number on it would pass, with the list corroborating itself. So corroboration
is counted in **lists**, as it was for department heads:

| List | Pages |
|---|---|
| L1 emergency list | `/directories/` second table, `/contact-us/` |
| L2 roster A | `/directories/` first table, `/officials/department-heads/` |
| L3 roster B | `/the-city/department-heads/` |

A number is published only when **two of the three lists** state it.

### What was published

Ten entries, 25 numbers, every number on the city's list for those rows:

- PNP, BFP, CDRRMO, City Health Office and CSWDO — all three lists agree.
- PESO / OFW Desk — the landline is on all three; the mobile on L1 and L3.
- POSO — both mobiles are on L1 and L3. Roster A gives POSO only
  "(075) 529-9890", which is not on the emergency list and is not added.
- PANDA Volunteers, Red Cross Dagupan, DECORP — L1 and L2, but L2's evidence
  for these three is the first table of the same `/directories/` page; no other
  roster lists them. They are published on that basis and named as an
  exception in `hotlinesProvenance.test.ts`, so a fourth cannot slip in.

Names are the short forms on Contact Us ("PNP Dagupan"); `full_name` is the
second line printed in the Directory table, **as published**, including the
city's "Bureau of Fire" and "Public Employment and Services Office". Landlines
are written with the (075) area code that roster A prints. The `category` field
is a display grouping chosen by this portal, not something the city publishes.

### What was withheld

| Row | Number | Why |
|---|---|---|
| PAMANA (Dagupan City Water District) | 515-3140 | The same number is CSWDO's, which all three lists confirm; roster A writes it "(075 515-3140" with an unclosed parenthesis. A number cannot belong to both offices. |
| Anti-VAWC Helpline | 0933-378-8888 | L1 only. A site-wide search finds it on no other page. |
| Anti-Bullying Helpline | 0960-260-6036 | L1 only. |
| Anti-Suicide Helpline | 0969-045-1111 | L1 only. |

Withholding a crisis line is not a neutral choice, which is why the widget says
that some of the city's numbers are held back, and why the national hotlines,
including the NCMH mental-health crisis line, stay directly beneath the city
group. A second official source — a city
article, a CSWDO or health-office page, a DSWD or DOH listing — would release
each one.

### Re-verifying the source pages

The four city pages were already catalogued for the office directory. They were
re-read on 2026-11-10: each page's `article:modified_time` is unchanged from the
August reading, and every published department head and contact number was
re-checked against them. Only then were their `retrieved` and `verified` dates
moved forward, because `verified` speaks for every record citing a source, not
just the new one.

### Display

The numbers render in `CriticalHotlinesWidget`, now on the home page, as a
city group above the national hotlines, each a `tel:` link named "Call PNP
Dagupan at (075) 529-5604". `toTelUri()` previously recognised only the 049
area code inherited from the template, so every (075) landline — including the
office directory's — produced no link at all; it now accepts any area code.

## Worked example: the history timeline (November 2026)

Every other dataset describes the present. A timeline describes the past, and
the past of a city is where official fact and retold story sit closest
together. The rule here is narrower than anywhere else in the portal: an entry
is published only when the **official text of a law or order** states it, and
the timeline begins where those texts begin.

### Sources

| Instrument | Date it states | Official text read | Gazette citation printed on it |
|---|---|---|---|
| Republic Act No. 170, the city charter | 20 June 1947 | Supreme Court E-Library | 43 OG No. 7, 2690 (July 1947) |
| Executive Order No. 96 | 15 October 1947 | Supreme Court E-Library | 43 OG No. 11, 4554 (November 1947) |
| Executive Order No. 115 | 31 December 1947 | Supreme Court E-Library | 44 OG No. 1, 12 (January 1948) |
| Republic Act No. 484 | 10 June 1950 | Supreme Court E-Library | 46 OG No. 7, 2990 (July 1950) |
| Republic Act No. 2259 | 19 June 1959 | Supreme Court E-Library | 55 OG No. 30, 5705 (27 July 1959) |
| Republic Act No. 4291 | 19 June 1965 | Supreme Court E-Library | 62 OG No. 25, 4375 (20 June 1966) |
| Presidential Decree No. 235 | 6 July 1973 | Supreme Court E-Library | none printed |

The E-Library is the Supreme Court's own library of statutes and issuances,
so the agency recorded is the **Supreme Court of the Philippines**, and each
source notes the Gazette edition the text cites. The Official Gazette's own
website refused the request (HTTP 403), so the Gazette editions were not read
directly and are not catalogued as sources. Each source's `data_as_of` is the
date the instrument states for itself. The E-Library gives no date for its own
edition, so `published` is null.

lawphil.net was used only to **find** documents. Every text cited was then
read on the E-Library. Nothing rests on lawphil alone.

The city-published account is the Sangguniang Panlungsod's "History of
Dagupan" page (`dagupan-sp-about-us`). It is cited on one entry, the charter,
for the one statement it shares with the charter's own text: Republic Act
No. 170, 20 June 1947. The city government's own history page returned HTTP
504 on every attempt and was not read.

### Each entry is pinned to its instrument

The first source of every milestone is the official text of the instrument
the entry names. `aboutProvenance.test.ts` requires that source's title to
begin with that instrument's name and its `data_as_of` to equal the
milestone's date, so a date typed into the timeline cannot drift from the
document that establishes it. Dates are stored only as precisely as the source
states them (`YYYY`, `YYYY-MM` or `YYYY-MM-DD`), and `formatHistoryDate()`
never pads a year into a day.

### What was published

| Date | Entry |
|---|---|
| 1947-06-20 | City of Dagupan created (RA 170) |
| 1947-10-15 | Date of the city's organization fixed as 1 January 1948; Calasiao to be joined (EO 96) |
| 1947-12-31 | Same date restated; territory to be that of the municipality of Dagupan (EO 115) |
| 1950-06-10 | Municipal Board reconstituted; city voters qualified to vote for provincial officials (RA 484) |
| 1959-06-19 | City offices made elective; Dagupan named among the cities whose voters "shall not vote for provincial officials" (RA 2259) |
| 1965-06-19 | Four assistant city fiscals created, effective 2 January 1966 (RA 4291) |
| 1973-07-06 | City court expanded to three branches and an auxiliary judge (PD 235) |

Three highlights sit beside the timeline: chartered since 1947 (RA 170),
31 barangays (PSGC), and 174,777 residents (2024 POPCEN). The two figures
repeat values that `directory/barangays.json` and `statistics/population.json`
already publish, so the test requires them to agree with those datasets and to
cite sources those datasets also cite.

### Withheld, and why

| Withheld | Why |
|---|---|
| "City government organized on 1 January 1948" | Both executive orders **fix** that date; neither records that the organization took place. The Supreme Court decision that says it did (*Mejia v. Balolong*, G.R. No. L-1925, 16 September 1948) was found only on lawphil, not on the E-Library, so the date is published as fixed, not as having happened. |
| Placement in Pangasinan's fourth legislative district (1987) | It rests on the Ordinance appended to the 1987 Constitution. The E-Library's and the Official Gazette's copies of the Constitution do not include the Ordinance, and no other official copy was found. |
| "Independent component city" | The PSA's 2020 Region I release calls Dagupan one, but the PSA is not the classifying authority, and no classifying document was found. RA 484 (1950) made the city's voters qualified to vote for provincial officials; RA 2259 (1959) later says Dagupan's voters "shall not vote for provincial officials". Both statements are published as the laws make them. **No classification is inferred from them.** |
| Origin of the settlers, the names "Bacnotan" and "Nandaragupan" and their meaning, the colonial and revolutionary history, the 1945 landings, the charter's authorship | Stated only on the city-published page, or in unofficial retellings. Some could be published if clearly attributed to the city, but none is a legal or civic milestone, and a timeline that mixes attributed stories with statutes invites a reader to treat them as equally established. |
| The 16 July 1990 earthquake | The city page gives a magnitude. The national authority for it (PHIVOLCS) was not read, so neither the magnitude nor the entry is published. |

The section ends with `NotVerified`: the timeline begins in 1947 because
that is where official texts were found, not because the city has no earlier
history.

### Noted, not asserted

- EO 115 calls EO 96 "dated October 1, 1947". EO 96's own heading and
  signature both say 15 October, and that is the date published.
- A search-result summary attributed a different date for PD 235 to the
  Senate's Legislative Digital Resources. That page refused the request (HTTP
  403) and was not read. The decree states 6 July 1973 twice, so no conflict is
  recorded.
- RA 484's title reads "An Act to Amend the **Chapter** of the City of Dagupan"
  on the E-Library. It is kept as printed.
- While checking the PSGC on 2026-11-10, the PSA page showed a newer release,
  "Philippine Standard Geographic Code as of 30 September 2026" (released 12
  October 2026). It still lists 31 barangays and 174,777, but the barangay
  index cites the 2Q 2026 release and should be re-verified against the new one.

## Worked example: the city's receipts and expenditures (November 2026)

The census series had one agency stating each figure in several documents.
The fiscal data has one agency and one underlying system: every figure comes
from the Bureau of Local Government Finance (BLGF), compiled from the reports
the city treasurer files through BLGF's LIFT system. Nobody else publishes
them, so corroboration again comes from arithmetic and from separately issued
BLGF workbooks agreeing.

### Sources

All from BLGF's "LGU Fiscal Data" statistics page
(`blgf.gov.ph/lgu-fiscal-data/`), which links one XLSX per year and edition:

| Workbook | Editions read | Ids |
|---|---|---|
| Statement of Receipts and Expenditures (SRE) by LGU, annual | FY 2022, FY 2023, FY 2024 (Final), FY 2025 (Preliminary) | `blgf-sre-by-lgu-fy2022` … `-fy2025` |
| SRE by LGU, quarterly | FY 2022 to FY 2025 (four sheets each), FY 2026 third quarter | `blgf-sre-quarterly-fy2022` … `-fy2025`, `blgf-sre-quarterly-fy2026-q3` |
| Annual Regular Income (ARI) and Dependencies by LGU | FY 2022 to FY 2025 | `blgf-ari-by-lgu-fy2022` … `-fy2025` |

Each workbook has one row named "Dagupan City" (Region I, Pangasinan, LGU type
City) and no other row mentioning Dagupan. The window starts at FY 2022 by
choice, not because earlier years are missing: BLGF publishes SRE back to 1992
and ARI back to 2009, and any of them can be added the same way.

### The dates

- **`published` is null everywhere.** No workbook states a release date. Each
  carries an "Extraction date" on its Metadata sheet, which is when the data
  were pulled from LIFT, not when BLGF released them, and the HTTP
  `Last-Modified` header is an upload time. Both are recorded in `notes`,
  neither in a date field, as with the city's CMS timestamps.
- **`data_as_of` is null.** BLGF states no reference date; it states a fiscal
  period.
- **`coverage` holds that period** ("FY 2024", or "FY 2024, Q1 to Q4, each
  year to date"). This is the field's definition — the period a document
  covers — and the rule that goes with it, that anything taken from such a
  source is labelled with the period wherever it appears, is met: the pages
  print the fiscal year and quarter beside every figure. The barangay rule
  that a record must never cite a source with a `coverage` exists because
  those records describe the present; a fiscal statement describes only its
  period, and says so on screen. The tests assert the opposite rule here: a
  statement must cite the workbook whose coverage is its own year.
- **One extraction date is not relied on.** The FY 2025 ARI workbook's
  Metadata sheet says "November 27, 2025", the same as the FY 2024 edition and
  earlier than the FY 2025 SRE it is built from ("March 03, 2026"). It looks
  carried over, and the note says so.

### Units: pesos, not millions

Every sheet is headed "In Php Million", but the cells hold peso amounts that a
`#,##0.00,,` number format displays in millions. The records carry the cell
values, rounded to the centavo. The inherited Los Baños file stored rounded
millions, and the pages multiplied some figures by a million and not others;
both pages now format pesos throughout.

### Quarterly figures are year to date

BLGF's quarterly sheets are not three-month figures. Each covers January to
the end of the quarter:

- every Q4 sheet equals the full-year statement cell for cell (FY 2022, 2023
  and 2025; FY 2024 with the exception below);
- every statement opens with the same cash balance in all four quarters, and
  that balance is the previous year's closing balance.

The inherited financial page offered an "annual" view that **added the four
quarters together**, which would have counted January four times. It now shows
BLGF's full-year statement instead, or says that none exists (FY 2026), and
labels each quarter with what it spans ("Q3: January to September, year to
date"). Nothing is summed anywhere: every total on both pages is the one BLGF
states, and the inherited loader that recomputed totals from their parts is
gone.

### Checks

`sreProvenance.test.ts` and `ariProvenance.test.ts` assert, for all 21
statements and 4 ARI records:

- every total equals its parts, to half a centavo per part (local sources,
  external sources, current operating income and expenditures, net operating
  income, non-income receipts, non-operating expenditures, and the fund
  summary down to the closing balance);
- each Q4 statement equals its full-year statement;
- each year opens with the previous year's closing balance;
- ARI adds up by BLGF's own definition (LSR = RPT general fund + business tax
  + other taxes + regulatory fees + service charges + economic enterprises;
  ARI = LSR + allotment + other shares + interest income);
- BLGF's stored dependency ratios equal LSR, allotment and other shares over
  ARI, to 1e-8 — read, not computed, and checked;
- the eight lines ARI shares with the SRE are identical in the two workbooks
  for every year (interest income has no SRE column of its own);
- the full-year totals and ARI figures equal pinned values.

All pass.

### Conflict: two social-services lines, FY 2024 quarterly

Against the final FY 2024 statement, the FY 2024 quarterly workbook gives
**Labor and Employment** and **Housing and Community Development** the other
way round: Dagupan's Q4 reads 60,230,033.71 and 4,367,432.49 where the final
statement reads 4,367,432.49 and 60,230,033.71. Every other cell agrees. The
column headings are identical in both workbooks, and the swap is not
Dagupan's: it holds for 605 of the 1,716 LGUs in the file — every one whose
two values differ.

The final statement is very likely right — its order matches every other year
read for Dagupan, where housing is the larger line — but both are BLGF's own
releases, neither is a correction of the other, and "very likely" is
inference. So the two lines are **withheld for all four 2024 quarters**
(`withheld: conflicting_sources`, values `null`), the social-services total
both agree on is published, and the page says why with `NotVerified`. The
FY 2024 full-year statement, which has no rival edition of its own, is
published whole. Asking BLGF's Local Financial Data Analysis Division
(`lfdad@blgf.gov.ph`) which workbook is correct would settle it.

### Noted, not asserted

- **Status labels** are BLGF's only: "(Final)" on the FY 2024 sheets and
  "(Preliminary)" on FY 2025. The other editions say neither, so their status
  is null. The FY 2025 ARI is marked preliminary from BLGF's file name
  (`…2025Preliminary.xlsx`); the sheet heading says only "FY 2025". The
  inherited "Verified Audit" badge is gone: these are treasurer-filed reports,
  not audited statements, and nothing here is a COA finding.
- **The allotment's name.** The FY 2022 ARI heads the column "Internal Revenue
  Allotment (IRA)"; later editions "National Tax Allotment (NTA)". The page
  uses each edition's own name.
- **Income class.** The FY 2022 ARI workbook carries an "INCOME CLASS" column
  reading "2nd" for Dagupan. It describes that edition, not necessarily the
  city's class today, so it is recorded in the source note and not published.
  BLGF's "LGU Income Class" page links DOF Department Order No. 074-2024, the
  schedule under the first general reclassification under Republic Act
  No. 11964, but the copy linked is a 36-page scanned image; it was not
  transcribed here, so no current income class is published.
- **Use constraints.** Each workbook's Metadata sheet asks that BLGF be
  acknowledged as the source, allows citing or reproducing the data in whole
  or in part provided BLGF is "duly informed and/or recognized", and restricts
  reselling or redistributing it for viable purposes without written
  permission. Each source records this as its `licence`, and every figure is
  shown with a SourceNote naming BLGF.

## Worked example: competitiveness scores (November 2026)

The Cities and Municipalities Competitiveness Index (CMCI) is DTI's own
index, so there is one publisher and no second agency to corroborate it. As
with the census and the fiscal data, the checks are arithmetic and two DTI
presentations agreeing.

### Sources

| Page | Editions | Ids | Gives |
|---|---|---|---|
| LGU profile, `cmci.dti.gov.ph/lgu-profile.php?lgu=Dagupan&year=…` | 2014–2024 | `dti-cmci-dagupan-profile-<year>` | Category, overall rank, overall score to two decimals, each pillar's and indicator's rank and score |
| Rankings data, `…/rankings-data.php?unit=Component%20Cities&year=…` | 2015–2024 | `dti-cmci-rankings-component-cities-<year>` | Overall rank, overall score to four decimals, each pillar's rank and score |

The profile list has one "Dagupan", and every page read places it in
"REGION I (Ilocos Region)", Pangasinan, category "Component City". DTI's year
selector offers 2013, but its own page says the 2013 dataset has "rankings data
at the pillar level" only and redirects; the rankings-data page starts at
2015. So 2014 rests on the profile alone. No page states a publication date,
so `published` and `data_as_of` are null, and `coverage` is the edition
("CMCI 2024"), which the page shows beside every figure.

The two pages present **one database**. Their agreement — on every overall
rank and every pillar rank and score, for all ten shared years — checks the
transcription; it is not independent corroboration, and the notes say so. The
rankings table is cited for the four-decimal overall score; the profile's
two-decimal dial is that figure rounded in every year.

### Per edition, not per indicator

The inherited `cmci.json` mirrored a CSV of indicator rows across years. That
shape joins indicators across editions by name, and DTI's editions do not
support the join: it scored three pillars to 2016, added Resiliency in 2017
and Innovation in 2022, and renames, merges and redefines indicators between
editions ("Jobs", "Increase in Employment", "Employment Generation"). A shared
name in two years is not evidence of the same measure. So the file now holds
one record per edition, exactly as DTI published it, and the page shows the
methodology change in words beside the chart. The overall-score line is drawn
across all years because DTI publishes it for all of them; the note explains
that it sums a different set of measures before and after each change.

### Checks

`cmciProvenance.test.ts` asserts that:

- the overall score and rank equal pinned values for all eleven editions;
- the pillar scores add up to the overall score: within a unit in the fourth
  decimal per pillar (2018 sums to 48.4875 against DTI's 48.4876, 2017 and
  2021 likewise), and to two decimals for 2014;
- every published indicator breakdown adds up to its pillar score, within a
  unit in the fourth decimal per indicator;
- each edition carries exactly the pillars DTI scored that year;
- every rank is a positive whole number, and no larger than the peer count
  where DTI states one;
- every edition cites its own year's DTI pages.

### Withheld

**The 2014 Government Efficiency indicators.** The profile's table lists nine
indicators summing to 14.8815 against a pillar score of 17.3893, and the
chart on the same page names ten indicators — including "Business Registration
Efficiency", which the table omits — against nine values. DTI's own figures do
not reconcile, so that breakdown is withheld (`indicators_status:
inconsistent_in_source`) and the page says so; the pillar score and rank,
which agree with the overall score, are published.

**Peer counts for 2014–2016 and 2021.** The profile heads its indicator charts
"Component Cities (116)" in most years but prints "()" in those four. The
rankings tables could be counted, but a row count is this portal's arithmetic,
not DTI's statement, so those years show the category instead of "of N".

### Noted, not asserted

- DTI's category for Dagupan is "Component City". It is the peer group DTI
  ranks the city in, and is shown as DTI's category, not as a legal
  classification.
- Four Innovation indicators carry a score of 0.0000 with a rank of 2nd:
  "Online Payment Facilities" in 2022, 2023 and 2024, and "ICT Use: E-BPLS
  Software" in 2023. They are published as DTI states them, and they do not
  break the pillar sums; no reason for them is inferred.
- The 2024 profile also names a mayor and a 2024 population. Neither is taken
  from it; both are published elsewhere from their own authorities.

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

For the history timeline, the Supreme Court E-Library's documents were read
directly from their HTML, found through its monthly listings
(`/thebookshelf/docmonth/<Mon>/<year>/<category>`). The council's history page
was read through its WordPress REST endpoint. The PSGC pages and the Official
Gazette's copy of the Constitution were read in an ordinary browser window.

BLGF's site returns HTTP 403 to command-line fetchers. Its statistics page was
read in an ordinary browser, and each workbook was downloaded by that same
page with a plain same-origin request, exactly as a click on the link would.
The workbooks were then read cell by cell, including their number formats and
Metadata sheets, and the raw files were not committed. Only read-only GET
requests to public URLs were made.

DTI's CMCI portal also refuses command-line fetchers. Each profile and
rankings page was opened in an ordinary browser with the page's own year
selector, and read from the rendered tables and the chart data embedded in
the page; the rankings tables were read in full, not from a summary. Only
read-only GET requests to public URLs were made.
