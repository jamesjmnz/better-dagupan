/**
 * Shapes for the LGU directory datasets in src/data/directory/.
 *
 * These datasets are emptied until verified Dagupan records are sourced, so the
 * JSON files infer as never[] and every consumer has to state the element type
 * explicitly. Keeping the shapes here means the record structure survives the
 * empty period in one reviewable place, and matches
 * src/data/directory/schema/*.schema.json.
 */

/**
 * An alternative spelling of a barangay name observed on another authoritative
 * source, kept with the id of the source that spells it that way so the
 * disagreement stays attributable instead of being silently resolved.
 */
export interface BarangayNameVariant {
  name: string;
  /** Civic-source id, see src/data/sources/civic-sources.json. */
  source: string;
}

/** The elective seats a barangay record publishes. */
export type BarangaySeat = 'punong_barangay' | 'sk_chairperson';

/**
 * An elective seat in a barangay.
 *
 * Mirrors the `officials` items in
 * src/data/directory/schema/barangays.schema.json. The seat is published
 * whoever holds it, so a withheld name reads as a fact about this portal
 * rather than an empty office, as for the city's own elected seats.
 */
export interface BarangayOfficial {
  seat: BarangaySeat;
  /** The title of the seat, e.g. "Punong Barangay". */
  role: string;
  name_status: OfficialNameStatus;
  /**
   * The holder as the city's roster prints it, without honorifics. Render
   * verbatim: toTitleCase() lowercases initials such as "DV.". null unless two
   * independent source families name the same person in this seat.
   */
  name: string | null;
  /**
   * e.g. "2023–2028". A fact about the seat, so it is stated even when the
   * holder is withheld. null unless term_sources establish it.
   */
  term: string | null;
  /** Civic-source ids establishing the term: the laws it follows from. */
  term_sources: string[];
  /** Civic-source ids naming this person in this seat. Empty when withheld. */
  sources: string[];
}

/**
 * A barangay of the city.
 *
 * Every field here is either verified against a civic source or explicitly
 * unset. `null` and `[]` mean "not verified yet", never "does not exist" - the
 * barangays all have addresses, phone numbers and elected officials, we just
 * have no authoritative source for them yet, and the interface has to say so
 * rather than imply the information is absent.
 */
export interface Barangay {
  slug: string;
  /**
   * The official name as published in the PSGC, stored ready to render.
   * Do not pass this through toTitleCase(): it lowercases Roman numerals, so
   * "Barangay II" would reach the screen as "Barangay Ii".
   */
  barangay_name: string;
  name_variants: BarangayNameVariant[];
  /** PSGC 10-digit code, e.g. "0105518009". */
  psgc_10_digit_code: string;
  /** PSGC correspondence code, e.g. "015518009". */
  psgc_correspondence_code: string;
  urban_rural: 'urban' | 'rural';
  /** 2024 Census of Population, as published by the PSA. */
  population_2024_popcen: number;
  /** null until an authoritative address is sourced. */
  address: string | null;
  /** Empty until an authoritative contact number is sourced. */
  trunkline: string[];
  /** null until an authoritative page is sourced. */
  website: string | null;
  /**
   * One entry per elective seat: the Punong Barangay, then the Sangguniang
   * Kabataan Chairperson. Never populated from a superseded term.
   */
  officials: BarangayOfficial[];
  /** Civic-source ids backing this record. At least one, enforced by tests. */
  sources: string[];
}

/**
 * An alternative name the city uses for the same office on its own pages, kept
 * with the id of the source that uses it so a reader searching the name they
 * saw elsewhere still finds the office.
 */
export interface OfficeNameVariant {
  name: string;
  source: string;
}

/**
 * Why an office has no published head.
 *
 * The absence of a name never means the office has no head, so the reason is
 * recorded rather than left to be inferred from a null. `conflicting_sources`
 * means official pages name different people and nothing establishes which is
 * current; `uncorroborated` means fewer than two independent page families
 * name anyone at all.
 */
export type DepartmentHeadStatus =
  | 'published'
  | 'conflicting_sources'
  | 'uncorroborated';

export interface DepartmentHead {
  name: string;
  /** The position as published, e.g. "City Legal Officer", "Officer-in-charge". */
  title: string;
  contact: string | null;
  email: string | null;
  /**
   * Civic-source ids naming this person in this post. At least two, from at
   * least two independent page families: a single page is not enough to
   * establish that a head is current, and the city's Directory and
   * Officials-section rosters are near-clones of each other rather than
   * independent statements. The schema enforces the count; the provenance
   * test enforces the independence.
   */
  sources: string[];
}

export interface Department {
  slug: string;
  /**
   * The office name as published, stored ready to render. Do not pass this
   * through toTitleCase() or formatGovName(): both lowercase a whole word
   * before recapitalising it, which mangles the acronyms these names carry.
   */
  office_name: string;
  name_variants: OfficeNameVariant[];
  /** null until an authoritative address is sourced. */
  address: string | null;
  /** Empty until an authoritative contact number is sourced. */
  trunkline: string[];
  /** null until an authoritative page is sourced. */
  website: string | null;
  /** null until an authoritative address is sourced. */
  email: string | null;
  department_head_status: DepartmentHeadStatus;
  /** null unless the head is established. Never filled from one page alone. */
  department_head: DepartmentHead | null;
  /** Civic-source ids backing the office. At least one, enforced by tests. */
  sources: string[];
}

/**
 * Why an elected seat has, or has no, published holder.
 *
 * The same reasoning as DepartmentHeadStatus: a seat with no published name is
 * never an empty seat, so the reason is recorded rather than left to be
 * inferred from a null.
 */
export type OfficialNameStatus =
  | 'published'
  | 'conflicting_sources'
  | 'uncorroborated';

/**
 * A seat in the city executive: the City Mayor or the City Vice Mayor.
 *
 * The slug identifies the seat, not the person, so it survives a change of
 * office-holder. Mirrors src/data/directory/schema/executive.schema.json.
 */
export interface ExecutiveOfficial {
  slug: string;
  /** The seat as the city publishes it, e.g. "City Mayor". */
  role: string;
  isElected: boolean;
  name_status: OfficialNameStatus;
  /**
   * The office-holder as published, without honorifics, stored ready to
   * render. Do not pass it through toTitleCase(): it lowercases initials and
   * suffixes such as "DV." and "IV". null unless the name is established.
   */
  name: string | null;
  /** The office the official heads, as the city names it. */
  office: string | null;
  /** e.g. "2025–2028". null unless an election source establishes it. */
  term: string | null;
  address: string | null;
  /** null until a source states a number for the official. */
  phone: string | null;
  /** null until a source states an address for the official. */
  email: string | null;
  website: string | null;
  personId?: string;
  /**
   * Civic-source ids naming this person in this seat, from at least two
   * independent source families. Enforced by electedOfficialsProvenance.test.ts.
   */
  sources: string[];
}

/**
 * How a council seat is filled. Two of the council's seats are not elected at
 * large: they belong ex officio to the presidents of the city chapter of the
 * Liga ng mga Barangay and of the city federation of the Sangguniang Kabataan.
 */
export type CouncilSeat = 'elected' | 'ex_officio_liga' | 'ex_officio_sk';

/** Another spelling of an official's name on a cited source. */
export interface OfficialNameVariant {
  name: string;
  /** Civic-source id of the page that spells it this way. */
  source: string;
}

export interface CouncilOfficial {
  slug: string;
  /** The title as the council publishes it, e.g. "Councilor". */
  role: string;
  seat: CouncilSeat;
  name_status: OfficialNameStatus;
  /** As the council publishes it, without honorifics. Render verbatim. */
  name: string | null;
  name_variants: OfficialNameVariant[];
  /** null when no cited source establishes it, as for the ex-officio seats. */
  term: string | null;
  contact: string | null;
  website: string | null;
  personId?: string;
  sources: string[];
}

export interface CommitteeMember {
  name: string;
  role: string | null;
}

export interface PermanentCommittee {
  committee: string;
  chairperson: string;
  members: CommitteeMember[];
  sources: string[];
}

export interface LegislativeChamber {
  slug: string;
  branch: string;
  /** e.g. "Sangguniang Panlungsod". */
  chamber: string;
  /** Term of the elected membership. null unless an election source says. */
  term: string | null;
  address: string | null;
  trunkline: string | null;
  website: string | null;
  email: string | null;
  /** Slug of the executive.json seat that presides over the council. */
  presiding_officer: string | null;
  officials: CouncilOfficial[];
  /**
   * Why committee assignments are or are not published. Both withheld states
   * require permanent_committees to be empty.
   */
  committees_status: OfficialNameStatus;
  permanent_committees: PermanentCommittee[];
  /** Civic-source ids backing the chamber: its name, address, website, term. */
  sources: string[];
}

/** Display grouping for a city hotline, assigned by this portal. */
export type CityHotlineCategory =
  | 'police'
  | 'fire'
  | 'disaster'
  | 'health'
  | 'rescue'
  | 'utility'
  | 'employment'
  | 'social-welfare'
  | 'public-order';

/**
 * An emergency or public-service number the city government publishes.
 *
 * Mirrors src/data/directory/schema/hotlines.schema.json. A number appears
 * only when at least two independent official lists state it; entries the
 * city lists but this portal could not corroborate are left out entirely and
 * documented in docs/civic-data-verification.md.
 */
export interface CityHotline {
  slug: string;
  /** Short name as the city publishes it, e.g. "PNP Dagupan". */
  name: string;
  /** Longer name printed beneath it in the city directory, as published. */
  full_name: string | null;
  category: CityHotlineCategory;
  /** "(075) 529-5604" landlines and "0916-525-6802" mobiles, in city order. */
  numbers: string[];
  /** Civic-source ids, see src/data/sources/civic-sources.json. */
  sources: string[];
}
